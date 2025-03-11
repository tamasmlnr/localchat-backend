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
    }]
});

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.username = returnedObject._id;
        delete returnedObject.passwordHash;
        delete returnedObject.__v;
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
