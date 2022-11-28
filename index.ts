const createServer = require("http").createServer;
const Server = require("socket.io").Server;

const httpServer = createServer();
const io = new Server(httpServer);

const celdasCallback = require("./celdas");
const autorizacionCallback = require("./autorizacion");

io.on("connection", (/* socket */) => {
  console.log("a user connected");
});

io.of("/celdas").on("connection", (/* socket */) => {
  console.log("a user connected to celdas");
});
celdasCallback(io.of("/celdas"));

io.of("/autorizacion").on("connection", (/* socket */) => {
  console.log("a user connected to autorizacion");
});

autorizacionCallback(io.of("/autorizacion"));

httpServer.listen(3000);
