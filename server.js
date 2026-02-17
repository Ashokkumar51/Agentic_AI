// ===== HEXTRIS MULTIPLAYER SERVER =====

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// serve your game files
app.use(express.static("public"));

// ===== ROOM STORAGE =====
let rooms = {};

// ===== CONNECTION =====
io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    // ---------------- CREATE ROOM ----------------
    socket.on("createRoom", ({ name }, callback) => {

        let roomId = Math.floor(1000 + Math.random() * 9000).toString();

        rooms[roomId] = {
            players: [{ id: socket.id, name, score: 0 }]
        };

        socket.join(roomId);
        socket.roomId = roomId;

        console.log(name, "created room", roomId);

        callback(roomId);
    });

    // ---------------- JOIN ROOM ----------------
    socket.on("joinRoom", ({ roomId, name }, callback) => {

        if (!rooms[roomId]) {
            callback("Room not found");
            return;
        }

        rooms[roomId].players.push({ id: socket.id, name, score: 0 });
        socket.join(roomId);
        socket.roomId = roomId;

        console.log(name, "joined room", roomId);

        // send updated player list
        io.to(roomId).emit("playerList", rooms[roomId].players);

        callback(null);
    });

    // ---------------- START GAME ----------------
    socket.on("startGame", () => {
        if (!socket.roomId) return;
        console.log("Starting game in room", socket.roomId);
        io.to(socket.roomId).emit("startGame");
    });

    // ---------------- LIVE SCORE UPDATE ----------------
    socket.on("scoreUpdate", (score) => {

        let room = rooms[socket.roomId];
        if (!room) return;

        let player = room.players.find(p => p.id === socket.id);
        if (player) player.score = score;

        // send scoreboard to everyone
        io.to(socket.roomId).emit("scoreBoard", room.players);
    });

    // ---------------- DISCONNECT ----------------
    socket.on("disconnect", () => {

        let roomId = socket.roomId;
        if (!roomId || !rooms[roomId]) return;

        rooms[roomId].players =
            rooms[roomId].players.filter(p => p.id !== socket.id);

        console.log("Player left room", roomId);

        io.to(roomId).emit("playerList", rooms[roomId].players);

        // delete empty room
        if (rooms[roomId].players.length === 0) {
            delete rooms[roomId];
            console.log("Room deleted:", roomId);
        }
    });
});

// ===== START SERVER =====
server.listen(3000, () => {
    console.log("🚀 Hextris server running at http://localhost:3000");
});
