'use strict'
const delay = require('delay')
const path = require('path')
const AutoReconnectMessageSocketWriter = require('./AutoReconnectMessageSocketWriter')

function configure(config, layouts, findAppender, levels) {
    const { host, port, listener } = config
    const writer = new AutoReconnectMessageSocketWriter(host, port)
    let busy = false
    writer.on("drain", () => {
        busy = false
    })
    function log(loggingEvent) {
        if (!listener || listener(loggingEvent, writer) != false) {
            if (!writer.send(loggingEvent)) {
                busy = true
            }
        }
    }
    log.shutdown = async (callback) => {
        let times = 10
        while (busy) {
            if (--times == 0) {
                callback(new Error("shutdown timeout"))
                return
            }
            await delay(100)
        }
        writer.once("close", callback)
        writer.once("error", callback)
        writer.destroy()
    }
    return log
}

function createConfig(host, port, listener) {
    return {
        type: path.relative(process.cwd(), __filename),
        host,
        port,
        listener
    }
}

module.exports = { configure, createConfig }
