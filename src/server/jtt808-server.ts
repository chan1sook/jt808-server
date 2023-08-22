import net from "net";
import { EventEmitter } from "events";
import { Jtt808ProtocolParser } from "../parser/jtt808-parser";
import { Jtt808ProtocolData } from "../parser/jtt808-protocol-data";

/**
 * JT/T808 Server Instance
 */
export class Jtt808Server {
  #server: net.Server;
  #event: EventEmitter;
  #parser: Jtt808ProtocolParser;

  constructor() {
    this.#server = net.createServer();
    this.#event = new EventEmitter();
    this.#parser = new Jtt808ProtocolParser();

    this.#server.on("connection", this._onConnection.bind(this));
    this.#server.on("close", this._onClose.bind(this));
  }

  /**
   * Get TCP server that connect JT/T808 protocol
   */
  get server() {
    return this.#server;
  }

  /**
   * Listen server event
   * @param eventName Event Name
   * @param listener Event Listener
   */
  on(eventName: 'start', listener: (port: number) => void) : Jtt808Server;
  on(eventName: 'connection', listener: (socket: net.Socket) => void) : Jtt808Server;
  on(eventName: 'raw_data', listener: (chunk: Buffer) => void) : Jtt808Server;
  on(eventName: 'data', listener: (data: Jtt808ProtocolData) => void) : Jtt808Server;
  on(eventName: 'disconnected', listener: (socket: net.Socket) => void) : Jtt808Server;
  on(eventName: 'error', listener: (err: Error) => void) : Jtt808Server;
  on(eventName: 'data_error', listener: (err: Error) => void) : Jtt808Server;
  on(eventName: 'close', listener: () => void) : Jtt808Server;
  on(eventName: string, listener: (...args: any[]) => void) {
    this.#event.on(eventName, listener);
    return this;
  }

  /**
   * Listen server event once
   * @param eventName Event Name
   * @param listener Event Listener
   */
  once(eventName: 'start', listener: (port: number) => void) : Jtt808Server;
  once(eventName: 'connection', listener: (socket: net.Socket) => void) : Jtt808Server;
  once(eventName: 'raw_data', listener: (chunk: Buffer) => void) : Jtt808Server;
  once(eventName: 'data', listener: (data: Jtt808ProtocolData) => void) : Jtt808Server;
  once(eventName: 'disconnected', listener: (socket: net.Socket) => void) : Jtt808Server;
  once(eventName: 'error', listener: (err: Error) => void) : Jtt808Server;
  once(eventName: 'data_error', listener: (err: Error) => void) : Jtt808Server;
  once(eventName: 'close', listener: () => void) : Jtt808Server;
  once(eventName: string, listener: (...args: any[]) => void) {
    this.#event.once(eventName, listener);
    return this;
  }

  /**
   * Unlisten server event
   * @param eventName Event Name
   * @param listener Event Listener
   */
  off(eventName: 'start', listener: (port: number) => void) : Jtt808Server;
  off(eventName: 'connection', listener: (socket: net.Socket) => void) : Jtt808Server;
  off(eventName: 'raw_data', listener: (chunk: Buffer) => void) : Jtt808Server;
  off(eventName: 'data', listener: (data: Jtt808ProtocolData) => void) : Jtt808Server;
  off(eventName: 'disconnected', listener: (socket: net.Socket) => void) : Jtt808Server;
  off(eventName: 'error', listener: (err: Error) => void) : Jtt808Server;
  off(eventName: 'data_error', listener: (err: Error) => void) : Jtt808Server;
  off(eventName: 'close', listener: () => void) : Jtt808Server;
  off(eventName: string, listener: (...args: any[]) => void) {
    this.#event.off(eventName, listener);
    return this;
  }

  
  /**
   * Start server
   * @param port Server Port
   */
  listen(port = 7999) {
    if (this.#server.listening) {
      this.#server.close(() => {
        this.listen(port);
      });
      return;
    }

    this.#server.listen(port, () => {
      this.#event.emit("start", port);
    });
  }

  _onConnection(socket: net.Socket) {
    this.#event.emit("connection", socket);

    socket.on("data", (chunk) => {
      this.#event.emit("raw_data", chunk);
      try {
        const data = this.#parser.parse(chunk);
        this.#event.emit("data", data);
      } catch(err) {
        this.#event.emit("data_error", err);
      }
    });

    socket.on("end", () => {
      this.#event.emit("disconnected", socket);
    });

    socket.on("error", (err) => {
      this.#event.emit("error", err);
    });
  }

  _onClose() {
    this.#event.emit("close");
  }
}