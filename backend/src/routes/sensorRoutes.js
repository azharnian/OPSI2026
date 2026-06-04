const express = require("express");

const { publishReading, registerSensorStream } = require("../services/sseHub");
const {
  createReading,
  getLatestReading,
  getReadingSummary,
  listReadings,
} = require("../services/sensorService");
const { parseReadingPayload, parseReadingLimit } = require("../utils/requestParsers");

const sensorRouter = express.Router();

sensorRouter.get("/events", registerSensorStream);

sensorRouter.post("/", async (req, res, next) => {
  try {
    const parsed = parseReadingPayload(req.body);

    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const reading = await createReading(parsed.data);
    publishReading(reading);

    return res.status(201).json({
      message: "Data sensor tersimpan.",
      data: reading,
    });
  } catch (error) {
    return next(error);
  }
});

sensorRouter.get("/", async (req, res, next) => {
  try {
    const readings = await listReadings(parseReadingLimit(req.query.limit));
    return res.json({ data: readings });
  } catch (error) {
    return next(error);
  }
});

sensorRouter.get("/latest", async (_req, res, next) => {
  try {
    const reading = await getLatestReading();

    if (!reading) {
      return res.status(404).json({ error: "Belum ada data sensor." });
    }

    return res.json({ data: reading });
  } catch (error) {
    return next(error);
  }
});

sensorRouter.get("/summary", async (_req, res, next) => {
  try {
    return res.json(await getReadingSummary());
  } catch (error) {
    return next(error);
  }
});

module.exports = { sensorRouter };
