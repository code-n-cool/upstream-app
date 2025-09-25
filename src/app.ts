import express from 'express';
import { Client } from 'pg';
import expressWs from 'express-ws';
import path from 'path';
import * as dotenv from 'dotenv';

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
app.use(express.static(path.join(__dirname, 'public')));

app.get('/telemetry', async (req, res) => {
  const { rows } = await client.query('SELECT * FROM telemetry ORDER BY timestamp DESC');
  res.json(rows);
});

wsInstance.app.ws('/ws', (ws, req) => {
  ws.on('message', (msg) => {
    console.log('Received message:', msg);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

app.post('/command', async (req, res) => {
  const { deviceSerial, command } = req.body;

  if (command === 'reboot') {
    console.log('Reboot command received');
  } else {
    res.status(400).send('Invalid command');
  }
});

app.listen(8080, () => {
  console.log('App listening on port 8080');
});
