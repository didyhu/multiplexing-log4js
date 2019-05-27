'use strict'
const delay = require('delay')
const path = require('path')
const ControlledDateRollingFileStream = require('./ControlledDateRollingFileStream')

function configure(config, layouts, findAppender, levels) {
    const { filename, pattern, listener } = config
    const writer = new ControlledDateRollingFileStream(filename, pattern)
    let busy = false
    writer.on("drain", () => {
        busy = false
    })
    function log(loggingEvent) {
        if (!listener || listener(loggingEvent, writer) != false) {
            if (!writer.write(layouts.basicLayout(loggingEvent))) {
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

function createConfig(filename, pattern, listener) {
    return {
        type: path.relative(process.cwd(), __filename),
        filename, pattern, listener
    }
}

module.exports = { configure, createConfig }