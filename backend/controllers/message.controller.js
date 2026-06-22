import conversationModel from "../models/conversation.model.js";
import messageModel from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export async function sendMessage(req, res) {
    try {
        const { message } = req.body;
        const senderId = req.user._id;
        const { id: receiverId } = req.params;

        let conversation = await conversationModel.findOne({
            participants: {
                $all: [senderId, receiverId]
            },
        });

        if (!conversation) {
            conversation = await conversationModel.create({
                participants: [senderId, receiverId]
            });
        }

        const newMessage = await messageModel.create({
            senderId,
            receiverId,
            message
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json({
            message: "Message sent successfully",
            data: newMessage
        });
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function getMessages(req, res) {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;

        const conversation = await conversationModel.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate("messages");

        if (!conversation) return res.status(200).json([]);

        const messages = conversation.messages;

        res.status(200).json(messages);

    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function getRecentConversations(req, res) {
    try {
        const loggedInUserId = req.user._id;

        const conversations = await conversationModel.find({
            participants: loggedInUserId
        })
        .populate("participants", "-password")
        .sort({ updatedAt: -1 });

        const recentUsers = conversations.map(conv => {
            return conv.participants.find(p => p._id.toString() !== loggedInUserId.toString());
        }).filter(user => user != null);

        res.status(200).json({
            message: "Recent conversations fetched successfully",
            data: recentUsers
        });

    } catch (error) {
        console.log("Error in getRecentConversations controller: ", error.message);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}