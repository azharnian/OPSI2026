#include <Arduino.h>
#include <HTTPClient.h>
#include <WiFi.h>

// ============================================================
// Configuration
// ============================================================

namespace Config {
  // WiFi
  const char* WIFI_SSID = "Multimedia";
  const char* WIFI_PASSWORD = "koorkamiganteng";
  const unsigned long WIFI_TIMEOUT_MS = 15000;

  // Backend API
  // Ganti IP ini dengan IP laptop yang menjalankan backend Node/Bun.
  const char* API_URL = "http://192.168.0.102:8081/api/sensors";
  const uint16_t HTTP_TIMEOUT_MS = 5000;
  const unsigned long SEND_INTERVAL_MS = 5000;

  // Sensor pins
  const int PIN_NH3 = 34;
  const int PIN_CO2 = 33;

  // ADC and sensor constants
  const float ADC_REF_VOLTAGE = 3.3;
  const float ADC_MAX_VALUE = 4095.0;
  const float SENSOR_VCC = 5.0;
  const float MIN_VOLTAGE = 0.01;
  const float RL = 10000.0;
  const float R0_NH3 = 9000.0;
  const float R0_CO2 = 10000.0;

  // Kurva estimasi. Kalibrasi sensor sendiri akan lebih akurat.
  const float A_NH3 = 100.0;
  const float B_NH3 = -1.5;
  const float A_CO2 = 200.0;
  const float B_CO2 = -1.2;
}

// ============================================================
// Data Types
// ============================================================

struct SensorReading {
  float nh3Ppm;
  float co2Ppm;
};

// ============================================================
// Function Declarations
// ============================================================

bool connectWiFi();
float readVoltage(int pin);
float calculatePpm(float voltage, float r0, float curveA, float curveB);
SensorReading readSensors();
String buildPayload(const SensorReading& reading);
bool sendToBackend(const SensorReading& reading);
void printReading(const SensorReading& reading);
void printHttpResponse(HTTPClient& http, int statusCode);

// ============================================================
// WiFi
// ============================================================

bool connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return true;
  }

  Serial.print("Connecting WiFi");

  WiFi.mode(WIFI_STA);
  WiFi.begin(Config::WIFI_SSID, Config::WIFI_PASSWORD);

  unsigned long startedAt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startedAt < Config::WIFI_TIMEOUT_MS) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\nWiFi connection failed. Will retry later.");
    return false;
  }

  Serial.println("\nWiFi connected!");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
  return true;
}

// ============================================================
// Sensor Reading
// ============================================================

float readVoltage(int pin) {
  int raw = analogRead(pin);
  float voltage = raw * (Config::ADC_REF_VOLTAGE / Config::ADC_MAX_VALUE);

  if (voltage < Config::MIN_VOLTAGE) {
    return Config::MIN_VOLTAGE;
  }

  return voltage;
}

float calculatePpm(float voltage, float r0, float curveA, float curveB) {
  float sensorResistance = Config::RL * (Config::SENSOR_VCC - voltage) / voltage;
  float ratio = sensorResistance / r0;
  return curveA * pow(ratio, curveB);
}

SensorReading readSensors() {
  float nh3Voltage = readVoltage(Config::PIN_NH3);
  float co2Voltage = readVoltage(Config::PIN_CO2);

  SensorReading reading;
  reading.nh3Ppm = calculatePpm(nh3Voltage, Config::R0_NH3, Config::A_NH3, Config::B_NH3);
  reading.co2Ppm = calculatePpm(co2Voltage, Config::R0_CO2, Config::A_CO2, Config::B_CO2);

  return reading;
}

// ============================================================
// Backend API
// ============================================================

String buildPayload(const SensorReading& reading) {
  String payload = "{";
  payload += "\"nh3_ppm\":" + String(reading.nh3Ppm, 2) + ",";
  payload += "\"co2_ppm\":" + String(reading.co2Ppm, 2);
  payload += "}";
  return payload;
}

bool sendToBackend(const SensorReading& reading) {
  if (!connectWiFi()) {
    return false;
  }

  WiFiClient client;
  HTTPClient http;
  String payload = buildPayload(reading);

  http.setTimeout(Config::HTTP_TIMEOUT_MS);

  if (!http.begin(client, Config::API_URL)) {
    Serial.println("HTTP begin failed. Check API_URL.");
    return false;
  }

  http.addHeader("Content-Type", "application/json");

  Serial.print("POST ");
  Serial.println(Config::API_URL);
  Serial.print("Payload: ");
  Serial.println(payload);

  int statusCode = http.POST(payload);
  printHttpResponse(http, statusCode);
  http.end();

  return statusCode == HTTP_CODE_CREATED || statusCode == HTTP_CODE_OK;
}

// ============================================================
// Logging
// ============================================================

void printReading(const SensorReading& reading) {
  Serial.println("================================");
  Serial.print("NH3: ");
  Serial.print(reading.nh3Ppm);
  Serial.println(" ppm");
  Serial.print("CO2: ");
  Serial.print(reading.co2Ppm);
  Serial.println(" ppm");
  Serial.println("================================");
}

void printHttpResponse(HTTPClient& http, int statusCode) {
  Serial.print("HTTP Response: ");
  Serial.println(statusCode);

  if (statusCode <= 0) {
    Serial.print("HTTP Error: ");
    Serial.println(http.errorToString(statusCode));
    return;
  }

  String response = http.getString();
  if (response.length() > 0) {
    Serial.print("Response Body: ");
    Serial.println(response);
  }
}

// ============================================================
// Arduino Lifecycle
// ============================================================

void setup() {
  Serial.begin(115200);
  delay(1000);

  analogReadResolution(12);
  WiFi.setAutoReconnect(true);

  connectWiFi();

  Serial.println("Starting sensor monitoring...");
}

void loop() {
  SensorReading reading = readSensors();

  printReading(reading);
  sendToBackend(reading);

  delay(Config::SEND_INTERVAL_MS);
}
