'use strict'
const delay = require('delay')
const path = require('path')
const ControlledDateRollingFileStream = require('./ControlledDateRollingFileStream')

function configure(config, layouts, findAppender, levels) {
    const { filename, pattern, listener } = config
    levels.addLevels({
        CMD: { value: 20010, colour: 'orange' },
        EVENT: { value: 20020, colour: 'orange' },
        STATE: { value: 20030, colour: 'orange' },
    })
    const writer = new ControlledDateRollingFileStream(filename, pattern)
    let busy = false
    writer.on("drain", () => {
        busy = false
    })
    function log(loggingEvent) {
        switch (loggingEvent.level.levelStr || loggingEvent.level) {
            case "CMD":
                const event = loggingEvent.data[0]
                switch (event) {
                    case "hold":
                    case "release":
                        writer.emit(event)
                        break
                }
                break
            case "EVENT":
                process.nextTick(() => {
                    if (listener) {
                        process.nextTick(() => {
                            listener(loggingEvent)
                        })
                    }
                })
                break
            default:
                if (!writer.write(layouts.basicLayout(loggingEvent))) {
                    busy = true
                }
                break
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