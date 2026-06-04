const maxPoints = 40;
let readings = [];

const elements = {
  connection: document.getElementById("connection"),
  connectionText: document.getElementById("connectionText"),
  nh3Value: document.getElementById("nh3Value"),
  co2Value: document.getElementById("co2Value"),
  nh3Status: document.getElementById("nh3Status"),
  co2Status: document.getElementById("co2Status"),
  lastSeen: document.getElementById("lastSeen"),
  readingCount: document.getElementById("readingCount"),
  summaryCount: document.getElementById("summaryCount"),
  summaryNh3: document.getElementById("summaryNh3"),
  summaryCo2: document.getElementById("summaryCo2"),
  readingRows: document.getElementById("readingRows"),
  chart: document.getElementById("chart"),
  clearChart: document.getElementById("clearChart"),
};

const context = elements.chart.getContext("2d");

function formatNumber(value) {
  if (!Number.isFinite(value)) return "--";
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function setConnection(state, text) {
  elements.connection.classList.remove("online", "offline");
  elements.connection.classList.add(state);
  elements.connectionText.textContent = text;
}

function getAirStatus(type, value) {
  if (!Number.isFinite(value)) return "Menunggu data";
  if (type === "co2") {
    if (value < 800) return "Normal";
    if (value < 1200) return "Perlu ventilasi";
    return "Tinggi";
  }

  if (value < 25) return "Normal";
  if (value < 50) return "Meningkat";
  return "Tinggi";
}

function updateMetric(reading) {
  elements.nh3Value.textContent = formatNumber(reading.nh3_ppm);
  elements.co2Value.textContent = formatNumber(reading.co2_ppm);
  elements.nh3Status.textContent = getAirStatus("nh3", reading.nh3_ppm);
  elements.co2Status.textContent = getAirStatus("co2", reading.co2_ppm);
  elements.lastSeen.textContent = formatDate(reading.created_at);
}

function updateTable() {
  if (!readings.length) {
    elements.readingRows.innerHTML = '<tr><td colspan="3">Belum ada data.</td></tr>';
    return;
  }

  elements.readingRows.innerHTML = readings
    .slice(-10)
    .reverse()
    .map((reading) => {
      return `
        <tr>
          <td>${formatDate(reading.created_at)}</td>
          <td>${formatNumber(reading.nh3_ppm)}</td>
          <td>${formatNumber(reading.co2_ppm)}</td>
        </tr>
      `;
    })
    .join("");
}

function drawChart() {
  const canvas = elements.chart;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = rect.width;
  const height = rect.height;
  const padding = { top: 22, right: 22, bottom: 30, left: 48 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const values = readings.flatMap((reading) => [reading.nh3_ppm, reading.co2_ppm]);
  const maxValue = Math.max(10, ...values);

  context.clearRect(0, 0, width, height);
  context.strokeStyle = "#d9e1e5";
  context.lineWidth = 1;
  context.fillStyle = "#67737b";
  context.font = "12px system-ui, sans-serif";

  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (chartHeight / 4) * i;
    const value = maxValue - (maxValue / 4) * i;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    context.fillText(value.toFixed(0), 12, y + 4);
  }

  if (readings.length < 2) {
    context.fillText("Menunggu data realtime...", padding.left, padding.top + 24);
    return;
  }

  function drawLine(key, color) {
    context.strokeStyle = color;
    context.lineWidth = 3;
    context.beginPath();

    readings.forEach((reading, index) => {
      const x = padding.left + (chartWidth / (readings.length - 1)) * index;
      const y = padding.top + chartHeight - (reading[key] / maxValue) * chartHeight;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });

    context.stroke();
  }

  drawLine("nh3_ppm", "#009a72");
  drawLine("co2_ppm", "#2764d8");
}

async function loadInitialData() {
  const [listResponse, summaryResponse] = await Promise.all([
    fetch("/api/sensors?limit=20"),
    fetch("/api/sensors/summary"),
  ]);

  if (listResponse.ok) {
    const payload = await listResponse.json();
    readings = payload.data.reverse().slice(-maxPoints);
    const latest = readings.at(-1);
    if (latest) updateMetric(latest);
    elements.readingCount.textContent = `${readings.length} data di grafik`;
    updateTable();
    drawChart();
  }

  if (summaryResponse.ok) {
    const payload = await summaryResponse.json();
    elements.summaryCount.textContent = payload.count;
    elements.summaryNh3.textContent = `${formatNumber(payload.nh3_ppm.avg)} ppm`;
    elements.summaryCo2.textContent = `${formatNumber(payload.co2_ppm.avg)} ppm`;
  }
}

async function refreshSummary() {
  const response = await fetch("/api/sensors/summary");
  if (!response.ok) return;
  const payload = await response.json();
  elements.summaryCount.textContent = payload.count;
  elements.summaryNh3.textContent = `${formatNumber(payload.nh3_ppm.avg)} ppm`;
  elements.summaryCo2.textContent = `${formatNumber(payload.co2_ppm.avg)} ppm`;
}

function addReading(reading) {
  if (readings.some((item) => item.id === reading.id)) return;
  readings.push(reading);
  readings = readings.slice(-maxPoints);
  updateMetric(reading);
  elements.readingCount.textContent = `${readings.length} data di grafik`;
  updateTable();
  drawChart();
  refreshSummary();
}

function connectSse() {
  const events = new EventSource("/api/sensors/events");

  events.addEventListener("open", () => {
    setConnection("online", "Terhubung");
  });

  events.addEventListener("connected", () => {
    setConnection("online", "Terhubung");
  });

  events.addEventListener("reading", (event) => {
    addReading(JSON.parse(event.data));
  });

  events.addEventListener("error", () => {
    setConnection("offline", "Menghubungkan ulang");
  });
}

elements.clearChart.addEventListener("click", () => {
  readings = [];
  elements.readingCount.textContent = "0 data di grafik";
  updateTable();
  drawChart();
});

window.addEventListener("resize", drawChart);

loadInitialData().then(connectSse).catch(() => {
  setConnection("offline", "Gagal memuat data");
  connectSse();
});
