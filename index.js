import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import mqtt from 'mqtt';

const SERIAL_PORT = 'COM4';
const BAUD_RATE = 9600;
const MQTT_BROKER = 'mqtt://broker.hivemq.com:1883';
const MQTT_TOPIC = 'carlos/dht11';

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
      console.log(data);
    }
  } catch (err) {
    console.error('[ERRO] Dados inválidos:', err.message);
  }
});

// Redirect to login screen by default
if (!localStorage.getItem('loggedIn')) {
    window.location.href = 'login.html';
}

// Handle login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Simulate authentication (replace with real authentication logic)
        if (username === 'admin' && password === 'password') {
            if (rememberMe) {
                localStorage.setItem('loggedIn', true);
            } else {
                sessionStorage.setItem('loggedIn', true);
            }
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid username or password');
        }
    });
}
