const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            const formattedMessage = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
            return `${timestamp} [${level}]: ${formattedMessage}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' })
    ]
});
module.exports = logger;
