/// <reference types="node" />
declare const inspectCustom: unique symbol;
type Jtt808EncryptionMode = 'None' | 'RSA' | 'Invalid';
/**
 * JT/T808 Protocol Data
 */
export declare class Jtt808ProtocolData {
    #private;
    constructor(rawData: Buffer);
    /**
     * Message ID (Type of AOVX protocol message)
     */
    get messageType(): number;
    /**
     * Message Encryption Mode
     */
    get encryption(): Jtt808EncryptionMode;
    /**
     * Length of Protocol Message
     *
     * Check from Header (byte 1) to byte before checksum (byte n - 3)
     */
    get messageLength(): number;
    /**
     * Device Number
     */
    get deviceNumber(): string;
    /**
     * Message Counter
     */
    get messageCounter(): number;
    /**
     * Message Checksum Valid
     */
    get isChecksumValid(): boolean;
    /**
     * Message Raw Data
     */
    get rawData(): Buffer;
    /**
     * Unescaped Raw Data
     */
    get unescapedRawData(): Buffer;
    [inspectCustom](): string;
    get isMessageValid(): boolean;
}
export {};
