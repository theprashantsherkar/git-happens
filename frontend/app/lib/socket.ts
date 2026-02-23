import {io, Socket} from "socket.io-client";
import { BACKEND_URI } from "../page";

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(BACKEND_URI, {
            auth: {
                token: localStorage.getItem("token")
            }
        });
    }

    return socket;
}
