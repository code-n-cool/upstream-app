import * as net from 'net';
import * as dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

const server = net.createServer((socket) => {
  socket.on('data', async (data) => {
    const payload = JSON.parse(data.toString());
    if (payload.deviceSerial) {
      const res = await client.query('SELECT * FROM devices WHERE serial = $1', [payload.deviceSerial]);
      if (res.rowCount === 0) {
        socket.write('Authentication failed!');
        socket.end();
      } else {
        await client.query(
          'INSERT INTO telemetry (device_serial, temperature) VALUES ($1, $2)',
          [payload.deviceSerial, payload.temperature]
        );
        socket.write(`Received data: ${payload.temperature}`);
      }
    }
  });
});

server.listen(7777, () => {
  console.log('Server listening on port 7777');
});
