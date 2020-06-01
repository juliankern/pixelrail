#include <Adafruit_NeoPixel.h>

// Which pin on the Arduino is connected to the NeoPixels?
// On a Trinket or Gemma we suggest changing this to 1:
#define LED_PIN    6

// How many NeoPixels are attached to the Arduino?
#define LED_COUNT 150

// Declare our NeoPixel strip object:
Adafruit_NeoPixel strip(12, LED_PIN, NEO_GRB + NEO_KHZ800);

#define CHUNK_SIZE 15

#define SIGNAL_READY 1

int ledCounter = 0;
int chunkCounter = 1;
//int bufferCounter = 0;
unsigned char buffer[3];

void sendReady() {
  //Serial.flush();
  Serial.println();
  Serial.println(SIGNAL_READY);
}

void setup() {
  strip.begin();           // INITIALIZE NeoPixel strip object (REQUIRED)
  strip.show();            // Turn OFF all pixels ASAP
  strip.setBrightness(255); // Set BRIGHTNESS to about 1/5 (max = 255)

  
  Serial.begin(2000000);
  sendReady();
}

void loop() { 
  if (Serial.available())  {
    /*Serial.println("got values?");
    Serial.print(Serial.available());*/
  
    if (Serial.readBytes(buffer, 3) == 3) {
      /*if (buffer[0] != 0) {
        switch (buffer[0]) {
          case 1:
            // Start command
            ledCounter = 0;
            chunkCounter = 1;
            break; 
        }
      }*/
      
      
      
      strip.setPixelColor(ledCounter, strip.Color(buffer[0],buffer[1],buffer[2]));
      //strip.setPixelColor(buffer[0], strip.Color(buffer[1],buffer[2],buffer[3]));
      //strip.show();
      
      ledCounter++;

      /*Serial.print(ledCounter);
      Serial.print(">");
      Serial.print(chunkCounter);
      Serial.print("*");
      Serial.print(CHUNK_SIZE);
      Serial.print("=");
      Serial.print(ledCounter > chunkCounter * CHUNK_SIZE);*/
      if (ledCounter == chunkCounter * CHUNK_SIZE) {
        chunkCounter++;
        sendReady();
      }

      if (ledCounter == LED_COUNT) {
        strip.show();
        ledCounter = 0;
        chunkCounter = 1;
      }
    } else {
      Serial.println("ERROR, did not receive enough values");
      //Serial.print(Serial.readBytes(buffer, 3));
    }
  }
}