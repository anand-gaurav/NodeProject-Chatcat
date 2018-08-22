'use strict';
const winston = require('winston');
const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [
        // new (winston.transports.File)({
        //     level: 'debug',
        //     filename: './chatCatDebug.log',
        //     handleExceptions: true
        // }),
        new (winston.transports.Console)({
            level: 'debug',
            json: true,
            handleExceptions: true
        })
    ],
    exitOnError: false
});

module.exports = logger;