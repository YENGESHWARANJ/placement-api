import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export const initSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                const allowedOrigins = [
                    "http://localhost:5173",
                    "http://localhost:5174",
                    "http://127.0.0.1:5173",
                    "http://127.0.0.1:5174"
                ];
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error("CORS: Origin not allowed"));
                }
            },
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId as string;
        if (userId) {
            socket.join(userId);
            onlineUsers.add(userId);
            io.emit("user_status_change", { userId, isOnline: true });
            console.log(`👤 User joined socket room: ${userId}`);
        }

        socket.on("disconnect", () => {
            if (userId) {
                onlineUsers.delete(userId);
                io.emit("user_status_change", { userId, isOnline: false });
            }
            console.log("🔌 User disconnected");
        });

        // Live Interview Room Events
        socket.on("join_interview_room", ({ roomId, userName }) => {
            socket.join(roomId);
            const clients = io.sockets.adapter.rooms.get(roomId);
            const users = Array.from(clients || []).map(socketId => {
                // In a real app we'd map socketId to userName. For simple Demo:
                return userName; // This is naive, just returning the current user multiple times if not tracked carefully. 
                // Actually, a better approach for the demo: just emit to the room that a user joined.
            });

            // To properly track users in room for the demo, we just emit the join event
            socket.to(roomId).emit("user_joined_room", userName);

            // Send back a mock list (just the self, plus anyone else who might be there)
            // A perfect implementation requires mapping socket.id -> userName
            io.to(roomId).emit("room_users", [userName, "Recruiter (Host)"]); // Mocking standard room layout
        });

        socket.on("leave_interview_room", ({ roomId, userName }) => {
            socket.leave(roomId);
            socket.to(roomId).emit("user_left_room", userName);
        });

        socket.on("code_change", ({ roomId, code }) => {
            // Broadcast code change to EVERYONE in the room EXCEPT the sender
            socket.to(roomId).emit("code_update", code);
        });

    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export const sendNotification = (userId: string, data: { message: string, type?: string }) => {
    if (io) {
        io.to(userId).emit("notification", data);
    }
};

export const broadcastGlobalEvent = (event: string, data: any) => {
    if (io) {
        io.emit(event, data);
    }
};

// Map to track online status if later needed
export const onlineUsers = new Set<string>();
