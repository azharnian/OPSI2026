const { prisma } = require("../lib/prisma");
const { serializeReading } = require("../utils/readingSerializer");

async function createReading(data) {
  const reading = await prisma.airReading.create({
    data: {
      nh3Ppm: data.nh3Ppm,
      co2Ppm: data.co2Ppm,
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
      _avg: { nh3Ppm: true, co2Ppm: true },
      _min: { nh3Ppm: true, co2Ppm: true },
      _max: { nh3Ppm: true, co2Ppm: true },
    }),
  ]);

  return {
    count,
    nh3_ppm: {
      avg: aggregate._avg.nh3Ppm,
      min: aggregate._min.nh3Ppm,
      max: aggregate._max.nh3Ppm,
    },
    co2_ppm: {
      avg: aggregate._avg.co2Ppm,
      min: aggregate._min.co2Ppm,
      max: aggregate._max.co2Ppm,
    },
  };
}

module.exports = {
  createReading,
  getLatestReading,
  getReadingSummary,
  listReadings,
};
