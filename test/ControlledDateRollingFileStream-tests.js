'use strict'
const delay = require('delay')
const fse = require('fs-extra')
const path = require('path')
const assert = require('assert')
const ControlledDateRollingFileStream = require('../lib/ControlledDateRollingFileStream')

describe("ControlledDateRollingFileStream-tests", () => {
    let dir
    it("test", (done) => {
        Promise.resolve().then(async () => {
            dir = await fse.mkdtemp("test")
            const stream = new ControlledDateRollingFileStream(path.join(dir, "test.log"), "yyyy-MM-dd_hh_mm_ss")
            stream.emit("hold")
            for (let i = 0; i < 2; i++) {
                stream.write(Buffer.from("hello\n"))
                await delay(1000)
            }
            if (dir) {
                const files = await fse.readdir(dir)
                assert(files.length == 1)
                stream.destroy()
                await fse.remove(dir)
                done()
            }
        })
    }).timeout(3000)
})