/// <reference types="node" />
/// <reference types="node" />
import net from "net";
import { Jtt808ProtocolData } from "../parser/jt808-parser";
/**
 * JT/T808 Server Instance
 */
export declare class Jtt808Server {
    #private;
    constructor();
    /**
     * Get TCP server that connect JT/T808 protocol
     */
    get server(): net.Server;
    /**
     * Listen server event
     * @param eventName Event Name
     * @param listener Event Listener
     */
    on(eventName: 'start', listener: (port: number) => void): Jtt808Server;
    on(eventName: 'connection', listener: (socket: net.Socket) => void): Jtt808Server;
    on(eventName: 'raw_data', listener: (chunk: Buffer) => void): Jtt808Server;
    on(eventName: 'data', listener: (data: Jtt808ProtocolData) => void): Jtt808Server;
    on(eventName: 'disconnected', listener: (socket: net.Socket) => void): Jtt808Server;
    on(eventName: 'error', listener: (err: Error) => void): Jtt808Server;
    on(eventName: 'close', listener: () => void): Jtt808Server;
    /**
     * Listen server event once
     * @param eventName Event Name
     * @param listener Event Listener
     */
    once(eventName: 'start', listener: (port: number) => void): Jtt808Server;
    once(eventName: 'connection', listener: (socket: net.Socket) => void): Jtt808Server;
    once(eventName: 'raw_data', listener: (chunk: Buffer) => void): Jtt808Server;
    once(eventName: 'data', listener: (data: Jtt808ProtocolData) => void): Jtt808Server;
    once(eventName: 'disconnected', listener: (socket: net.Socket) => void): Jtt808Server;
    once(eventName: 'error', listener: (err: Error) => void): Jtt808Server;
    once(eventName: 'close', listener: () => void): Jtt808Server;
    /**
     * Unlisten server event
     * @param eventName Event Name
     * @param listener Event Listener
     */
    off(eventName: 'start', listener: (port: number) => void): Jtt808Server;
    off(eventName: 'connection', listener: (socket: net.Socket) => void): Jtt808Server;
    off(eventName: 'raw_data', listener: (chunk: Buffer) => void): Jtt808Server;
    off(eventName: 'data', listener: (data: Jtt808ProtocolData) => void): Jtt808Server;
    off(eventName: 'disconnected', listener: (socket: net.Socket) => void): Jtt808Server;
    off(eventName: 'error', listener: (err: Error) => void): Jtt808Server;
    off(eventName: 'close', listener: () => void): Jtt808Server;
    /**
     * Start server
     * @param port Server Port
     */
    listen(port?: number): void;
}
