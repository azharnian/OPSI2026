function toNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
}

function parseReadingPayload(body) {
  const nh3Ppm = toNumber(body.nh3_ppm);
  const ch4Ppm = toNumber(body.ch4_ppm);
  const h2sPpm = body.h2s_ppm !== undefined ? toNumber(body.h2s_ppm) : 0;

  if (!Number.isFinite(nh3Ppm) || !Number.isFinite(ch4Ppm) || !Number.isFinite(h2sPpm)) {
    return {
      ok: false,
      error: "Payload setidaknya harus berisi nh3_ppm dan ch4_ppm berupa angka.",
    };
  }

  return {
    ok: true,
    data: { nh3Ppm, ch4Ppm, h2sPpm },
  };
}

function parseReadingLimit(value) {
  return Math.min(Math.max(Number(value || 50), 1), 200);
}

module.exports = {
  parseReadingLimit,
  parseReadingPayload,
};
