import { User } from "../models/userModels.js"

export const getGlobalLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.find()
            .select("username totalKills totalPossessionTime totalWins")
            .sort({ totalWins: -1, totalKills: -1 })
            .limit(50)

        return res.status(200).json({
            success: true,
            leaderboard
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
