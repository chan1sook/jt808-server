import { Jtt808LocationReportData } from "../main";
import { formatHex } from "../utils/utils";
import { Jtt808ProtocolData } from "./jtt808-protocol-data";

export class Jtt808InvalidDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Jtt808InvalidDataError";
  }
}

/**
 * JT/T808 Protocol Parser
 */
export class Jtt808ProtocolParser {
  /**
   * Parse raw buffer data to JT/T808 Protocol Data
   * @param buffer 
   * @returns Jtt808ProtocolData
   */
  parse(buffer: Buffer) : Jtt808ProtocolData {
    // get message id
    let protocolData: Jtt808ProtocolData;
    const messageId = buffer.readUInt16BE(1);
    switch(messageId) {
      case 0x0001:
      case 0x0002:
      case 0x0100:
      case 0x0102:
      case 0x0104:
        protocolData = new Jtt808ProtocolData(buffer);
        break;
      case 0x0200:
        protocolData = new Jtt808LocationReportData(buffer);
        break;
      case 0x0900:
      case 0x8001:
      case 0x8100:
      case 0x8103:
      case 0x8104:
      case 0x8105:
      case 0x8900:
      case 0x8A00:
        protocolData = new Jtt808ProtocolData(buffer);
        break;
      default:
        throw new Jtt808InvalidDataError(`Invalid Message ID [${formatHex(messageId, 4)}]`)
    }

    if(!protocolData.isMessageValid) {
      throw new Jtt808InvalidDataError(`Invalid Message Data [${formatHex(messageId, 4)}]`)
    }

    return protocolData;
  }
}