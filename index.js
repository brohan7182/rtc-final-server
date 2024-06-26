const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
    cors: {
        origin: ["http://localhost:3000","https://rtcfinal.vercel.app/","https://rtcfinal.vercel.app"], // Allow requests from these origins
        methods: ["GET", "POST"],
        credentials: true // Enable credentials
    }
});

// const io = require("socket.io")(server, {
//     cors: {
//         origin: ["https://rtcfinal.vercel.app", "http://localhost:3000"], // Allow requests from these origins
//         methods: ["GET", "POST"],
//         credentials: true // Enable credentials
//     }
// });

app.use(cors({ credentials: true })); // Enable CORS for all routes and set credentials to true

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Running');
});

io.on("connection", (socket) => {
    console.log("Socket ID:", socket.id);
    socket.emit("me", socket.id);

    socket.on("disconnect", () => {
        socket.broadcast.emit("callEnded");
    });

    socket.on("callUser", ({ userToCall, signalData, from, name }) => {
        console.log("From User:", from);
        console.log("From Name:", name);
        console.log("User to Call:", userToCall);
        io.to(userToCall).emit("callUser", { signal: signalData, from, name });
    });

    socket.on("answerCall", (data) => {
        io.to(data.to).emit("callAccepted", data.signal);
    });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
