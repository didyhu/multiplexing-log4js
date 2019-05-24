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
            const listener = (event) => {
                assert(event.data[0] == "foo" && event.data[1] == "bar")
                log4js.shutdown(async (error) => {
                    if (error) {
                        throw error
                    }
                    const files = await fse.readdir(dir)
                    assert(files.length == 1)
                    await fse.remove(dir)
                    done()
                })
            }
            log4js.configure({
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
            logger.log("EVENT", "foo", "bar")
        })
    }).timeout(5000)
})