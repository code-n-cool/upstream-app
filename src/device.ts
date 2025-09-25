import * as net from 'net';
import si from 'systeminformation';

const DEVICE_SERIAL = process.env.DEVICE_SERIAL || 'device-001';
let telemetryFrequency = 5000;

const socket = new net.Socket();

socket.connect(7777, 'localhost', () => {
  console.log('Connected to server');
  socket.write(JSON.stringify({ type: 'login', deviceSerial: DEVICE_SERIAL }));
});

socket.on('data', async (data) => {
  const message = JSON.parse(data.toString());

  switch (message.type) {
    case 'loginResponse':
      if (message.success) {
        telemetryFrequency = message.frequency;
        console.log('Login successful. Reporting frequency:', telemetryFrequency);
        startTelemetry();
      } else {
        console.log('Login failed');
        process.exit(1);
      }
      break;

    case 'command':
      handleCommand(message.command);
      break;

    case 'updateFrequency':
      telemetryFrequency = message.frequency;
      console.log('Telemetry frequency updated:', telemetryFrequency);
      break;
  }
});

async function startTelemetry() {
  setInterval(async () => {
    try {
      const cpuTemp = await si.cpuTemperature();
      const temperature = cpuTemp.main || 0;
      socket.write(JSON.stringify({ type: 'telemetry', deviceSerial: DEVICE_SERIAL, temperature }));
    } catch (error) {
      console.error('Error fetching CPU temperature:', error);
    }
  }, telemetryFrequency);
}

function handleCommand(command: string) {
  if (command === 'reboot') {
    console.log('Rebooting device...');
    process.exit(0); 
  }
}
