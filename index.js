require('dotenv').config();
const app = require('./app')
const http = require('http')
const server = http.createServer(app)
const config = require('./utils/config')

server.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`)
})