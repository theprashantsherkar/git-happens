import dotenv from 'dotenv';
import express, { urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRoutes from "./routes/userRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
    process.env.CLIENT_ORIGIN,
    "http://localhost:3000",
    "https://flagzilla.vercel.app"
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Permissive CORS for game client connections
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.get('/', (req, res) => {
    return res.json({
        success: true,
        message: "Flagzilla server up and running"
    });
});

app.use("/app/api/user-routes", userRoutes);
app.use("/app/api/leaderboard", leaderboardRoutes);

export default app;