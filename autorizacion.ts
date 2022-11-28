const autorizacion = (io: any) => {
  io.on("connection", (/* socket */) => {
    console.log("a user connected to autorizacion");
  });
};

module.exports = autorizacion;
