#include <WiFi.h>
#include <ESPAsyncWebServer.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

const int PIN_RED = 25;
const int PIN_YELLOW = 26;
const int PIN_GREEN = 27;

AsyncWebServer server(80);

enum SignalState { RED, YELLOW, GREEN, OVERRIDE };
SignalState currentState = RED;

// Normal Cycle Timing
unsigned long previousMillis = 0;
const long intervalRed = 30000;
const long intervalYellow = 5000;
const long intervalGreen = 25000;

void setLEDs(bool r, bool y, bool g) {
  digitalWrite(PIN_RED, r ? HIGH : LOW);
  digitalWrite(PIN_YELLOW, y ? HIGH : LOW);
  digitalWrite(PIN_GREEN, g ? HIGH : LOW);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_RED, OUTPUT);
  pinMode(PIN_YELLOW, OUTPUT);
  pinMode(PIN_GREEN, OUTPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println(WiFi.localIP());

  server.on("/override", HTTP_POST, [](AsyncWebServerRequest *request){
    currentState = OVERRIDE;
    setLEDs(false, false, true); // Strict Green
    request->send(200, "application/json", "{\"status\":\"GREEN\"}");
  });

  server.on("/restore", HTTP_POST, [](AsyncWebServerRequest *request){
    currentState = RED;
    previousMillis = millis(); // Reset cycle
    setLEDs(true, false, false);
    request->send(200, "application/json", "{\"status\":\"RESTORED\"}");
  });

  server.on("/status", HTTP_GET, [](AsyncWebServerRequest *request){
    String stateStr = (currentState == OVERRIDE) ? "green_override" : "normal";
    request->send(200, "application/json", "{\"status\":\"" + stateStr + "\"}");
  });

  server.begin();
  setLEDs(true, false, false); // Start RED
}

void loop() {
  if (currentState == OVERRIDE) return;

  unsigned long currentMillis = millis();
  
  if (currentState == RED && currentMillis - previousMillis >= intervalRed) {
    currentState = GREEN;
    previousMillis = currentMillis;
    setLEDs(false, false, true);
  } else if (currentState == GREEN && currentMillis - previousMillis >= intervalGreen) {
    currentState = YELLOW;
    previousMillis = currentMillis;
    setLEDs(false, true, false);
  } else if (currentState == YELLOW && currentMillis - previousMillis >= intervalYellow) {
    currentState = RED;
    previousMillis = currentMillis;
    setLEDs(true, false, false);
  }
}
