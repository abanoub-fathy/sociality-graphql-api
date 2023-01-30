require("ts-node").register({ transpileOnly: true });
const httpServer = require("../../src/server").default;

module.exports = async function () {
  const PORT = process.env.PORT;
  global.httpServer = httpServer.listen(PORT, () => {
    // console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
};
