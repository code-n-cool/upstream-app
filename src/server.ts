import * as net from 'net';
import * as dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

const client = new Client({
  user: 'your_db_user',
  host: 'localhost',
  database: 'telemetry_db',
  password: 'your_db_password',
  port: 5432,
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
