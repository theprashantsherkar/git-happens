import app from "./index.js";
import { connectDB } from "./database/db.js";
import { Server } from "socket.io";
import http from "http";
import registerSocketHandlers from "./socket/index.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();

        const server = http.createServer(app);

        const io = new Server(server, {
            cors: {
                origin: "*",
                credentials: true,
                methods: ["GET", "POST", "PUT", "DELETE"],
            },
        });

        registerSocketHandlers(io);

        server.listen(PORT, () => {
            console.log(`Server up and running at port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server due to database connection error.");
        process.exit(1);
    }
}

startServer();