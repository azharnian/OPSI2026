function serializeReading(reading) {
  return {
    id: reading.id,
    nh3_ppm: reading.nh3Ppm,
    ch4_ppm: reading.ch4Ppm,
    h2s_ppm: reading.h2sPpm,
    created_at: reading.createdAt,
  };
}

module.exports = { serializeReading };
