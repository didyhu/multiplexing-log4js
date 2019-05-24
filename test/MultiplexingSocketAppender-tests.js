const { MessageSocketServer } = require('message-socket-server')
const log4js = require('log4js')
const delay = require('delay')
const MultiplexingSocketAppender = require('../lib/MultiplexingSocketAppender')

describe("MultiplexingSocketAppender-tests", () => {
    let _server
    /**
     * @returns {MessageSocketServer}
     */
    function server() {
        return _server
    }
    before((done) => {
        _server = new MessageSocketServer()
        server().listen(1234)
        server().on("listening", address => {
            console.debug("address", address)
            done()
        })
    })
    it("configure", (done) => {
        server().on("connection", socket => {
            socket.on("message", message => {
                const { basicLayout } = require("log4js/lib/layouts")
                message.level.toString = () => message.level.levelStr
                console.log(basicLayout(message))
                if (message.level.levelStr == "CMD" && message.data[0] == "close") {
                    done()
                }
            })
        })
        log4js.configure({
            levels: {
                cmd: { value: 20001, colour: 'green' }
            },
            appenders: {
                default: MultiplexingSocketAppender.createConfig("127.0.0.1", 1234),
            },
            categories: {
                default: { appenders: ["default"], level: "all" }
            }
        })
        const logger = log4js.getLogger("test-configure")
        logger.info("test info")
        logger.log("cmd", "nonsense")
        logger.log("cmd", "close")
    })
    after((done) => {
        Promise.resolve().then(async () => {
            await delay(100)
            log4js.shutdown(err => {
                if (err) return console.error(err)
                console.info("shutdown")
            })
            await delay(100)
            server().close()
            server().on("close", () => {
                done()
            })
        }).catch(console.error)
    })
})