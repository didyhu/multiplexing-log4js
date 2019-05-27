# multiplexing-log4js

A multiplexing log4js logger component

You can send logs to server side over socket, and also control the appender's state, and trigger event listeners at server side.

Example:

## server side:

```js
log4js.configure({
    appenders: {
        file: MultiplexingFileAppender.createConfig(filename, pattern, listener1),
        server: MultiplexingSocketServerAppender.createConfig(port,listener2)
    },
    categories: {
        default: { appenders: ["file"], level: "all" }
    }
})
```

* `listener1: (loggingEvent, writer:ControlledDateRollingFileStream) => boolean`
* `listener2: (loggingEvent, server:MessageSocketServer) => boolean`

## client side:

```js
log4js.configure({
    levels:{
        "EVENT": { value: 20001, colour: "green" }
    },
    appenders: {
        socket: MultiplexingSocketAppender.createConfig("127.0.0.1", 1234, listener),
    },
    categories: {
        default: { appenders: ["socket"], level: "all" }
    }
})
const logger = log4js.getLogger("test")
logger.info("test info") // normal logging
logger.log("EVENT", "something") // custom event
// all of them can be caught by the listeners
```

* `listener: (loggingEvent, writer:AutoReconnectMessageSocketWriter) => boolean`

## listener

listeners return false means the logging event is to be stopped.