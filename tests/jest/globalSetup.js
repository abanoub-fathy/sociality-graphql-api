require("ts-node/register");
const httpServer = require("../../src/server").default;

module.exports = async function () {
  const PORT = 1233;
  global.httpServer = httpServer.listen(PORT, () => {
    // console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
};
