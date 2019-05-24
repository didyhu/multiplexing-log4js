'use strict'
const delay = require('delay')
const path = require('path')
const clustering = require('log4js/lib/clustering');
const { MessageSocketServer } = require('message-socket-server')

function configure(config, layouts, findAppender, levels) {
    const { port } = config
    levels.addLevels({
        CMD: { value: 20010, colour: 'orange' },
        EVENT: { value: 20020, colour: 'orange' },
        STATE: { value: 20030, colour: 'orange' },
    })
    const server = new MessageSocketServer()
    server.listen(port)
    server.on("connection", socket => {
        socket.on("message", message => {
            clustering.send(message)
        })
    })
    return {
        shutdown(callback) {
            server.close()
            server.once("close", callback)
        }
    }
}

function createConfig(port) {
    return {
        type: path.relative(process.cwd(), __filename),
        port
    }
}

module.exports = { configure, createConfig }
