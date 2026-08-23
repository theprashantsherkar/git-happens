import jwt from "jsonwebtoken";
import registerHandlers from "./handlers.js";

export default function registerSocketHandlers(io) {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Token required"));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded || !decoded.id) {
                return next(new Error("Invalid token"));
            }
            socket.userId = decoded.id;
            next();
        } catch (err) {
            return next(new Error("Invalid token signature or expired"));
        }
    });

    io.on("connection", (socket) => {
        registerHandlers(io, socket);
    });
}