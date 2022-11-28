const autorizacion = (io) => {
  io.on("connection", (socket) => {
    console.log("a user connected to autorizacion");
  });
};

module.exports = autorizacion;
