module.exports = async function () {
  await global.httpServer.close();
};
