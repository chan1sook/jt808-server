/// <reference types="node" />
import { Jtt808ProtocolData } from "./jtt808-protocol-data";
type Jtt808NetworkType = "Unregistered" | "GSM" | "LTE" | "CATM" | "NBIOT" | "Invalid";
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
    sensorXYZ?: {
        x: number;
        y: number;
        z: number;
    };
}
interface WifiData {
    macAddress: string;
    rssi: number;
}
interface GNSSExtraData {
    positionAge?: number;
    accOnDuration?: number;
    HDOP?: number;
    time?: Buffer;
}
/**
 * JT/T808 Location Report Data [0x0200]
 *
 * From protocol spec latitude, longitude has (0,0) default value.
 */
export declare class Jtt808LocationReportData extends Jtt808ProtocolData {
    #private;
    constructor(rawData: Buffer);
    get isOverspeed(): boolean;
    get isGNSSFault(): boolean;
    get isUnderVoltage(): boolean;
    get isPowerOff(): boolean;
    get isRemoveAlarm(): boolean;
    get isVibrationAlarm(): boolean;
    get isIllegalDisplacement(): boolean;
    get isACCOn(): boolean;
    get isGNSSPositionFixed(): boolean;
    get isVG300BlindDataMode(): boolean;
    get isIdleSpeed(): boolean;
    get isFuelDisconnected(): boolean;
    /**
     * GPS Network Type
     */
    get networkType(): Jtt808NetworkType;
    get isTOWData(): boolean;
    /**
     * Is Buffered Data
     *
     * true: Buffered data
     *
     * false: Real-time data
     */
    get isBufferedData(): boolean;
    /**
     * GPS Latitude
     *
     * Positive is Northern
     *
     * Negative is Southern
     */
    get latitude(): number;
    /**
     * GPS Longitude
     *
     * Positive is Eastern
     *
     * Negative is Western
     */
    get longitude(): number;
    /**
     * GPS Altitude in meter unit
     */
    get altitudeMeter(): number;
    /**
     * GPS Speed in km/hr unit
     */
    get speedKmHr(): number;
    /**
     * GPS Direction in Degree unit
     *
     * Start from North (0); Clockwise (to 359)
     */
    get directionDeg(): number;
    /**
     * GPS Timestamp
     */
    get timestamp(): Date;
    /**
     * Total Milleage in km unit
     *
     * undefined if not exists
     */
    get totalMilleage(): number | undefined;
    /**
     * Mobile Signal Strength
     *
     * undefined if not exists
     */
    get mobileSignalStrength(): number | undefined;
    /**
     * Base Station Data Array
     *
     * undefined if not exists
     */
    get baseStationDataArr(): BaseStationData[] | undefined;
    /**
     * Power Supply Voltage in mV
     *
     * undefined if not exists
     */
    get powerSupplyMv(): number | undefined;
    /**
     * Software Version
     *
     * undefined if not exists
     */
    get softwareVersion(): string | undefined;
    /**
     * Bluetooth Data Array
     *
     * undefined if not exists
     */
    get bluetoothDataArr(): BluetoothData[] | undefined;
    /**
     * Wifi Data Array
     *
     * undefined if not exists
     */
    get wifiDataArr(): WifiData[] | undefined;
    get extra0XF5(): Buffer | undefined;
    get extra0XF6(): Buffer | undefined;
    get extra0XF7(): Buffer | undefined;
    get extra0XF8(): Buffer | undefined;
    /**
     * GNSS Extra Data
     *
     * undefined if not exists
     */
    get gnssExtraData(): GNSSExtraData | undefined;
    toJSON(): {
        isOverspeed: boolean;
        isGNSSFault: boolean;
        isUnderVoltage: boolean;
        isPowerOff: boolean;
        isVibrationAlarm: boolean;
        isIllegalDisplacement: boolean;
        isACCOn: boolean;
        isGNSSPositionFixed: boolean;
        isVG300BlindDataMode: boolean;
        isIdleSpeed: boolean;
        isFuelDisconnected: boolean;
        networkType: Jtt808NetworkType;
        isTOWData: boolean;
        isBufferedData: boolean;
        latitude: number;
        longitude: number;
        altitudeMeter: number;
        speedKmHr: number;
        directionDeg: number;
        timestamp: Date;
        totalMilleage: number | undefined;
        mobileSignalStrength: number | undefined;
        baseStationDataArr: BaseStationData[] | undefined;
        powerSupplyMv: number | undefined;
        softwareVersion: string | undefined;
        bluetoothDataArr: BluetoothData[] | undefined;
        wifiDataArr: WifiData[] | undefined;
        extra0XF5: Buffer | undefined;
        extra0XF6: Buffer | undefined;
        extra0XF7: Buffer | undefined;
        extra0XF8: Buffer | undefined;
        gnssExtraData: {
            positionAge: number | undefined;
            accOnDuration: number | undefined;
            HDOP: number | undefined;
            time: string | undefined;
        } | undefined;
        rawData: string;
        unescapedRawData: string;
        deviceNumber: string;
        messageType: number;
        messageCounter: number;
        encryption: "None" | "RSA" | "Invalid";
        messageLength: number;
        isChecksumValid: boolean;
        isMessageValid: boolean;
    };
}
export {};
