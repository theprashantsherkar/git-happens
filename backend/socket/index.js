import registerHandlers from "./handlers.js";

export default function registerSocketHandlers(io) {
    io.on("connection", (socket) => {
        registerHandlers(io, socket)
    });

    
}