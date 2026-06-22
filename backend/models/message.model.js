import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Sender is required"]
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Receiver is required"]
        },
        message: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
);

// FIX 3: Capitalized "Message" to match the exact string you used in your refs
const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;