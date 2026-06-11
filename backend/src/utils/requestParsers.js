function toNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
}

function parseReadingPayload(body) {
  const nh3Ppm = toNumber(body.nh3_ppm);
  const co2Ppm = toNumber(body.co2_ppm);
  const h2sPpm = toNumber(body.h2s_ppm);

  if (!Number.isFinite(nh3Ppm) || !Number.isFinite(co2Ppm) || !Number.isFinite(h2sPpm)) {
    return {
      ok: false,
      error: "Payload harus berisi nh3_ppm, co2_ppm, dan h2s_ppm berupa angka.",
    };
  }

  return {
    ok: true,
    data: { nh3Ppm, co2Ppm, h2sPpm },
  };
}

function parseReadingLimit(value) {
  return Math.min(Math.max(Number(value || 50), 1), 200);
}

module.exports = {
  parseReadingLimit,
  parseReadingPayload,
};
