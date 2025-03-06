const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const { authMiddleware } = require('../utils/middleware')

usersRouter.get('/', authMiddleware, async (request, response) => {
    const users = await User.find({})
    response.json(users.map(u => u.toJSON()))
})

usersRouter.get('/:id', async (request, response) => {
    User.findById(request.params.id)
        .then(user => {
            if (user) {
                response.json(user.toJSON())
            } else {
                response.status(404).end()
            }
        })
        .catch(error => response.status(400).status)
})

usersRouter.post('/', async (request, response, next) => {
    console.log("here");
    try {
        const body = request.body

        const saltRounds = 10
        const passwordHash = await bcrypt.hash(body.password, saltRounds)
        console.log(body);
        const user = new User({
            username: body.username,
            passwordHash,
            name: body.name
        })

        const savedUser = await user.save()
        console.log(savedUser);

        response.json(savedUser)
    } catch (exception) {
        if (exception.code === 11000) { // Duplicate key error
            return response.status(400).json({ error: "Username already exists." });
        }
        next(exception)
    }
})

module.exports = usersRouter