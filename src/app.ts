import express from 'express';
import { Client } from 'pg';
import expressWs from 'express-ws';
import path from 'path';
import * as dotenv from 'dotenv';
import { startServer, sendCommandToDevice, updateDeviceFrequency } from './server';

dotenv.config();

const app = express();
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

const wsInstance = expressWs(app);
app.use(express.json());

const wsClients = new Set<any>();

wsInstance.app.ws('/ws', (ws) => {
  wsClients.add(ws);
  ws.on('close', () => wsClients.delete(ws));
});

function notifyFrontendTelemetry(data: any) {
  for (const ws of wsClients) {
    if (ws.readyState === 1) ws.send(JSON.stringify(data));
  }
}

app.use(express.static(path.join(__dirname)));

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

// app.get('/app-front.js', (req, res) => {
//   res.sendFile(path.join(__dirname, 'app-front.js'));
// });

app.get('/telemetry', async (req, res) => {
  const { rows } = await client.query('SELECT * FROM telemetry ORDER BY timestamp DESC');
  res.json(rows);
});

app.post('/command', (req, res) => {
  const { deviceSerial, command, frequency } = req.body;

  if (command === 'reboot') {
    sendCommandToDevice(deviceSerial, 'reboot');
  } else if (command === 'updateFrequency' && frequency) {
    updateDeviceFrequency(deviceSerial, frequency);
  } else {
    return res.status(400).send('Invalid command');
  }

  res.send('Command sent');
});

if (require.main === module) {
  (async () => {
    await client.connect();
    startServer(notifyFrontendTelemetry);

    app.listen(8080, () => console.log('App listening on port 8080'));
  })().catch(console.error);
}
