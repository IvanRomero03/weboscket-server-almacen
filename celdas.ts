const celdas = (io: any) => {
  io.on("connection", (/* socket */) => {
    console.log("a user connected to celdas");
  });
};

module.exports = celdas;
