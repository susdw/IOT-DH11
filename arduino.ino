#include <DHT.h>

#define LEDPIN 3
#define DHTPIN 2
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);
const int OVERHEATING_THRESHOLD = 30;

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  delay(2000);

  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println(F("{\"erro\":\"Falha ao ler o sensor DHT11\"}"));
    return;
  }

  // envia informações do sensor em formato JSON
  Serial.print(F("{\"temperatura\":"));
  Serial.print(temperature, 1);
  Serial.print(F(",\"umidade\":"));
  Serial.print(humidity, 1);
  Serial.println(F("}"));

  if (temperature > OVERHEATING_THRESHOLD) {
    digitalWrite(LEDPIN, HIGH);
  } else {
    digitalWrite(LEDPIN, LOW);
  }
}