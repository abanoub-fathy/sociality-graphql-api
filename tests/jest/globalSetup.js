require("ts-node/register");
const httpServer = require("../../src/server").default;

module.exports = async function () {
  global.httpServer = httpServer.listen("1234", () => {
    console.log(`🚀 Server ready at http://localhost:1234/graphql`);
  });
};
