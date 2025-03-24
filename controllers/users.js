const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Image = require('../models/image')
const { authMiddleware } = require('../utils/middleware')
const { upload, uploadImage, deleteImage } = require('../services/cloudinaryStorage')

usersRouter.get('/', authMiddleware, async (request, response) => {
    const users = await User.find({})
    response.json(users.map(u => u.toJSON()))
})

usersRouter.get('/:id', authMiddleware, async (request, response) => {
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

usersRouter.put('/:id', authMiddleware, async (request, response) => {
    try {
        let userData;
        if (request.body.body && typeof request.body.body === 'string') {
            userData = JSON.parse(request.body.body);
        } else {
            userData = request.body;
        }

        if (userData.location) {
            userData.location = {
                latitude: userData.location.latitude,
                longitude: userData.location.longitude
            };
        }

        const updatedUser = await User.findByIdAndUpdate(
            request.params.id,
            userData,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return response.status(404).json({ error: 'User not found' });
        }

        response.json(updatedUser.toJSON());
    } catch (e) {
        next(e)
    }
});



usersRouter.post('/', async (request, response, next) => {
    try {
        const body = request.body

        const saltRounds = 10
        const passwordHash = await bcrypt.hash(body.password, saltRounds)
        const user = new User({
            passwordHash,
            name: body.name,
            _id: body.username
        })

        const savedUser = await user.save()

        response.json(savedUser)
    } catch (exception) {
        if (exception.code === 11000) {
            return response.status(400).json({ error: "Username already exists." });
        }
        next(exception)
    }
})

usersRouter.post('/upload-photo', upload.single("image"), async (request, response, next) => {
    console.log("upload called");
    try {
        const { userId } = request.body;
        if (!userId) return response.status(400).json({ error: "User ID is required" });

        const user = await User.findById(userId);
        if (!user) return response.status(404).json({ error: "User not found" });

        const imageData = await uploadImage(request);

        user.profilePhotoUrl = imageData.imageUrl;
        await user.save();

        response.status(200).json({ message: "Profile photo updated", imageUrl: imageData.imageUrl });
    } catch (error) {
        next(error);
    }
});

module.exports = usersRouter;
