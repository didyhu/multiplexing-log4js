'use strict'
const { DateRollingFileStream } = require('streamroller')

class ControlledDataRollingFileStream extends DateRollingFileStream {
    constructor(filename, pattern, options) {
        super(filename, pattern, options)
        this.state.hold = false
        this.on("hold", () => {
            this.hold(true)
        })
        this.on("release", () => {
            this.hold(false)
        })
        this.overrideShouldRoll()
    }
    hold(doHold) {
        this.state.hold = doHold
    }
    overrideShouldRoll() {
        if (!this._origin_shouldRoll) {
            this._origin_shouldRoll = this._shouldRoll
            this._shouldRoll = (callback) => {
                if (this.state.hold) {
                    callback()
                    return
                }
                this._origin_shouldRoll(callback)
            }
        }
    }
    _destroy(error) {
        this.currentFileStream.once("close", () => {
            this.emit("close")
        })
        this.currentFileStream.end(() => {
            this.currentFileStream.destroy()
        })
    }
}

module.exports = ControlledDataRollingFileStream