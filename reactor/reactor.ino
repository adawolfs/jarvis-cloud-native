#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <Adafruit_NeoPixel.h>

// ---------- Configuración WiFi ----------
const char* ssid     = "adawolfs";
const char* password = "qawsedrftg";

// IP estática (ajusta a tu red)
IPAddress local_IP(10,199,173,200);
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

// ---------- Utilidad para leer repeticiones desde la petición HTTP ----------
int getRepeatsFromClient() {
  if (server.hasArg("r")) {
    int val = server.arg("r").toInt();
    return val > 0 ? val : 1;
  }
  return 1;
}

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

// ---------- Utilidades NeoPixel (ahora con repeticiones) ----------
void apagar() {
  pixels.clear();
  pixels.show();
}

void encenderTira(int repeats = 1) {
  for (int r = 0; r < repeats; r++) {
    for (int i = 0; i < NUMPIXELS; i++) {
      pixels.setPixelColor(i, pixels.Color(0, 0, 250)); // Azul intenso
    }
    pixels.show();
    Serial.println("Tira encendida!!!!!");
  }
}

void cometaCircular(uint8_t red, uint8_t green, uint8_t blue, int delayMs = 20, int repeats = 1) {
  for (int rep = 0; rep < repeats; rep++) {
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
}

// Efecto de autodestrucción: cuenta regresiva, parpadeos acelerados, chispas aleatorias y apagado final
void autodestruccion(int delayMs = 1000, int repeats = 1) {
  for (int rep = 0; rep < repeats; rep++) {
    // 1) Cuenta regresiva visual (5..1) - flashes cada vez más rápidos
    for (int c = 5; c >= 1; c--) {
      for (int f = 0; f < 3; f++) {
        // Flash fuerte (amarillo-naranja)
        for (int i = 0; i < NUMPIXELS; i++) {
          pixels.setPixelColor(i, pixels.Color(255, 140, 0));
        }
        pixels.show();
        delay(max(60, 300 - c * 40));
        pixels.clear();
        pixels.show();
        delay(80);
      }
    }

    // 2) Parpadeo rojo acelerado con chispas aleatorias
    for (int phase = 0; phase < 6; phase++) {
      int flashes = 8 + phase * 8;
      int baseDelay = max(8, 60 - phase * 8);
      for (int f = 0; f < flashes; f++) {
        uint8_t r = random(150, 255);
        // Roja intensa en toda la tira
        for (int i = 0; i < NUMPIXELS; i++) {
          pixels.setPixelColor(i, pixels.Color(r, 0, 0));
        }
        pixels.show();
        delay(baseDelay);

        // Instant off to make strobe
        pixels.clear();
        pixels.show();
        delay(max(4, baseDelay / 3));
      }

      // Algunas chispas aleatorias naranjas/blancas
      for (int s = 0; s < 30; s++) {
        int pix = random(NUMPIXELS);
        pixels.setPixelColor(pix, pixels.Color(255, random(120, 255), 60));
      }
      pixels.show();
      delay(120);
    }

    // 3) Explosión final: blanco brillante y degradado a apagado (simula destrucción)
    for (int i = 0; i < NUMPIXELS; i++) {
      pixels.setPixelColor(i, pixels.Color(255, 255, 255));
    }
    pixels.show();
    delay(400);

    // Fade a naranja/gris y luego apagar gradual
    for (int br = 255; br >= 0; br -= 5) {
      for (int i = 0; i < NUMPIXELS; i++) {
        // mezcla naranja / gris para simular humo/ruina
        uint8_t rr = br;
        uint8_t gg = br * 130 / 255; // menos verde
        uint8_t bb = br * 40 / 255;  // azul muy bajo
        pixels.setPixelColor(i, pixels.Color(rr, gg, bb));
      }
      pixels.show();
      delay(25);
    }

    apagar();
    delay(500);
  }
}

void latidoAnillos(uint8_t red, uint8_t green, uint8_t blue, int delayMs = 50, int repeats = 1) {
  for (int rep = 0; rep < repeats; rep++) {
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
}

void explosionCentro(uint8_t red, uint8_t green, uint8_t blue, int delayMs = 100, int repeats = 1) {
  int ringStarts[]  = {56, 40, 24, 0}; // de adentro hacia afuera
  int ringLengths[] = {7, 16, 16, 24};

  for (int rep = 0; rep < repeats; rep++) {
    for (int step = 0; step < 4; step++) {
      for (int i = 0; i < ringLengths[step]; i++) {
        pixels.setPixelColor(ringStarts[step] + i, pixels.Color(red, green, blue));
      }
      pixels.show();
      delay(delayMs);
    }
  }
}

void ondaBidireccional(uint8_t r1, uint8_t g1, uint8_t b1,
                       uint8_t r2, uint8_t g2, uint8_t b2, int delayMs = 100, int repeats = 1) {
  int ringStarts[]  = {56, 40, 24, 0};
  int ringLengths[] = {7, 16, 16, 24};

  for (int rep = 0; rep < repeats; rep++) {
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
}

void anilloGiratorio(int delayMs = 100, int repeats = 1) {
  static int pos[]     = {0, 0, 0, 0};
  int starts[]         = {0, 24, 40, 56};
  int sizes[]          = {24, 16, 16, 7};
  uint32_t colors[]    = {
    pixels.Color(255, 0, 0),
    pixels.Color(0, 255, 0),
    pixels.Color(0, 0, 255),
    pixels.Color(255, 255, 0)
  };

  for (int rep = 0; rep < repeats; rep++) {
    pixels.clear();
    for (int ring = 0; ring < 4; ring++) {
      int index = starts[ring] + pos[ring];
      pixels.setPixelColor(index, colors[ring]);
      pos[ring] = (pos[ring] + 1) % sizes[ring];
    }
    pixels.show();
    delay(delayMs);
  }
}

void sparkleAleatorio(int count = 10, int delayMs = 100, int repeats = 1) {
  for (int rep = 0; rep < repeats; rep++) {
    pixels.clear();
    for (int i = 0; i < count; i++) {
      int pix = random(NUMPIXELS);
      pixels.setPixelColor(pix, pixels.Color(random(100,255), random(100,255), random(100,255)));
    }
    pixels.show();
    delay(delayMs);
  }
}

void tornado(uint8_t colorR, uint8_t colorG, uint8_t colorB, int delayMs = 60, int repeats = 1) {
  for (int rep = 0; rep < repeats; rep++) {
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
}

void pulsoCentral(uint8_t red, uint8_t green, uint8_t blue, int delayMs = 30, int repeats = 1) {
  int ringStart  = 56;
  int ringLength = 7;

  for (int rep = 0; rep < repeats; rep++) {
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
}

void reboteColor(int delayMs = 15, int repeats = 1) {
  for (int rep = 0; rep < repeats; rep++) {
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

  server.on("/encender", [](){
    int r = getRepeatsFromClient();
    encenderTira(r);
    server.send(200, "text/plain", "Tira encendida !!!!!!!!!!!!!!!");
  });
  server.on("/cometa-circular", [](){
    int r = getRepeatsFromClient();
    cometaCircular(255, 0, 0, 20, r);
    apagar();
    server.send(200, "text/plain", "Cometa circular activado");
  });
  server.on("/autodestruccion", [](){
    int r = getRepeatsFromClient();
    autodestruccion(10, r);
    apagar();
    server.send(200, "text/plain", "🚨 Autodestrucción activada");
  });
  server.on("/latido-anillos", [](){
    int r = getRepeatsFromClient();
    latidoAnillos(0, 255, 0, 50, r);
    apagar();
    server.send(200, "text/plain", "Latido en anillos activado");
  });
  server.on("/explosion-centro", [](){
    int r = getRepeatsFromClient();
    explosionCentro(255, 100, 0, 100, r);
    apagar();
    server.send(200, "text/plain", "Explosión desde el centro activada");
  });
  server.on("/onda-bidireccional", [](){
    int r = getRepeatsFromClient();
    ondaBidireccional(255, 0, 0, 0, 0, 255, 100, r);
    apagar();
    server.send(200, "text/plain", "Onda bidireccional activada");
  });
  server.on("/anillo-giratorio", [](){
    int r = getRepeatsFromClient();
    anilloGiratorio(100, r);
    apagar();
    server.send(200, "text/plain", "Anillos giratorios activados");
  });
  server.on("/sparkle", [](){
    int r = getRepeatsFromClient();
    sparkleAleatorio(15, 100, r);
    apagar();
    server.send(200, "text/plain", "Efecto chispa activado");
  });
  server.on("/tornado", [](){
    int r = getRepeatsFromClient();
    tornado(100, 100, 255, 50, r);
    server.send(200, "text/plain", "Tornado activado");
  });
  server.on("/pulso-central", [](){
    int r = getRepeatsFromClient();
    pulsoCentral(255, 0, 255, 20, r);
    server.send(200, "text/plain", "Pulso central activado");
  });
  server.on("/rebote-color", [](){
    int r = getRepeatsFromClient();
    reboteColor(15, r);
    apagar();
    server.send(200, "text/plain", "Rebote activado");
  });
  server.on("/apagar", [](){ apagar(); server.send(200, "text/plain", "Apagado"); });

  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server iniciado");
}

void loop() {
  server.handleClient();
}
