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

        // Multi-Instance Scalability: Attach Redis Socket.IO adapter if REDIS_URL environment variable is provided
        if (process.env.REDIS_URL) {
            try {
                const { createAdapter } = await import("@socket.io/redis-adapter");
                const { createClient } = await import("redis");

                const pubClient = createClient({ url: process.env.REDIS_URL });
                const subClient = pubClient.duplicate();

                await Promise.all([pubClient.connect(), subClient.connect()]);
                io.adapter(createAdapter(pubClient, subClient));
                console.log("Socket.IO Redis Adapter successfully attached for horizontal scaling");
            } catch (redisErr) {
                console.warn("REDIS_URL set but Redis adapter failed to initialize. Falling back to in-memory adapter:", redisErr.message);
            }
        }

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