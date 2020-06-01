#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
#include <avr/power.h> // Required for 16 MHz Adafruit Trinket
#endif

// Which pin on the Arduino is connected to the NeoPixels?
// On a Trinket or Gemma we suggest changing this to 1:
#define LED_PIN 6

// How many NeoPixels are attached to the Arduino?
#define LED_COUNT 12

// Declare our NeoPixel strip object:
Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

#define CHUNK_SIZE 45
unsigned char buffer[45];
int buffer2;
int ledCounter = 1;
int chunkCounter = 1;

void setup()
{
  // These lines are specifically to support the Adafruit Trinket 5V 16 MHz.
  // Any other board, you can remove this part (but no harm leaving it):
#if defined(__AVR_ATtiny85__) && (F_CPU == 16000000)
  clock_prescale_set(clock_div_1);
#endif
  // END of Trinket-specific code.

  strip.begin();            // INITIALIZE NeoPixel strip object (REQUIRED)
  strip.show();             // Turn OFF all pixels ASAP
  strip.setBrightness(255); // Set BRIGHTNESS to about 1/5 (max = 255)

  Serial.begin(36000);
  Serial.println('1');
}

void loop()
{
  while (Serial.available() < CHUNK_SIZE)
  {
  }
  buffer2 = Serial.read();
  Serial.print(buffer[0]);
  /*if (Serial.available())  {
    int messageLength = Serial.readBytes(buffer, 3);

    if (messageLength == 3) {
      Serial.print("LED:");
      Serial.print(ledCounter);
      Serial.print("-RGB:");
      Serial.print(buffer[0]);
      Serial.print(",");
      Serial.print(buffer[1]);
      Serial.print(",");
      Serial.print(buffer[2]);

      strip.setPixelColor(ledCounter, strip.Color(buffer[0],buffer[1],buffer[2]));
      strip.show();
      
      ledCounter++;

      if (ledCounter > 150) {
        ledCounter = 1;
      }
    } else {
      Serial.println("ERROR, did not receive enough values");
    }
    
  }

  /*for(int i = 0; i < sizeof(values); i++) {
    Serial.println(values[i]);
  }*/

  delay(100);
}