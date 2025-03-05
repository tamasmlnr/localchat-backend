const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const mongoUrl = process.env.MONGO_REDDIT_URI
console.log(`connecting to ${mongoUrl}`);

mongoose.connect(mongoUrl, { useNewUrlParser: true }).then(() => {
    console.log("Connected to Database");
}).catch((err) => {
    console.log("Error connecting to database! ", err);
});

app.use(cors())
app.use(bodyParser.json())
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use(express.static('assets'));

module.exports = app