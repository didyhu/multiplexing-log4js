'use strict'
const delay = require('delay')
const fse = require('fs-extra')
const path = require('path')
const assert = require('assert')
const log4js = require('log4js')
const events = require('events')
const MultiplexingFileAppender = require('../lib/MultiplexingFileAppender')

describe("ControlledDateRollingFileStream-tests", () => {
    it("test", (done) => {
        Promise.resolve().then(async () => {
            const dir = await fse.mkdtemp("test")
            const filename = path.join(dir, "test.log"), pattern = "yyyy-MM-dd_hh_mm_ss"
            const listener = (event, writer) => {
                if (event.level.levelStr == "CMD" && event.data[0] == "hold") {
                    writer.hold(true)
                    return false
                }
                if (event.level.levelStr == "CMD" && event.data[0] == "shutdown") {
                    log4js.shutdown(async (error) => {
                        if (error) {
                            throw error
                        }
                        const files = await fse.readdir(dir)
                        assert(files.length == 1)
                        await fse.remove(dir)
                        done()
                    })
                    return false
                }
            }
            log4js.configure({
                levels: {
                    "CMD": { value: 20001, colour: "green" }
                },
                appenders: {
                    default: MultiplexingFileAppender.createConfig(filename, pattern, listener)
                },
                categories: {
                    default: { appenders: ["default"], level: "all" }
                }
            })

            const logger = log4js.getLogger("test")
            logger.log("CMD", "hold")
            for (let i = 0; i < 4; i++) {
                logger.info("foo")
                await delay(500)
            }
            logger.log("CMD", "shutdown")
        })
    }).timeout(5000)
})