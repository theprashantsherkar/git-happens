import mongoose from "mongoose";

const userModel = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    friends: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User"
    },
    password: {
        type: String,
        required: true
    },
    totalKills: {
        type: Number,
        default: 0
    },
    totalPossessionTime: {
        type: Number,
        default: 0
    },
    totalWins: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// Compound index for fast global leaderboard sorting
userModel.index({ totalWins: -1, totalKills: -1 });

export const User = mongoose.model("User", userModel)