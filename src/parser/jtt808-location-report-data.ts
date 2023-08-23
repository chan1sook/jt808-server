import { readBcdBE } from "../utils/utils";
import { Jtt808ProtocolData } from "./jtt808-protocol-data";

type Jtt808NetworkType =
  | "Unregistered"
  | "GSM"
  | "LTE"
  | "CATM"
  | "NBIOT"
  | "Invalid";
interface BaseStationData {
  MCC: number;
  MNC: number;
  CI: number;
  LAC: number;
  RSSI: number;
}
interface BluetoothData {
  macAddress: string;
  rssi: number;
  deviceName?: string;
  firmwareVersion?: string;
  voltage?: number;
  temperature?: number;
  humidity?: number;
  sensorXYZ?: { x: number; y: number; z: number };
}
interface WifiData {
  macAddress: string;
  rssi: number;
}

interface GNSSExtraData {
  positionAge?: number,
  accOnDuration?: number,
  HDOP?: number,
  time?: Buffer,
}

/**
 * JT/T808 Location Report Data [0x0200]
 *
 * From protocol spec latitude, longitude has (0,0) default value.
 */
export class Jtt808LocationReportData extends Jtt808ProtocolData {
  #isOverspeed: boolean;
  #isGNSSFault: boolean;
  #isUnderVoltage: boolean;
  #isPowerOff: boolean;
  #isRemoveAlarm: boolean;
  #isVibrationAlarm: boolean;
  #isIllegalDisplacement: boolean;

  #isACCOn: boolean;
  #isGNSSPositionFixed: boolean;
  #isVG300BlindDataMode: boolean;
  #isIdleSpeed: boolean;
  #isFuelDisconnected: boolean;
  #networkType: Jtt808NetworkType;
  #isTOWData: boolean;
  #isBufferedData: boolean;

  #latitude: number;
  #longitude: number;
  #altitudeMeter: number;
  #speedKmHr: number;
  #directionDeg: number;
  #timestamp: Date;

  // extra data
  #totalMilleage?: number;
  #mobileSignalStrength?: number;
  #baseStationDataArr?: BaseStationData[];
  #powerSupplyMv?: number;
  #softwareVersion?: string;
  #bluetoothDataArr?: BluetoothData[];
  #wifiDataArr?: WifiData[];

  // TODO parse here
  #extra0XF5?: Buffer;
  #extra0XF6?: Buffer;
  #extra0XF7?: Buffer;
  #extra0XF8?: Buffer;
  
  #gnssExtraData?: GNSSExtraData;

