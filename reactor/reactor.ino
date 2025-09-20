#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <Adafruit_NeoPixel.h>

// ---------- Configuración WiFi ----------
const char* ssid     = "adawolfs";
const char* password = "qawsedrftg";

// IP estática (ajusta a tu red)
IPAddress local_IP(10,76,152,200);
IPAddress gateway(10,76,152,16);
IPAddress subnet(255,255,255,0);
IPAddress primaryDNS(8,8,8,8);
IPAddress secondaryDNS(8,8,4,4);

// ---------- Servidor HTTP ----------
WebServer server(80);

// ---------- NeoPixel ----------
#define PIN_NEOPIXEL 18        // GPIO del ESP32 para la data del NeoPixel
#define NUMPIXELS    64        // Total de LEDs

Adafruit_NeoPixel pixels(NUMPIXELS, PIN_NEOPIXEL, NEO_GRB + NEO_KHZ800);

#define DELAYVAL 500

// Mapa de anillos (exterior → interior)
const int RING_STARTS[4]  = {0, 24, 40, 56};
const int RING_LENGTHS[4] = {24, 16, 16, 7};

// ---------- Handlers HTTP ----------
void handleRoot() {
  server.send(200, "text/plain", "Reactor ARC (ESP32): Listo");
}

void handleNotFound(){
  String message = "File Not Found\n\n";
  message += "URI: ";     message += server.uri();
  message += "\nMethod: "; message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: "; message += server.args(); message += "\n";
  for (int i = 0; i < server.args(); i++){
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);
}

// ---------- Utilidades NeoPixel ----------
void apagar() {
  pixels.clear();
  pixels.show();
}

void encenderTira() {
  for (int i = 0; i < NUMPIXELS; i++) {
    pixels.setPixelColor(i, pixels.Color(0, 0, 250)); // Azul intenso
  }
  pixels.show();
  Serial.println("Tira encendida!!!!!");
}

void cometaCircular(uint8_t red, uint8_t green, uint8_t blue, int delayMs = 20) {
  for (int i = 0; i < NUMPIXELS; i++) {
    pixels.clear();
    for (int t = 0; t < 5; t++) {
      int pos = (i - t + NUMPIXELS) % NUMPIXELS;
      pixels.setPixelColor(pos, pixels.Color(red / (t + 1), green / (t + 1), blue / (t + 1)));
    }
    pixels.show();
    delay(delayMs);
  }
}

void barridoArcoiris(int delayMs = 1000) {
  for (int j = 0; j < 256; j++) {
    for (int i = 0; i < NUMPIXELS; i++) {
      pixels.setPixelColor(i, pixels.ColorHSV((i * 65536L / NUMPIXELS + j * 256) % 65536));
      delay(delayMs);
    }
    pixels.show();
  }
}

void latidoAnillos(uint8_t red, uint8_t green, uint8_t blue, int delayMs = 50) {
  for (int pulse = 0; pulse < 2; pulse++) {
    for (int brightness = 0; brightness <= 255; brightness += 30) {
      pixels.clear();
      for (int ring = 0; ring < 4; ring++) {
        for (int i = 0; i < RING_LENGTHS[ring]; i++) {
          pixels.setPixelColor(
            RING_STARTS[ring] + i,
            pixels.Color(red * brightness / 255, green * brightness / 255, blue * brightness / 255)
          );
        }
      }
      pixels.show();
      delay(delayMs);
    }
    delay(100);
  }
}

void explosionCentro(uint8_t red, uint8_t green, uint8_t blue, int delayMs = 100) {
  int ringStarts[]  = {56, 40, 24, 0}; // de adentro hacia afuera
  int ringLengths[] = {7, 16, 16, 24};

  for (int step = 0; step < 4; step++) {
    for (int i = 0; i < ringLengths[step]; i++) {
      pixels.setPixelColor(ringStarts[step] + i, pixels.Color(red, green, blue));
    }
    pixels.show();
    delay(delayMs);
  }
}

void ondaBidireccional(uint8_t r1, uint8_t g1, uint8_t b1,
                       uint8_t r2, uint8_t g2, uint8_t b2, int delayMs = 100) {
  int ringStarts[]  = {56, 40, 24, 0};
  int ringLengths[] = {7, 16, 16, 24};

  // Expansión
  for (int step = 0; step < 4; step++) {
    pixels.clear();
    for (int i = 0; i <= step; i++) {
      for (int j = 0; j < ringLengths[i]; j++) {
        pixels.setPixelColor(ringStarts[i] + j, pixels.Color(r1, g1, b1));
      }
    }
    pixels.show();
    delay(delayMs);
  }

  // Contracción
  for (int step = 3; step >= 0; step--) {
    pixels.clear();
    for (int i = 0; i <= step; i++) {
      for (int j = 0; j < ringLengths[i]; j++) {
        pixels.setPixelColor(ringStarts[i] + j, pixels.Color(r2, g2, b2));
      }
    }
    pixels.show();
    delay(delayMs);
  }
}

