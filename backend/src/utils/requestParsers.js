function toNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
}

function parseReadingPayload(body) {
  const nh3Ppm = toNumber(body.nh3_ppm);
  const co2Ppm = toNumber(body.co2_ppm);

  if (!Number.isFinite(nh3Ppm) || !Number.isFinite(co2Ppm)) {
    return {
      ok: false,
      error: "Payload harus berisi nh3_ppm dan co2_ppm berupa angka.",
    };
  }

  return {
    ok: true,
    data: { nh3Ppm, co2Ppm },
  };
}

function parseReadingLimit(value) {
  return Math.min(Math.max(Number(value || 50), 1), 200);
}

module.exports = {
  parseReadingLimit,
  parseReadingPayload,
};
