import mongoose from "mongoose";

const userModel = new mongoose.Schema({
    name: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required:true
    },
    friends: {
        type: [mongoose.Schema.Types.ObjectId],
        ref:"User"
    },
    password: {
        type: String,
        required:true
    },
    createdAt: {
        type: Date,
        default: new Date(Date.now())
    }
})


export const User = mongoose.model("User", userModel)