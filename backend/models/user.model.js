import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: { 
        type: String, 
        required: true 
    },
    username: { 
        type: String, 
        required: [true, "Username is required"], 
        unique: [true, "username must be unique"]
    },
    email: { 
        type: String, 
        required: [true, "Email is required"], 
        unique: [true, "email must be unique"]
    },
    password: { 
        type: String, 
        required: false,
        select: false 
    },
    profilePic: {
        type: String,
        default: ""
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, { timestamps: true });

const userModel = mongoose.model("User", userSchema);

export default userModel;