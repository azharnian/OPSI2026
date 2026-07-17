const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const path = require("path");

const { errorHandler } = require("./middleware/errorHandler");
const { notFoundHandler } = require("./middleware/notFound");
const { healthRouter } = require("./routes/healthRoutes");
const { sensorRouter } = require("./routes/sensorRoutes");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.use("/health", healthRouter);
  app.use("/api/sensors", sensorRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
