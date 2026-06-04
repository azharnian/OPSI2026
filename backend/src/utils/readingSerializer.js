function serializeReading(reading) {
  return {
    id: reading.id,
    nh3_ppm: reading.nh3Ppm,
    co2_ppm: reading.co2Ppm,
    created_at: reading.createdAt,
  };
}

module.exports = { serializeReading };
