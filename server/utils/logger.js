import winston from 'winston';

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'prozorroA.log' })
    ]
});

export default logger;