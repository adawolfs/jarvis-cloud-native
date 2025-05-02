#include <ESP8266WiFi.h>
#include <Adafruit_NeoPixel.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

// Configuración de red WiFi
const char* ssid = "adawolfs";
const char* password = "qawsedrftg";

// Configuración del servidor
ESP8266WebServer server(80);

// Configuración de NeoPixel
#define PIN_NEOPIXEL D6     // Pin D2 del Wemos D1 R1
#define NUMPIXELS 64          // Cambia según cuántos LEDs tenga tu tira

Adafruit_NeoPixel pixels(NUMPIXELS, PIN_NEOPIXEL, NEO_GRB + NEO_KHZ800);

#define DELAYVAL 500 // Time (in milliseconds) to pause between pixels

void handleRoot() {
  server.send(200, "text/plain", "Reactor ARC: Listo");
}


void handleNotFound(){
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET)?"GET":"POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (int i=0; i<server.args(); i++){
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);

}

void apagar() {
  pixels.clear();
  pixels.show();
}
void encenderTira() {
  for (int i = 0; i < NUMPIXELS; i++) {
    pixels.setPixelColor(i, pixels.Color(0, 0, 250)); // Rojo
  }
  pixels.show();
  Serial.println("Tira encendida");
}

void cometaCircular(uint8_t r, uint8_t g, uint8_t b, int delayMs = 20) {
  for (int i = 0; i < NUMPIXELS; i++) {
    pixels.clear();
    for (int t = 0; t < 5; t++) {
      int pos = (i - t + NUMPIXELS) % NUMPIXELS;
      pixels.setPixelColor(pos, pixels.Color(r / (t + 1), g / (t + 1), b / (t + 1)));
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

void latidoAnillos(uint8_t r, uint8_t g, uint8_t b, int delayMs = 50) {
  int ringStarts[] = {0, 24, 40, 56};  // LED inicio por anillo
  int ringLengths[] = {24, 16, 16, 7};

  for (int pulse = 0; pulse < 2; pulse++) {
    for (int brightness = 0; brightness <= 255; brightness += 30) {
      pixels.clear();
      for (int r = 0; r < 4; r++) {
        for (int i = 0; i < ringLengths[r]; i++) {
          pixels.setPixelColor(ringStarts[r] + i, pixels.Color(r * brightness / 255, g * brightness / 255, b * brightness / 255));
        }
      }
      pixels.show();
      delay(delayMs);
    }
    delay(100);
  }
}

void explosionCentro(uint8_t r, uint8_t g, uint8_t b, int delayMs = 100) {
  int ringStarts[] = {56, 40, 24, 0}; // Desde adentro hacia afuera
  int ringLengths[] = {7, 16, 16, 24};

  for (int step = 0; step < 4; step++) {
    for (int i = 0; i < ringLengths[step]; i++) {
      pixels.setPixelColor(ringStarts[step] + i, pixels.Color(r, g, b));
    }
    pixels.show();
    delay(delayMs);
  }
}

void ondaBidireccional(uint8_t r1, uint8_t g1, uint8_t b1, uint8_t r2, uint8_t g2, uint8_t b2, int delayMs = 100) {
  int ringStarts[] = {56, 40, 24, 0};
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
  static int pos[] = {0, 0, 0, 0};
  int starts[] = {0, 24, 40, 56};
  int sizes[] = {24, 16, 16, 7};
  uint32_t colors[] = {pixels.Color(255, 0, 0), pixels.Color(0, 255, 0), pixels.Color(0, 0, 255), pixels.Color(255, 255, 0)};

  pixels.clear();
  for (int r = 0; r < 4; r++) {
    int index = starts[r] + pos[r];
    pixels.setPixelColor(index, colors[r]);
    pos[r] = (pos[r] + 1) % sizes[r];
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


void tornado(uint8_t r, uint8_t g, uint8_t b, int delayMs = 60) {
  int ringStarts[] = {0, 24, 40, 56};
  int ringLengths[] = {24, 16, 16, 7};

  for (int i = 0; i < 24; i++) {
    pixels.clear();
    for (int r = 0; r < 4; r++) {
      int idx = ringStarts[r] + (i % ringLengths[r]);
      pixels.setPixelColor(idx, pixels.Color(r, g, b));
    }
    pixels.show();
    delay(delayMs);
  }
}

void pulsoCentral(uint8_t r, uint8_t g, uint8_t b, int delayMs = 30) {
  int ringStart = 56;
  int ringLength = 7;

  for (int br = 0; br <= 255; br += 10) {
    for (int i = 0; i < ringLength; i++) {
      pixels.setPixelColor(ringStart + i, pixels.Color(r * br / 255, g * br / 255, b * br / 255));
    }
    pixels.show();
    delay(delayMs);
  }

  for (int br = 255; br >= 0; br -= 10) {
    for (int i = 0; i < ringLength; i++) {
      pixels.setPixelColor(ringStart + i, pixels.Color(r * br / 255, g * br / 255, b * br / 255));
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


void setup() {
  // These lines are specifically to support the Adafruit Trinket 5V 16 MHz.
  // Any other board, you can remove this part (but no harm leaving it):
#if defined(__AVR_ATtiny85__) && (F_CPU == 16000000)
  clock_prescale_set(clock_div_1);
#endif
  // END of Trinket-specific code.

  pixels.begin();           // Inicializa los LEDs
  pixels.clear();           // Apaga todos los LEDs al inicio
  pixels.show();

  encenderTira();

  Serial.begin(115200);
  // Conexión a WiFi
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);


  IPAddress local_IP(192,168,177,128);      // IP fija deseada
  IPAddress gateway(192,168,177,185);         // Dirección del router
  IPAddress subnet(255, 255, 255, 0);        // Máscara de subred
  IPAddress primaryDNS(8, 8, 8, 8);          // Opcional
  IPAddress secondaryDNS(8, 8, 4, 4);        // Opcional

  if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
    Serial.println("Fallo al configurar IP estática");
  }


  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.print("Dirección IP: ");
  Serial.println(WiFi.localIP());
  

  if (MDNS.begin("esp8266")) {
    Serial.println("MDNS responder started");
  }

  server.on("/", handleRoot);

  server.on("/inline", [](){
    server.send(200, "text/plain", "this works as well");
  });

  server.on("/encender", [](){
    encenderTira();
    server.send(200, "text/plain", "Tira encendida");
  });

   
  server.on("/cometa-circular", [](){
    cometaCircular(255, 0, 0, 20); // Rojo
    server.send(200, "text/plain", "Cometa circular activado");
  });

  server.on("/barrido-arcoiris", [](){
    barridoArcoiris(10);
    server.send(200, "text/plain", "Barrido arcoíris activado");
  });

  server.on("/latido-anillos", [](){
    latidoAnillos(0, 255, 0, 50); // Verde
    server.send(200, "text/plain", "Latido en anillos activado");
  });

  server.on("/explosion-centro", [](){
    explosionCentro(255, 100, 0, 100); // Naranja
    server.send(200, "text/plain", "Explosión desde el centro activada");
  });

  server.on("/onda-bidireccional", [](){
    ondaBidireccional(255, 0, 0, 0, 0, 255, 100); // Rojo que regresa en azul
    server.send(200, "text/plain", "Onda bidireccional activada");
  });

  server.on("/anillo-giratorio", [](){
    for (int i = 0; i < 40; i++) anilloGiratorio(100); // 40 vueltas aprox.
    server.send(200, "text/plain", "Anillos giratorios activados");
  });

  server.on("/sparkle", [](){
    for (int i = 0; i < 40; i++) sparkleAleatorio(15, 100);
    server.send(200, "text/plain", "Efecto chispa activado");
  });

  server.on("/tornado", [](){
    tornado(100, 100, 255, 50); // Azul claro
    server.send(200, "text/plain", "Tornado activado");
  });

  server.on("/pulso-central", [](){
    for (int i = 0; i < 4; i++) pulsoCentral(255, 0, 255, 20); // Fucsia
    server.send(200, "text/plain", "Pulso central activado");
  });

  server.on("/rebote-color", [](){
    reboteColor(15);
    server.send(200, "text/plain", "Rebote activado");
  });

  server.on("/apagar", [](){
    apagar();
    server.send(200, "text/plain", "Apagado");
  });



  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");
}

void loop(void){
  server.handleClient();
}
