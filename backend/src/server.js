const { createApp } = require("./app");
const { env } = require("./config/env");
const { prisma } = require("./lib/prisma");

const app = createApp();

async function shutdown() {
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(env.port, "0.0.0.0", () => {
  console.log(`Air backend berjalan di http://0.0.0.0:${env.port}`);
});
