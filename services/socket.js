const socketIo = require("socket.io");
const Message = require("../models/message");

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

        socket.on("send-message", async ({ senderId, receiverId, content }) => {
            const message = new Message({ sender: senderId, receiver: receiverId, content });

            try {
                await message.save();
                io.to(receiverId).emit("receive-message", { senderId, content });
            } catch (error) {
                console.error("Error saving message:", error);
            }
        });

        socket.on("get-messages", async (user1Id, user2Id) => {
            console.log();
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