/// <reference types="node" />
import { Jtt808ProtocolData } from "./jtt808-protocol-data";
export declare class Jtt808InvalidDataError extends Error {
    constructor(message: string);
}
/**
 * JT/T808 Protocol Parser
 */
export declare class Jtt808ProtocolParser {
    /**
     * Parse raw buffer data to JT/T808 Protocol Data
     * @param buffer
     * @returns Jtt808ProtocolData
     */
    parse(buffer: Buffer): Jtt808ProtocolData;
}
