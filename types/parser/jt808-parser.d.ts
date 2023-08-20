/// <reference types="node" />
declare const inspectCustom: unique symbol;
/**
 * JT/T808 Protocol Data
 */
export declare class Jtt808ProtocolData {
    #private;
    constructor({ messageId }: {
        messageId: number;
    });
    get messageId(): number;
    [inspectCustom](): string;
}
/**
 * JT/T808 Protocol Parser
 */
export declare class Jtt808ProtocolParser {
    constructor();
    /**
     * Parse raw buffer data to JT/T808 Protocol Data
     * @param buffer
     * @returns
     */
    parse(buffer: Buffer): Jtt808ProtocolData;
}
export {};
