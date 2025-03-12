const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
    {
        users: {
            type: [{ type: String, ref: 'User' }],
            required: true,
            validate: [arrayLimit, '{PATH} exceeds the limit of 2 users'],
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            default: null,
        },
    },
    { timestamps: true }
);

function arrayLimit(val) {
    return val.length === 2;
}

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
