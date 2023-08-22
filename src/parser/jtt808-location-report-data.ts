import { readBcdBE } from "../utils/utils";
import { Jtt808ProtocolData } from "./jtt808-protocol-data";

type Jtt808NetworkType = 'Unregistered' | "GSM" | "LTE" | "CATM" | "NBIOT" | "Invalid";

/**
 * JT/T808 Location Report Data [0x0200]
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
    if(networkType === 0b000) {
      this.#networkType = "Unregistered";
    } else if(networkType === 0b001) {
      this.#networkType = "GSM";
    } else if(networkType === 0b010) {
      this.#networkType = "LTE";
    } else if(networkType === 0b011) {
      this.#networkType = "CATM";
    } else if(networkType === 0b100) {
      this.#networkType = "NBIOT";
    } else {
      this.#networkType = "Invalid";
    }
    this.#isTOWData = !!(gpsStatus & 0x40000000);
    this.#isBufferedData = !!(gpsStatus & 0x80000000);

    // Latitude data (21, 4 bytes)
    const latitude = unescapedRawData.readUInt32BE(21);
    const latValue = latitude / 10e5;
    if(isSouthern) {
      this.#latitude = -latValue;
    } else {
      this.#latitude = latValue;
    }
    
    // Longitude data (25, 4 bytes)
    const longitude = unescapedRawData.readUInt32BE(25);
    const lngValue = longitude / 10e5;
    if(isWestern) {
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
    const secBCD = readBcdBE(unescapedRawData, 10, 1);
    const sec = parseInt(secBCD, 10);

    this.#timestamp = new Date(Date.UTC(year, month - 1, date, hour, min, sec));

    // TODO parse extended data
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
}