import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import mqtt from 'mqtt';

const SERIAL_PORT = 'COM4';
const BAUD_RATE = 9600;
const MQTT_BROKER = 'mqtt://broker.hivemq.com:1883';
const MQTT_TOPIC = 'senai/iot/dh11';

const port = new SerialPort({ path: SERIAL_PORT, baudRate: BAUD_RATE });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
  console.log('[MQTT] Conectado ao broker:', MQTT_BROKER);
});

parser.on('data', (line) => {
  try {
    const data = JSON.parse(line.trim());
    if (data.temperatura !== undefined && data.umidade !== undefined) {
      client.publish(MQTT_TOPIC, JSON.stringify(data));
      console.log('[SERIAL → MQTT]', data);
    }
  } catch (err) {
    console.error('[ERRO] Dados inválidos:', err.message);
  }
});
