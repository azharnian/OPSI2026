const { getLatestReading } = require("./sensorService");

const clients = new Set();
const HEARTBEAT_INTERVAL_MS = 30000;

function sendSse(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function publishReading(reading) {
  for (const client of clients) {
    sendSse(client, "reading", reading);
  }
}

async function registerSensorStream(req, res, next) {
  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    clients.add(res);
    sendSse(res, "connected", { status: "ok" });

    const latest = await getLatestReading();
    if (latest) {
      sendSse(res, "reading", latest);
    }

    const heartbeat = setInterval(() => {
      sendSse(res, "heartbeat", { now: new Date().toISOString() });
    }, HEARTBEAT_INTERVAL_MS);

    req.on("close", () => {
      clearInterval(heartbeat);
      clients.delete(res);
      res.end();
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  publishReading,
  registerSensorStream,
};
