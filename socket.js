import { Server } from "socket.io";

let io;
const onlineUsers = new Map();

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;

        if (userId && userId !== "undefined") {
            if (!onlineUsers.has(userId)) {
                onlineUsers.set(userId, new Set());
            }
            onlineUsers.get(userId).add(socket.id);
        }

        socket.on("disconnect", () => {
            if (userId && onlineUsers.has(userId)) {
                onlineUsers.get(userId).delete(socket.id);
                if (onlineUsers.get(userId).size === 0) {
                    onlineUsers.delete(userId);
                }
            }
        });
    });

    return io;
};

export const emitToUser = (userId, event, data) => {
    if (!io || !userId) return;
    const sockets = onlineUsers.get(String(userId));
    if (sockets) {
        sockets.forEach((socketId) => {
            io.to(socketId).emit(event, data);
        });
    }
};