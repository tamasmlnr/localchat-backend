const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
    },
    passwordHash: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    conversations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    }],
    profilePhotoUrl: { type: String },
    location: {
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
    },
});

userSchema.set('toJSON', {
    transform: (_, returnedObject) => {
        returnedObject.username = returnedObject._id;
        delete returnedObject.passwordHash;
        delete returnedObject.__v;

        if (returnedObject.location) {
            if (returnedObject.location.latitude && returnedObject.location.latitude.$numberDecimal) {
                returnedObject.location.latitude = returnedObject.location.latitude.toString();
            }
            if (returnedObject.location.longitude && returnedObject.location.longitude.$numberDecimal) {
                returnedObject.location.longitude = returnedObject.location.longitude.toString();
            }
        }
    }
});


const User = mongoose.model('User', userSchema);

module.exports = User;
