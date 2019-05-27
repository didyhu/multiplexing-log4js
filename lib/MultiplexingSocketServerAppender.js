'use strict'
const delay = require('delay')
const path = require('path')
const clustering = require('log4js/lib/clustering');
const { MessageSocketServer } = require('message-socket-server')

function configure(config, layouts, findAppender, levels) {
    const { port, listener } = config
    const server = new MessageSocketServer()
    server.listen(port)
    server.on("connection", socket => {
        socket.on("message", message => {
            if (!listener || listener(message, server) != false) {
                clustering.send(message)
            }
        })
    })
    return {
        shutdown(callback) {
            server.close()
            server.once("close", callback)
        }
    }
}

function createConfig(port, listener) {
    return {
        type: path.relative(process.cwd(), __filename),
        port,
        listener
    }
}

module.exports = { configure, createConfig }