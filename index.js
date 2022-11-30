"use strict";
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
app.get("/health", (req, res) => {
    console.log("health check");
    res.send("OK");
});
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});
let currentPetition = null;
const fakePetition = {
    userId: 1,
    itemId: 1,
    quantity: 1,
};
io.on("connection", (socket) => {
    console.log("a user connected");
    socket.broadcast.emit("mensaje", "bienvenido!");
    socket.on("mensaje", (msg) => {
        console.log("message: " + msg);
        socket.broadcast.emit("mensaje", msg);
    });
    socket.on("createPetition", (peticion) => {
        currentPetition = peticion;
        socket.broadcast.emit("Peticion", peticion.credencial.credential);
    });
    socket.on("autorized", (msg) => {
        console.log("autorized: " + msg);
        client
            .post("Prestamo/createPrestamo", {
            userId: currentPetition.prestamoInfo.userId,
            itemId: currentPetition.prestamoInfo.itemId,
            cantidad: currentPetition.prestamoInfo.quantity,
        })
            .catch((err) => {
            console.log(err);
        });
        for (let i = 0; i < currentPetition.celdas.length; i++) {
            socket.broadcast.emit("open", currentPetition.celdas[i].celdaId);
        }
        currentPetition = null;
    });
    socket.on("denied", (msg) => {
        console.log("denied: " + msg);
        currentPetition = null;
    });
    socket.on("timeout", (msg) => {
        console.log("timeout: " + msg);
        currentPetition = null;
    });
});
// io.of("/celdas").on("connection", (/* socket */) => {
//   console.log("a user connected to celdas");
// });
// io.of("/autorizacion").on("connection", (socket: any) => {
//   console.log("a user connected to autorizacion");
//   socket.broadcast.emit("mensaje", "bienvenido a autorizacion");
//   socket.on("autorized", (msg: any) => {
//     console.log("autorized: " + msg);
//     io.of("/celdas").on("connection", (socketCeldas: any) => {
//       for (let i = 0; i < currentPetition.celdas.length; i++) {
//         socketCeldas.emit("open", currentPetition.celdas[i].celdaId);
//       }
//       socketCeldas.close();
//       client
//         .post("Prestamo/createPrestamo", {
//           userId: currentPetition.prestamoInfo.userId,
//           itemId: currentPetition.prestamoInfo.itemId,
//           cantidad: currentPetition.prestamoInfo.quantity,
//         })
//         .catch((err: any) => {
//           console.log(err);
//         });
//       currentPetition = null as any;
//     });
//   });
//   socket.on("denied", (msg: any) => {
//     console.log("denied: " + msg);
//     currentPetition = null as any;
//   });
//   socket.on("timeout", (msg: any) => {
//     console.log("timeout: " + msg);
//     currentPetition = null as any;
//   });
// });
server.listen(process.env.PORT || 3000, () => {
    console.log("listening on *:3000");
});
