"use strict";
const celdas = (io) => {
    io.on("connection", ( /* socket */) => {
        console.log("a user connected to celdas");
    });
};
module.exports = celdas;
