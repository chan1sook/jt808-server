import { formatHex, readBcdBE, unescapeJtt808Buffer } from "../utils/utils";

const inspectCustom = Symbol.for('nodejs.util.inspect.custom');

type Jtt808EncryptionMode = 'None' | 'RSA' | 'Invalid';

/**
 * JT/T808 Protocol Data
 */
export class Jtt808ProtocolData {
  #messageType: number;
  #rawData: Buffer;
  #unescapedRawData: Buffer;
  #encryption: Jtt808EncryptionMode;
  #messageLength: number;
  #deviceNumber: string;
  #messageCounter: number;
  #isChecksumValid: boolean;

  constructor(rawData: Buffer) {
    this.#rawData = rawData;
    this.#unescapedRawData = unescapeJtt808Buffer(rawData);
    
    // Message type (1, 2 bytes)
    this.#messageType = this.#unescapedRawData.readUInt16BE(1);
    
    // Message property bytes (3, 2 bytes)
    // bit 9-0 => length
    // bit 12-10 => encryption
    // bit 15-13 => reserved: notused
    const messageProperty = this.#unescapedRawData.readUInt16BE(3);
    const messageLength = messageProperty & 0x01FF;
    this.#messageLength = messageLength;
    
    const messageEncrypt = (messageProperty & 0x0E00) >> 9;
    if(messageEncrypt === 0x0) {
      this.#encryption = 'None';
    } else if(messageEncrypt === 0x1) {
      this.#encryption = 'RSA';
    } else {
      this.#encryption = 'Invalid';
    }

    // Message Number (5, 6 bytes) 12 digits
    this.#deviceNumber = readBcdBE(this.#unescapedRawData, 5, 6);
    // Message Counter (11, 2 bytes)
    this.#messageCounter = this.#unescapedRawData.readUInt16BE(11);

    // Checksum Validation
    // get checksum byte from data (n - 2, 1 byte)
    const checksumXOR = this.#unescapedRawData.readUInt8(this.#unescapedRawData.length - 2);
    
    // XORing from header to byte before checksum (1 to n - 3)
    let actualChecksumXOR = this.#unescapedRawData.readUInt8(1);
    const lastDataByteIndex = this.#unescapedRawData.length - 3;
    for(let i = 2; i <= lastDataByteIndex; i++) {
      actualChecksumXOR ^= this.#unescapedRawData.readUInt8(i);
    }

    this.#isChecksumValid = actualChecksumXOR === checksumXOR;
  }

  /**
   * Message ID (Type of AOVX protocol message)
   */
  get messageType() {
    return this.#messageType;
  }

  /**
   * Message Encryption Mode
   */
  get encryption() {
    return this.#encryption;
  }

  /**
   * Length of Protocol Message
   * 
   * Check from Header (byte 1) to byte before checksum (byte n - 3)
   */
  get messageLength() {
    return this.#messageLength;
  }

  /**
   * Device Number
   */
  get deviceNumber() {
    return this.#deviceNumber;
  }

  /**
   * Message Counter
   */
  get messageCounter() {
    return this.#messageCounter;
  }

  /**
   * Message Checksum Valid
   */
  get isChecksumValid() {
    return this.#isChecksumValid;
  }
  
  /**
   * Message Raw Data
   */
  get rawData() {
    return this.#rawData;
  }

  /**
   * Unescaped Raw Data
   */
  get unescapedRawData() {
    return this.#unescapedRawData;
  }

  [inspectCustom]() {
    return `JT/T808[${formatHex(this.messageType, 4)},${this.deviceNumber}]`
  }

  get isMessageValid() {
    // start with 0x7E
    const packetHeader = this.#unescapedRawData.readUInt8(0);
    if(packetHeader != 0x7E) {
      return false;
    }

    // end with 0x7E
    const packetTailer = this.#unescapedRawData.readUInt8(this.#unescapedRawData.length - 1);
    if(packetTailer != 0x7E) {
      return false;
    }
    
    return this.#isChecksumValid;
  }
}