import * as net from 'net';
import * as dotenv from 'dotenv';
import { Client } from 'pg';
import si from 'systeminformation';

dotenv.config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

const deviceSerial = process.env.DEVICE_SERIAL || 'device-001';

async function authenticate() {
  await client.connect();
  const res = await client.query('SELECT * FROM devices WHERE serial = $1', [deviceSerial]);
  if (res.rowCount === 0) {
    console.log('Authentication failed!');
    process.exit(1);
  }
  console.log('Authenticated:', res.rows[0]);
  return res.rows[0].frequency;
}

async function reportTelemetry(frequency: number) {
  const socket = new net.Socket();
  socket.connect(7777, 'localhost', () => {
    console.log('Connected to server.');
  });

  setInterval(async () => {
    try {
      const cpuTemp = await si.cpuTemperature();
      const temperature = cpuTemp.main || 0;
      const payload = JSON.stringify({ deviceSerial, temperature });
      socket.write(payload);
    } catch (error) {
      console.error('Error fetching CPU temperature:', error);
    }
  }, frequency);
}

async function handleReboot() {
  const frequency = await authenticate();
  await reportTelemetry(frequency);
}

async function main() {
  await handleReboot();
}

main().catch(console.error);
