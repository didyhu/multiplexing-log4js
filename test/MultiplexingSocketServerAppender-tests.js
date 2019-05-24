'use strict'
const log4js = require('log4js')
const LoggingEvent = require('log4js/lib/LoggingEvent')
const fse = require('fs-extra')
const path = require('path')
const MultiplexingSocketServerAppender = require('../lib/MultiplexingSocketServerAppender')
const AutoReconnectMessageSocketWriter = require('../lib/AutoReconnectMessageSocketWriter')
const MultiplexingFileAppender = require('../lib/MultiplexingFileAppender')

describe("MultiplexingSocketAppender-tests", () => {
    it("configure", (done) => {
        Promise.resolve().then(async () => {
            const dir = await fse.mkdtemp("test")
            const filename = path.join(dir, "test.log"), pattern = "yyyy-MM-dd_hh_mm_ss", listener = (event) => {
                if (event.data[0] == "close") {
                    log4js.shutdown(async (err) => {
                        await fse.remove(dir)
                        if (err) {
                            console.error(err)
                            return
                        }
                        done()
                    })
                }
            }
            log4js.configure({
                appenders: {
                    file: MultiplexingFileAppender.createConfig(filename, pattern, listener),
                    server: MultiplexingSocketServerAppender.createConfig(1234)
                },
                categories: {
                    default: { appenders: ["file"], level: "all" }
                }
            })
            const writer = new AutoReconnectMessageSocketWriter("127.0.0.1", 1234)
            writer.send(new LoggingEvent("test", "INFO", ["hello", "world", "!"]))
            writer.send(new LoggingEvent("test", "EVENT", ["close"]))
        })
    })
})