  constructor(rawData: Buffer) {
    super(rawData);

    const unescapedRawData = this.unescapedRawData;

    // TODO: find actual translation of that words

    // Alarm status (13, 4 bytes)
    // bit 1: Overspeed alarm
    // bit 4: GNSS fault
    // bit 7: Device main power under voltage
    // bit 8: Device main power off
    // bit 15: Remove alarm
    // bit 16: Vibration alarm
    // bit 28: Illegal displacement of the vehicle
    // bit 31: Reserved
    const alarmStatus = unescapedRawData.readUInt32BE(13);

    this.#isOverspeed = !!(alarmStatus & 0x00000002);
    this.#isGNSSFault = !!(alarmStatus & 0x00000010);
    this.#isUnderVoltage = !!(alarmStatus & 0x00000080);
    this.#isPowerOff = !!(alarmStatus & 0x00000100);
    this.#isRemoveAlarm = !!(alarmStatus & 0x00008000);
    this.#isVibrationAlarm = !!(alarmStatus & 0x00010000);
    this.#isIllegalDisplacement = !!(alarmStatus & 0x10000000);

    // GPS status (17, 4 bytes)
    // Bit 6-9 Bit11-26: Reserved default is 0
    // bit 0: 0-ACC off  1-ACC on
    // bit 1: 0-GNSS position unfix  1-GNSS position fix
    // bit 2: 0-north latitude 1-south latitude
    // bit 3: 0-east longitude 1-west longitude
    // bit 4: 0-real time data flag 1-blind data flag（Only for VG300 flag bits)
    // bit 5: 0-Non idle speed  1-dle speed
    // bit 10: 0-fuel connect 1-fuel disconnect
    // bit 27-29: network modes; 000-UNREGISTERED; 001-GSM; 010-LTE; 011-CATM; 100-NBIOT
    // bit 30: 0-normal data 1-TOW data
    // bit 31: 0-real time data 1-buffer data
    const gpsStatus = unescapedRawData.readUInt32BE(17);

    this.#isACCOn = !!(gpsStatus & 0x00000001);
    this.#isGNSSPositionFixed = !!(gpsStatus & 0x00000002);
    const isSouthern = !!(gpsStatus & 0x00000004);
    const isWestern = !!(gpsStatus & 0x00000008);
    this.#isVG300BlindDataMode = !!(gpsStatus & 0x00000010);
    this.#isIdleSpeed = !!(gpsStatus & 0x00000020);
    this.#isFuelDisconnected = !!(gpsStatus & 0x00000400);
    const networkType = (gpsStatus & 0x38000000) >> 27;
    if (networkType === 0b000) {
      this.#networkType = "Unregistered";
    } else if (networkType === 0b001) {
      this.#networkType = "GSM";
    } else if (networkType === 0b010) {
      this.#networkType = "LTE";
    } else if (networkType === 0b011) {
      this.#networkType = "CATM";
    } else if (networkType === 0b100) {
      this.#networkType = "NBIOT";
    } else {
      this.#networkType = "Invalid";
    }
    this.#isTOWData = !!(gpsStatus & 0x40000000);
    this.#isBufferedData = !!(gpsStatus & 0x80000000);

    // Latitude data (21, 4 bytes)
    const latitude = unescapedRawData.readUInt32BE(21);
    const latValue = latitude / 10e5;
    if (isSouthern) {
      this.#latitude = -latValue;
    } else {
      this.#latitude = latValue;
    }

    // Longitude data (25, 4 bytes)
    const longitude = unescapedRawData.readUInt32BE(25);
    const lngValue = longitude / 10e5;
    if (isWestern) {
      this.#longitude = -lngValue;
    } else {
      this.#longitude = lngValue;
    }

    // Altitude data (29, 2 bytes)
    this.#altitudeMeter = unescapedRawData.readUInt16BE(29);

    // TODO what is 1/10 km/hr
    // Speed data (31, 2 bytes)
    const speed = unescapedRawData.readUInt16BE(31);
    this.#speedKmHr = speed * 10;

    // Direction data (33, 2 bytes)
    this.#directionDeg = unescapedRawData.readUInt16BE(33);

    // Time data (35, 6 bytes) bcd;
    // YY-MM-DD-hh-mm-ss UTC
    const yearBCD = readBcdBE(unescapedRawData, 35, 1);
    const year = 2000 + parseInt(yearBCD, 10); // assume in year 2000
    const monthBCD = readBcdBE(unescapedRawData, 36, 1);
    const month = parseInt(monthBCD, 10);
    const dateBCD = readBcdBE(unescapedRawData, 37, 1);
    const date = parseInt(dateBCD, 10);
    const hourBCD = readBcdBE(unescapedRawData, 38, 1);
    const hour = parseInt(hourBCD, 10);
    const minBCD = readBcdBE(unescapedRawData, 39, 1);
    const min = parseInt(minBCD, 10);
    const secBCD = readBcdBE(unescapedRawData, 40, 1);
    const sec = parseInt(secBCD, 10);

    this.#timestamp = new Date(Date.UTC(year, month - 1, date, hour, min, sec));

    // extended data
    // start from byte 41 to n - 3
    let bytePointer = 41;
    let bytePointer2: number;
    let bitmask;
    while (bytePointer < unescapedRawData.length - 2) {
      const header = unescapedRawData.readUInt8(bytePointer);
      const extraLength = unescapedRawData.readUInt8(bytePointer + 1);
      switch (header) {
        case 0x01:
          // milleage: 4 bytes *single
          // byte 0-3: total mileage
          // TODO what is 1/10 km
          this.#totalMilleage =
            unescapedRawData.readUInt32BE(bytePointer + 2) * 10; // 4 bytes
          break;
        case 0x30:
          // mobile signal strength: 1 byte
          // byte 0: signal strength
          this.#mobileSignalStrength = unescapedRawData.readUInt8(
            bytePointer + 2
          );
          break;
        case 0xf0:
          // stationData: 13m byte
          this.#baseStationDataArr = [];
          bytePointer2 = bytePointer + 2;
          while (bytePointer2 < bytePointer + 2 + extraLength) {
            const stationData: BaseStationData = {
              MCC: unescapedRawData.readUInt16BE(bytePointer2),
              MNC: unescapedRawData.readUInt16BE(bytePointer2 + 2),
              CI: unescapedRawData.readUInt32BE(bytePointer2 + 4),
              LAC: unescapedRawData.readUInt32BE(bytePointer2 + 8),
              RSSI: unescapedRawData.readUInt8(bytePointer2 + 12),
            };
            this.#baseStationDataArr.push(stationData);
            bytePointer2 += 13;
          }
          break;
        case 0xf1:
          // power supply: 4 bytes
          // byte 0-3: power supply in mv
          this.#powerSupplyMv = unescapedRawData.readUInt32BE(bytePointer + 2);
          break;
        case 0xf2:
          // software version: n bytes
          // byte 0-n: software version string
          this.#softwareVersion = unescapedRawData
            .subarray(bytePointer + 2, extraLength)
            .toString();
          break;
        case 0xf3:
          // bluetoothData: 1 + varaints bytes
          this.#bluetoothDataArr = [];
          // byte 0: bitmask
          bitmask = unescapedRawData.readUInt8(bytePointer + 2);
          bytePointer2 = bytePointer + 3;
          while (bytePointer2 < bytePointer + 2 + extraLength) {
            // byte 1-n: Data
            // 1st 6 bytes: mac (required)
            // 2nd 1 byte: rssi (required)
            const bluetoothData: BluetoothData = {
              macAddress: unescapedRawData
                .subarray(bytePointer2 + 1, 6)
                .toString("hex"),
              rssi: unescapedRawData.readInt8(bytePointer2 + 7),
            };
            bytePointer2 += 8;

            // {optional; defined from bitmask byte}
            // 3rd 10 bytes: name (optional 0)
            if (bitmask & 0b00000001) {
              bluetoothData.deviceName = unescapedRawData
                .subarray(bytePointer2, 10)
                .toString();
              bytePointer2 += 10;
            }
            // 4th 2 bytes: fwVersion (optional 1)
            if (bitmask & 0b00000010) {
              bluetoothData.firmwareVersion = readBcdBE(
                unescapedRawData,
                bytePointer2,
                2
              );
              bytePointer2 += 2;
            }
            // 5th 2 bytes: voltage (optional 2)
            if (bitmask & 0b00000100) {
              bluetoothData.voltage =
                unescapedRawData.readUInt16BE(bytePointer2);
              bytePointer2 += 2;
            }
            // TODO unit conversion
            // 6th 2 bytes: temperature (optional 3)
            if (bitmask & 0b00001000) {
              bluetoothData.temperature =
                unescapedRawData.readInt16BE(bytePointer2);
              bytePointer2 += 2;
            }
            // TODO unit conversion
            // 7th 2 bytes: humidity (optional 4)
            if (bitmask & 0b00010000) {
              bluetoothData.humidity =
                unescapedRawData.readInt16BE(bytePointer2);
              bytePointer2 += 2;
            }
            // TODO what sensor, unit conversion
            // 8th 6 bytes: sensorXYZ (optional 5)
            if (bitmask & 0b00100000) {
              bluetoothData.sensorXYZ = {
                x: unescapedRawData.readInt16BE(bytePointer2),
                y: unescapedRawData.readInt16BE(bytePointer2 + 2),
                z: unescapedRawData.readInt16BE(bytePointer2 + 4),
              };
              bytePointer2 += 6;
            }
            // 9th 2 bytes: Reserved (optional 6)
            // 10th 2 bytes: Reserved (optional 7)
            this.#bluetoothDataArr.push(bluetoothData);
          }
          break;
        case 0xf4:
          // wifi data: 7m bytes
          this.#wifiDataArr = [];
          bytePointer2 = bytePointer + 2;
          while (bytePointer2 < bytePointer + 2 + extraLength) {
            const wifiData: WifiData = {
              macAddress: unescapedRawData
                .subarray(bytePointer2, 6)
                .toString("hex"),
              rssi: unescapedRawData.readInt8(bytePointer2 + 6),
            };
            this.#wifiDataArr.push(wifiData);
            bytePointer2 += 7;
          }
          break;
        case 0xf5:
          this.#extra0XF5 = unescapedRawData.subarray(bytePointer + 2, extraLength);
          break;
        case 0xf6:
          this.#extra0XF6 = unescapedRawData.subarray(bytePointer + 2, extraLength);
          break;
        case 0xf7:
          this.#extra0XF7 = unescapedRawData.subarray(bytePointer + 2, extraLength);
          break;
        case 0xf8:
          this.#extra0XF8 = unescapedRawData.subarray(bytePointer + 2, extraLength);
          break;
        case 0xf9:
          // Parse GNSS Data: 2+variant bytes
          const gnssExtraData: GNSSExtraData = {};
          // byte 0-1: bitmask
          bitmask = unescapedRawData.readUInt16BE(bytePointer + 2);
          bytePointer2 = bytePointer + 4;
          if(bitmask & 0x0001) {
            gnssExtraData.positionAge = unescapedRawData.readUInt32BE(bytePointer2);
            bytePointer2 += 4;
          }
          if(bitmask & 0x0002) {
            gnssExtraData.accOnDuration = unescapedRawData.readUInt32BE(bytePointer2);
            bytePointer2 += 4;
          }
          if(bitmask & 0x0004) {
            gnssExtraData.HDOP = unescapedRawData.readUInt16BE(bytePointer2);
            bytePointer2 += 2;
          }
          if(bitmask & 0x0008) {
            gnssExtraData.time = unescapedRawData.subarray(bytePointer2, 6);
            bytePointer2 += 6;
          }
          this.#gnssExtraData = gnssExtraData;
          break;
      }

      bytePointer += 2 + extraLength;
    }
  }

  get isOverspeed() {
    return this.#isOverspeed;
  }

  get isGNSSFault() {
    return this.#isGNSSFault;
  }

  get isUnderVoltage() {
    return this.#isUnderVoltage;
  }

  get isPowerOff() {
    return this.#isPowerOff;
  }

  get isRemoveAlarm() {
    return this.#isRemoveAlarm;
  }

  get isVibrationAlarm() {
    return this.#isVibrationAlarm;
  }

  get isIllegalDisplacement() {
    return this.#isIllegalDisplacement;
  }

  get isACCOn() {
    return this.#isACCOn;
  }

  get isGNSSPositionFixed() {
    return this.#isGNSSPositionFixed;
  }

  get isVG300BlindDataMode() {
    return this.#isVG300BlindDataMode;
  }

  get isIdleSpeed() {
    return this.#isIdleSpeed;
  }

  get isFuelDisconnected() {
    return this.#isFuelDisconnected;
  }

  /**
   * GPS Network Type
   */
  get networkType() {
    return this.#networkType;
  }

  get isTOWData() {
    return this.#isTOWData;
  }

  /**
   * Is Buffered Data
   *
   * true: Buffered data
   *
   * false: Real-time data
   */
  get isBufferedData() {
    return this.#isBufferedData;
  }

  /**
   * GPS Latitude
   *
   * Positive is Northern
   *
   * Negative is Southern
   */
  get latitude() {
    return this.#latitude;
  }

  /**
   * GPS Longitude
   *
   * Positive is Eastern
   *
   * Negative is Western
   */
  get longitude() {
    return this.#longitude;
  }

  /**
   * GPS Altitude in meter unit
   */
  get altitudeMeter() {
    return this.#altitudeMeter;
  }

  /**
   * GPS Speed in km/hr unit
   */
  get speedKmHr() {
    return this.#speedKmHr;
  }

  /**
   * GPS Direction in Degree unit
   *
   * Start from North (0); Clockwise (to 359)
   */
  get directionDeg() {
    return this.#directionDeg;
  }

  /**
   * GPS Timestamp
   */
  get timestamp() {
    return this.#timestamp;
  }

  /**
   * Total Milleage in km unit
   *
   * undefined if not exists
   */
  get totalMilleage() {
    return this.#totalMilleage;
  }

  /**
   * Mobile Signal Strength
   *
   * undefined if not exists
   */
  get mobileSignalStrength() {
    return this.#mobileSignalStrength;
  }

  /**
   * Base Station Data Array
   *
   * undefined if not exists
   */
  get baseStationDataArr() {
    return this.#baseStationDataArr;
  }

  /**
   * Power Supply Voltage in mV
   *
   * undefined if not exists
   */
  get powerSupplyMv() {
    return this.#powerSupplyMv;
  }

  /**
   * Software Version
   *
   * undefined if not exists
   */
  get softwareVersion() {
    return this.#softwareVersion;
  }

  /**
   * Bluetooth Data Array
   *
   * undefined if not exists
   */
  get bluetoothDataArr() {
    return this.#bluetoothDataArr;
  }

  /**
   * Wifi Data Array
   *
   * undefined if not exists
   */
  get wifiDataArr() {
    return this.#wifiDataArr;
  }

  get extra0XF5() {
    return this.#extra0XF5;
  }
  get extra0XF6() {
    return this.#extra0XF6;
  }
  get extra0XF7() {
    return this.#extra0XF7;
  }
  get extra0XF8() {
    return this.#extra0XF8;
  }

  /**
   * GNSS Extra Data
   * 
   * undefined if not exists
   */
  get gnssExtraData() {
    return this.#gnssExtraData;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      isOverspeed: this.isOverspeed,
      isGNSSFault: this.isGNSSFault,
      isUnderVoltage: this.isUnderVoltage,
      isPowerOff: this.isPowerOff,
      isVibrationAlarm: this.isVibrationAlarm,
      isIllegalDisplacement: this.isIllegalDisplacement,
      isACCOn: this.isACCOn,
      isGNSSPositionFixed: this.isGNSSPositionFixed,
      isVG300BlindDataMode: this.isVG300BlindDataMode,
      isIdleSpeed: this.isIdleSpeed,
      isFuelDisconnected: this.isFuelDisconnected,
      networkType: this.networkType,
      isTOWData: this.isTOWData,
      isBufferedData: this.isBufferedData,
      latitude: this.latitude,
      longitude: this.longitude,
      altitudeMeter: this.altitudeMeter,
      speedKmHr: this.speedKmHr,
      directionDeg: this.directionDeg,
      timestamp: this.timestamp,
      totalMilleage: this.totalMilleage,
      mobileSignalStrength: this.mobileSignalStrength,
      baseStationDataArr: this.baseStationDataArr,
      powerSupplyMv: this.powerSupplyMv,
      softwareVersion: this.softwareVersion,
      bluetoothDataArr: this.bluetoothDataArr,
      wifiDataArr: this.wifiDataArr,
      extra0XF5: this.extra0XF5,
      extra0XF6: this.extra0XF6,
      extra0XF7: this.extra0XF7,
      extra0XF8: this.extra0XF8,
      gnssExtraData: this.gnssExtraData ? {
        positionAge: this.gnssExtraData.positionAge,
        accOnDuration: this.gnssExtraData.accOnDuration,
        HDOP: this.gnssExtraData.HDOP,
        time: this.gnssExtraData.time?.toString("hex"),
      } : undefined,
    };
  }
}
