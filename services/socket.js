const socketIo = require("socket.io");
const Message = require("../models/message");
const Conversation = require("../models/conversation");

let io = null;

const setupSocketIO = (server) => {
    io = socketIo(server, {
        cors: { origin: "*", methods: ["GET", "POST"] },
    });

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("join", (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined their room`);
        });

        socket.on("send-message", async ({ sender, receiver, content, conversationId }) => {
            console.log("message sent:", sender, "to", receiver);
            let conversation = await Conversation.findById(conversationId);
            const message = new Message({ sender, receiver, content, conversationId });

            try {
                await message.save();
                io.to(receiver).emit("receive-message", { sender, content });
                conversation.lastMessage = message._id;
                await conversation.save();
            } catch (error) {
                console.error("Error saving message:", error);
            }
        });

        socket.on("get-messages", async (user1Id, user2Id) => {
            try {
                const { getMessagesBetweenUsers } = require("../controllers/message");
                const messages = await getMessagesBetweenUsers(user1Id, user2Id);
                socket.emit("message-history", messages);
            } catch (error) {
                console.error("Error getting messages:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        console.warn("Warning: Socket.io has not been initialized yet");
    }
    return io;
};

module.exports = { setupSocketIO, getIo };