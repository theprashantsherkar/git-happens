import app from "./index.js";
import { connectDB } from "./database/db.js";
import { Server } from "socket.io";
import http from "http";
import registerSocketHandlers from "./socket/index.js";

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

registerSocketHandlers(io);

server.listen(5000, () => {
  console.log("Server up and running at port 5000");
});