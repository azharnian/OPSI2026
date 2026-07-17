const { prisma } = require("../lib/prisma");
const { serializeReading } = require("../utils/readingSerializer");

async function createReading(data) {
  const reading = await prisma.airReading.create({
    data: {
      nh3Ppm: data.nh3Ppm,
      ch4Ppm: data.ch4Ppm,
      h2sPpm: data.h2sPpm,
    },
  });

  return serializeReading(reading);
}

async function listReadings(limit) {
  const readings = await prisma.airReading.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return readings.map(serializeReading);
}

async function getLatestReading() {
  const reading = await prisma.airReading.findFirst({
    orderBy: { createdAt: "desc" },
  });

  return reading ? serializeReading(reading) : null;
}

async function getReadingSummary() {
  const [count, aggregate] = await Promise.all([
    prisma.airReading.count(),
    prisma.airReading.aggregate({
      _avg: { nh3Ppm: true, ch4Ppm: true, h2sPpm: true },
      _min: { nh3Ppm: true, ch4Ppm: true, h2sPpm: true },
      _max: { nh3Ppm: true, ch4Ppm: true, h2sPpm: true },
    }),
  ]);

  return {
    count,
    nh3_ppm: {
      avg: aggregate._avg.nh3Ppm,
      min: aggregate._min.nh3Ppm,
      max: aggregate._max.nh3Ppm,
    },
    ch4_ppm: {
      avg: aggregate._avg.ch4Ppm,
      min: aggregate._min.ch4Ppm,
      max: aggregate._max.ch4Ppm,
    },
    h2s_ppm: {
      avg: aggregate._avg.h2sPpm,
      min: aggregate._min.h2sPpm,
      max: aggregate._max.h2sPpm,
    },
  };
}

module.exports = {
  createReading,
  getLatestReading,
  getReadingSummary,
  listReadings,
};
