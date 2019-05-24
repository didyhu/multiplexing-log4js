'use strict'
const delay = require('delay')
const path = require('path')
const AutoReconnectMessageSocketWriter = require('./AutoReconnectMessageSocketWriter')

function configure(config, layouts, findAppender, levels) {
    const { host, port } = config
    levels.addLevels({
        CMD: { value: 20010, colour: 'orange' },
        EVENT: { value: 20020, colour: 'orange' },
        STATE: { value: 20030, colour: 'orange' },
    })
    const writer = new AutoReconnectMessageSocketWriter(host, port)
    let busy = false
    writer.on("drain", () => {
        busy = false
    })
    function log(loggingEvent) {
        if (!writer.send(loggingEvent)) {
            busy = true
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

function createConfig(host, port) {
    return {
        type: path.relative(process.cwd(), __filename),
        host,
        port
    }
}

module.exports = { configure, createConfig }
