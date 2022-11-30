const createServer = require("http").createServer;
const Server = require("socket.io");
const express = require("express");
const app = express();

const server = createServer(app);

app.get("/health", (req: any, res: any) => {
  console.log("health check");
  res.send("OK");
});

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const celdasCallback = require("./celdas");
const autorizacionCallback = require("./autorizacion");

// enable CORS

// receive message from "mensaje" channel
io.on("connection", (socket: any) => {
  console.log("a user connected");
  socket.on("mensaje", (msg: any) => {
    console.log("message: " + msg);

    socket.broadcast.emit("mensaje", msg);
  });
});

io.of("/celdas").on("connection", (/* socket */) => {
  console.log("a user connected to celdas");
});
//celdasCallback(io.of("/celdas"));

io.of("/autorizacion").on("connection", (/* socket */) => {
  console.log("a user connected to autorizacion");
});

//autorizacionCallback(io.of("/autorizacion"));

server.listen(process.env.PORT || 3000, () => {
  console.log("listening on *:3000");
});
