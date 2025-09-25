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

const devices: Record<string, net.Socket> = {};

export function startServer(notifyFrontendTelemetry: (data: any) => void) {
  const server = net.createServer((socket) => {
    let deviceSerial: string;

    socket.on('data', async (data) => {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'login':
          deviceSerial = message.deviceSerial;
          const res = await client.query('SELECT * FROM devices WHERE serial = $1', [deviceSerial]);

          if (res.rowCount === 0) {
            socket.write(JSON.stringify({ type: 'loginResponse', success: false }));
            socket.end();
          } else {
            devices[deviceSerial] = socket;
            const frequency = res.rows[0].frequency || 5000;
            socket.write(JSON.stringify({ type: 'loginResponse', success: true, frequency }));
            console.log(`Device ${deviceSerial} authenticated`);
          }
          break;

        case 'telemetry':
          if (deviceSerial) {
            await client.query(
              'INSERT INTO telemetry (device_serial, temperature) VALUES ($1, $2)',
              [message.deviceSerial, message.temperature]
            );

            notifyFrontendTelemetry({
              device_serial: message.deviceSerial,
              temperature: message.temperature,
              timestamp: new Date().toISOString(),
            });

            console.log(`Telemetry received from ${deviceSerial}: ${message.temperature}`);
          }
          break;
      }
    });

    socket.on('close', () => {
      if (deviceSerial) delete devices[deviceSerial];
      console.log(`Device ${deviceSerial} disconnected`);
    });
  });

  server.listen(7777, async () => {
    await client.connect();
    console.log('Device server listening on port 7777');
  });
}

export function sendCommandToDevice(serial: string, command: string) {
  const deviceSocket = devices[serial];
  if (deviceSocket) {
    deviceSocket.write(JSON.stringify({ type: 'command', command }));
  }
}

export function updateDeviceFrequency(serial: string, frequency: number) {
  const deviceSocket = devices[serial];
  if (deviceSocket) {
    deviceSocket.write(JSON.stringify({ type: 'updateFrequency', frequency }));
  }
}

if (require.main === module) {
  startServer(() => {});
}