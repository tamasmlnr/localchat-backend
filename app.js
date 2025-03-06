const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const { MONGO_URI } = require('./utils/config');
const { requestLogger } = require('./utils/middleware');
const http = require('http');
const setupSocketIO = require('./services/socket');

const mongoUrl = MONGO_URI;
console.log(`connecting to ${mongoUrl}`);

mongoose.connect(mongoUrl, { useNewUrlParser: true }).then(() => {
    console.log("Connected to Database");
}).catch((err) => {
    console.log("Error connecting to database! ", err);
});

const server = http.createServer(app);
setupSocketIO(server);

app.use(cors())
app.use(express.json())
app.use(requestLogger);
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use(express.static('assets'));

module.exports = app