# multiplexing-log4js

A multiplexing log4js logger component

You can send logs to server side over socket, and also control the appender's state, and trigger event listeners at server side.

Example:

server side:

```js
log4js.configure({
    appenders: {
        file: MultiplexingFileAppender.createConfig(filename, pattern, listener),
        server: MultiplexingSocketServerAppender.createConfig(port)
    },
    categories: {
        default: { appenders: ["file"], level: "all" }
    }
})
```

client side:

```js
log4js.configure({
    appenders: {
        socket: MultiplexingSocketAppender.createConfig("127.0.0.1", 1234),
    },
    categories: {
        default: { appenders: ["socket"], level: "all" }
    }
})
const logger = log4js.getLogger("test")
logger.info("test info") // normal logging, will be writed to file at server side.
logger.log("CMD", "hold") // set MultiplexingFileAppender state to "hold", and it won't roll new file.
logger.log("CMD", "release") // release hold.
logger.log("EVENT", "something") // fire the listener at server side.
```