void anilloGiratorio(int delayMs = 100) {
  static int pos[]     = {0, 0, 0, 0};
  int starts[]         = {0, 24, 40, 56};
  int sizes[]          = {24, 16, 16, 7};
  uint32_t colors[]    = {
    pixels.Color(255, 0, 0),
    pixels.Color(0, 255, 0),
    pixels.Color(0, 0, 255),
    pixels.Color(255, 255, 0)
  };

  pixels.clear();
  for (int ring = 0; ring < 4; ring++) {
    int index = starts[ring] + pos[ring];
    pixels.setPixelColor(index, colors[ring]);
    pos[ring] = (pos[ring] + 1) % sizes[ring];
  }
  pixels.show();
  delay(delayMs);
}

void sparkleAleatorio(int count = 10, int delayMs = 100) {
  pixels.clear();
  for (int i = 0; i < count; i++) {
    int pix = random(NUMPIXELS);
    pixels.setPixelColor(pix, pixels.Color(random(100,255), random(100,255), random(100,255)));
  }
  pixels.show();
  delay(delayMs);
}

void tornado(uint8_t colorR, uint8_t colorG, uint8_t colorB, int delayMs = 60) {
  for (int i = 0; i < 24; i++) {
    pixels.clear();
    for (int ring = 0; ring < 4; ring++) {
      int idx = RING_STARTS[ring] + (i % RING_LENGTHS[ring]);
      pixels.setPixelColor(idx, pixels.Color(colorR, colorG, colorB));
    }
    pixels.show();
    delay(delayMs);
  }
}

void pulsoCentral(uint8_t red, uint8_t green, uint8_t blue, int delayMs = 30) {
  int ringStart  = 56;
  int ringLength = 7;

  for (int br = 0; br <= 255; br += 10) {
    for (int i = 0; i < ringLength; i++) {
      pixels.setPixelColor(ringStart + i, pixels.Color(red * br / 255, green * br / 255, blue * br / 255));
    }
    pixels.show();
    delay(delayMs);
  }
  for (int br = 255; br >= 0; br -= 10) {
    for (int i = 0; i < ringLength; i++) {
      pixels.setPixelColor(ringStart + i, pixels.Color(red * br / 255, green * br / 255, blue * br / 255));
    }
    pixels.show();
    delay(delayMs);
  }
}

void reboteColor(int delayMs = 15) {
  int dir = 1;
  int pos = 0;

  for (int i = 0; i < NUMPIXELS * 2; i++) {
    pixels.clear();
    pixels.setPixelColor(pos, pixels.Color(random(255), random(255), random(255)));
    pixels.show();
    delay(delayMs);

    pos += dir;
    if (pos >= NUMPIXELS || pos < 0) {
      dir *= -1;
      pos += dir;
    }
  }
}

// ---------- Setup / Loop ----------
void setup() {
  Serial.begin(115200);
  delay(100);

  // NeoPixel
  pixels.begin();
  pixels.clear();
  pixels.show();
  encenderTira();

  // WiFi STA + IP estática
  WiFi.mode(WIFI_STA);
  if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
    Serial.println("Fallo al configurar IP estática");
  }

  // (Opcional) nombre de host
  WiFi.setHostname("arc-reactor-esp32");

  Serial.print("Conectando a "); Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi conectado");
  Serial.print("Dirección IP: "); Serial.println(WiFi.localIP());

  // Rutas HTTP
  server.on("/", handleRoot);
  server.on("/inline", [](){ server.send(200, "text/plain", "this works as well"); });

  server.on("/encender", [](){ encenderTira(); server.send(200, "text/plain", "Tira encendida !!!!!!!!!!!!!!!"); });
  server.on("/cometa-circular", [](){ cometaCircular(255, 0, 0, 20); server.send(200, "text/plain", "Cometa circular activado"); });
  server.on("/barrido-arcoiris", [](){ barridoArcoiris(10); server.send(200, "text/plain", "Barrido arcoíris activado"); });
  server.on("/latido-anillos", [](){ latidoAnillos(0, 255, 0, 50); server.send(200, "text/plain", "Latido en anillos activado"); });
  server.on("/explosion-centro", [](){ explosionCentro(255, 100, 0, 100); server.send(200, "text/plain", "Explosión desde el centro activada"); });
  server.on("/onda-bidireccional", [](){ ondaBidireccional(255, 0, 0, 0, 0, 255, 100); server.send(200, "text/plain", "Onda bidireccional activada"); });
  server.on("/anillo-giratorio", [](){ for (int i=0;i<40;i++) anilloGiratorio(100); server.send(200, "text/plain", "Anillos giratorios activados"); });
  server.on("/sparkle", [](){ for (int i=0;i<40;i++) sparkleAleatorio(15, 100); server.send(200, "text/plain", "Efecto chispa activado"); });
  server.on("/tornado", [](){ tornado(100, 100, 255, 50); server.send(200, "text/plain", "Tornado activado"); });
  server.on("/pulso-central", [](){ for (int i=0;i<4;i++) pulsoCentral(255, 0, 255, 20); server.send(200, "text/plain", "Pulso central activado"); });
  server.on("/rebote-color", [](){ reboteColor(15); server.send(200, "text/plain", "Rebote activado"); });
  server.on("/apagar", [](){ apagar(); server.send(200, "text/plain", "Apagado"); });

  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server iniciado");
}

void loop() {
  server.handleClient();
}
