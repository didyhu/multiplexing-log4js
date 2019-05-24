'use strict'
const net = require('net')
const events = require('events')
const { MessageSocket } = require('message-socket-server')

/**
 * @emits drain
 * @emits error
 * @emits close
 */
class AutoReconnectMessageSocketWriter extends events.EventEmitter {
    constructor(host, port) {
        super()
        this.host = host
        this.port = port
        this.reconnectListener = this.connect.bind(this)
        this.messageSocket
        this.connect()
    }
    send(message) {
        if (!this.messageSocket) {
            this.once("connect:handle-delayed", () => {
                if (this.send(message)) {
                    if (this.listeners("connect:handle-delayed").length == 0) {
                        this.emit("drain")
                    }
                }
            })
            return false
        } else {
            return this.messageSocket.send(message)
        }
    }
    destroy() {
        this.messageSocket.removeListener("close", this.reconnectListener)
        this.messageSocket.destroy()
    }
    connect() {
        const socket = net.createConnection({ host: this.host, port: this.port }, () => {
            if (this.messageSocket) {
                this.messageSocket.removeAllListeners()
                this.messageSocket.destroy()
                this.messageSocket = null
            }
            this.messageSocket = new MessageSocket(socket)
            this.messageSocket
                .on("close", this.reconnectListener)
                .on("close", () => this.emit("close"))
                .on("drain", () => this.emit("drain"))
                .on("error", error => this.emit("error", error))
            this.emit("connect:handle-delayed")
        })
    }
}

module.exports = AutoReconnectMessageSocketWriter