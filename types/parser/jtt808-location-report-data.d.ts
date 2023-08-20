/// <reference types="node" />
import { Jtt808ProtocolData } from "./jtt808-protocol-data";
type Jtt808NetworkType = 'Unregistered' | "GSM" | "LTE" | "CATM" | "NBIOT" | "Invalid";
/**
 * JT/T808 Location Report Data [0x0200]
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
}
export {};
