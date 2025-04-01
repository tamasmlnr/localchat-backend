const messagesRouter = require('express').Router();
const Message = require('../models/message');
const User = require('../models/user');
const Conversation = require('../models/conversation');
const { authMiddleware } = require('../utils/middleware')

const { getIo } = require("../services/socket");
const logger = require('../utils/logger');

messagesRouter.post("/", authMiddleware, async (request, response) => {
    const { senderId, receiverId, content } = request.body;

    try {
        let conversation = await Conversation.findOne({ users: { $all: [senderId, receiverId] } });
        if (!conversation) {
            conversation = new Conversation({ users: [senderId, receiverId] });
            await conversation.save();

            await User.updateMany(
                { _id: { $in: [senderId, receiverId] } },
                { $push: { conversations: conversation._id } }
            );
        }

        const message = new Message({
            conversationId: conversation._id,
            sender: senderId,
            receiver: receiverId,
            content,
        });

        await message.save();

        conversation.lastMessage = message._id;
        await conversation.save();

        const io = getIo();
        io.to(receiverId).emit("receive-message", { senderId, content });

        response.status(201).json({ message: "Message sent successfully", data: message });
    } catch (error) {
        response.status(500).json({ error: "Error sending message", details: error });
    }
});

messagesRouter.get('/conversation/:conversationId', authMiddleware, async (request, response) => {
    const { conversationId } = request.params;

    try {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return response.status(404).json({ error: 'Conversation not found' });
        }

        const messages = await Message.find({ conversationId: conversation._id });
        response.status(200).json({ conversation, messages });
    } catch (error) {
        response.status(500).json({ error: 'Error fetching messages', details: error });
    }
});

messagesRouter.post('/conversation/users', authMiddleware, async (request, response) => {
    const { user1Id, user2Id } = request.body;

    try {
        let conversation = await Conversation.findOne({
            users: { $all: [user1Id, user2Id] }
        });

        if (!conversation) {
            conversation = new Conversation({
                users: [user1Id, user2Id],
                createdAt: new Date()
            });

            await conversation.save();

            return response.status(201).json({ conversation, messages: [] });
        }

        const messages = await Message.find({ conversationId: conversation._id });

        response.status(200).json({ conversation, messages });
    } catch (error) {
        response.status(500).json({ error: 'Error fetching or creating conversation', details: error });
    }
});



messagesRouter.get('/conversations/:userId', authMiddleware, async (request, response) => {
    const { userId } = request.params;
    try {
        const conversations = await Conversation.aggregate([
            {
                $match: {
                    users: userId,
                },
            },
            {
                $lookup: {
                    from: 'messages',
                    let: { conversationId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$conversationId', '$$conversationId'] }
                            }
                        },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 },
                    ],
                    as: 'lastMessage',
                },
            },
            {
                $addFields: {
                    lastMessage: { $arrayElemAt: ['$lastMessage', 0] },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'users',
                    foreignField: '_id',
                    as: 'userDetails',
                },
            },
            {
                $addFields: {
                    userDetails: {
                        $filter: {
                            input: '$userDetails',
                            as: 'user',
                            cond: { $ne: ['$$user._id', userId] }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    users: 1,
                    userDetails: { _id: 1, name: 1, avatar: 1 },
                    lastMessage: {
                        _id: 1,
                        sender: 1,
                        receiver: 1,
                        content: 1,
                        createdAt: 1,
                    },
                    isWrittenByUser: {
                        $cond: {
                            if: { $eq: ['$lastMessage.sender', userId] },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
        ]);

        response.status(200).json(conversations);
    } catch (error) {
        response.status(500).json({ error: 'Error fetching conversations', details: error.message });
    }
});







module.exports = messagesRouter;
