/// <reference types="node" />
export declare function formatHex(n: number, minLength?: number): string;
/**
 * convert original buffer with escape rule [0x7D 0x01] => 0x7D, [0x7D 0x02] => 0x7E
 * @param original Original Buffer
 */
export declare function unescapeJtt808Buffer(original: Buffer): Buffer;
export declare function readBcdBE(buffer: Buffer, offset: number, size: number): string;
