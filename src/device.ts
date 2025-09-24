import * as net from 'net';
import * as dotenv from 'dotenv';
import { Client } from 'pg';
import * as os from 'os';
import si from 'systeminformation';

dotenv.config();

const client = new Client({
  user: 'your_db_user',
  host: 'localhost',
  database: 'telemetry_db',
  password: 'your_db_password',
  port: 5432,
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

async function main() {
  const frequency = await authenticate();
  await reportTelemetry(frequency);
}

main().catch(console.error);
