const createServer = require("http").createServer;
const Server = require("socket.io");
const express = require("express");
const app = express();
const axios = require("axios");

const client = axios.create({
  //baseURL: "http://localhost:3001/api",
  baseURL: "http://almacen-iot.vercel.app/api",
});

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

type Celda = {
  celdaId: Number;
  existencia: Number;
};

type credencial = {
  credential: String;
};

type prestamoInfo = {
  userId: Number;
  itemId: Number;
  quantity: Number;
};
type Petition = {
  celdas: Celda[];
  credencial: credencial;
  prestamoInfo: prestamoInfo;
};

let currentPetition: Petition = null as any;

const fakePetition = {
  userId: 1,
  itemId: 1,
  quantity: 1,
} as prestamoInfo;

client.post("/createPrestamo", fakePetition);

io.on("connection", (socket: any) => {
  console.log("a user connected");
  socket.broadcast.emit("mensaje", "bienvenido!");
  socket.on("mensaje", (msg: any) => {
    console.log("message: " + msg);

    socket.broadcast.emit("mensaje", msg);
  });

  socket.on("createPetition", (peticion: Petition) => {
    currentPetition = peticion;
    socket.broadcast.emit("Peticion", peticion.credencial.credential);
  });
  socket.on("autorized", (msg: any) => {
    console.log("autorized: " + msg);
    for (let i = 0; i < currentPetition.celdas.length; i++) {
      socket.broadcast.emit("open", currentPetition.celdas[i].celdaId);
    }
    client.post("/createPrestamo", currentPetition.prestamoInfo);
    currentPetition = null as any;
  });
  socket.on("denied", (msg: any) => {
    console.log("denied: " + msg);
    currentPetition = null as any;
  });
  socket.on("timeout", (msg: any) => {
    console.log("timeout: " + msg);
    currentPetition = null as any;
  });
});

io.of("/celdas").on("connection", (/* socket */) => {
  console.log("a user connected to celdas");
});

io.of("/autorizacion").on("connection", (socket: any) => {
  console.log("a user connected to autorizacion");
  socket.broadcast.emit("mensaje", "bienvenido a autorizacion");
  socket.on("autorized", (msg: any) => {
    console.log("autorized: " + msg);
    io.of("/celdas").on("connection", (socketCeldas: any) => {
      for (let i = 0; i < currentPetition.celdas.length; i++) {
        socketCeldas.emit("open", currentPetition.celdas[i].celdaId);
      }
      socketCeldas.close();
      client.post("/createPrestamo", currentPetition.prestamoInfo);
      currentPetition = null as any;
    });
  });
  socket.on("denied", (msg: any) => {
    console.log("denied: " + msg);
    currentPetition = null as any;
  });
  socket.on("timeout", (msg: any) => {
    console.log("timeout: " + msg);
    currentPetition = null as any;
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("listening on *:3000");
});
