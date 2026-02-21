import { User } from "../models/userModels.js"

export const getGlobalLeaderboard = async (req, res) => {
    try {

        const leaderboard = await User.find()
            .select("username totalKills totalPossessionTime totalWins elo")
            .sort({ totalWins: -1, totalKills: -1 })
            .limit(50)

        res.json(leaderboard)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
