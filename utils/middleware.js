const jwt = require('jsonwebtoken')
const logger = require('./logger')

const requestLogger = (req, res, next) => {
    if (req.path.includes('/socket.io/') && req.method === 'GET') {
        return next();
    }
    const requestId = Date.now();
    logger.info(`[${requestId}] Method: ${req.method}`);
    logger.info(`[${requestId}] Path: ${req.path}`);
    logger.info(`[${requestId}] Body: ${JSON.stringify(req.body)}`);
    logger.info(`[${requestId}] ---`);
    next()
}


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({
            error: 'invalid token'
        })
    }

    next(error)
}


const authMiddleware = (req, res, next) => {
    next()
};

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    authMiddleware
}