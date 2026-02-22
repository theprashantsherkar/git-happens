
import dotenv from 'dotenv'
import express, { urlencoded } from 'express'
import userRoutes from "./routes/userRoutes.js"
import cors from 'cors'
import leaderboardRoutes from "./routes/leaderboardRoutes.js"


dotenv.config({
    path:'./database/.env'
})

const app = express();
app.use(express.json(urlencoded({ extended: true })));
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]

}));

app.get('/', (req, res) => {
    return res.json({
        success: true,
        message:"server up and running"
    })
})

app.use("/app/api/user-routes", userRoutes);
app.use("/app/api/leaderboard", leaderboardRoutes)



export default app;