import jwt from "jsonwebtoken";
import registerHandlers from "./handlers.js";
import { User } from "../models/userModels.js";

export default function registerSocketHandlers(io) {
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Token required"));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded || !decoded.id) {
                return next(new Error("Invalid token"));
            }

            socket.userId = decoded.id;

            // Fetch user profile to bind real database username to socket session
            const user = await User.findById(decoded.id).select("username");
            if (user) {
                socket.username = user.username;
            } else {
                socket.username = `Player_${decoded.id.slice(-4)}`;
            }

            next();
        } catch (err) {
            return next(new Error("Invalid token signature or expired"));
        }
    });

    io.on("connection", (socket) => {
        registerHandlers(io, socket);
    });
}