const net = require("net");
const EventEmitter = require("events").EventEmitter;

/**
 * JT/T808 Server Class
 */
class Jtt808Server {
  constructor() {
    this._server = net.createServer();
    this._event = new EventEmitter();

    this._server.on("connection", this.#onConnection);
    this._server.on("close", this.#onClose);
  }

  /**
   * Get tcp server that connect JT/T808 protocol
   */
  get server() {
    return this._server;
  }

  /**
   * Event binding
   * @param {string} eventName
   * @param {(...args) => void} listener
   */
  on(eventName, listener) {
    this._event.on(eventName, listener);
  }

  /**
   * Listen Connection
   * @param {number} port
   */
  listen(port = 7999) {
    if (this._server.listening) {
      this._server.close(() => {
        this.listen(port);
      });
      return;
    }

    this._server.listen(port, () => {
      this._event.emit("start", port);
    });
  }

  /**
   * On Connection
   * @param {net.Socket} socket
   * @param  {...any} args
   */
  #onConnection(socket, ...args) {
    this._event.emit("connection", socket, ...args);

    socket.on("data", (chunk) => {
      this._event.emit("data", chunk);
    });

    socket.on("end", () => {
      this._event.emit("socket_end");
    });

    socket.on("error", (err) => {
      this._event.emit("error", err);
    });
  }

  #onClose(...args) {
    this._event.emit("close", ...args);
  }
}

module.exports.Jtt808Server = Jtt808Server;
