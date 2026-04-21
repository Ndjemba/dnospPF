import { Server } from "socket.io";

export const dynamic = "force-dynamic";

export async function GET(req: any, res: any) {
  if (res.socket.server.io) {
    console.log("Socket is already running");
    return new Response("Socket is already running", { status: 200 });
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("New connection:", socket.id);

    socket.on("join-room", (roomId, userId) => {
      socket.join(roomId);
      socket.to(roomId).emit("user-connected", userId);

      socket.on("disconnect", () => {
        socket.to(roomId).emit("user-disconnected", userId);
      });
    });
  });

  return new Response("Socket started", { status: 200 });
}
