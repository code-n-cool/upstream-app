const telemetryTableBody = document.querySelector('#telemetryTable tbody');
const deviceSerialInput = document.getElementById('deviceSerial');
const freqInput = document.getElementById('freqInput');
const updateFreqBtn = document.getElementById('updateFreq');
const rebootBtn = document.getElementById('rebootBtn');

function appendTelemetryRow({ timestamp, device_serial, temperature }) {
  const row = document.createElement('tr');
  const tsCell = document.createElement('td');
  tsCell.textContent = new Date(timestamp).toLocaleString();
  const serialCell = document.createElement('td');
  serialCell.textContent = device_serial;
  const tempCell = document.createElement('td');
  tempCell.textContent = temperature;
  row.appendChild(tsCell);
  row.appendChild(serialCell);
  row.appendChild(tempCell);
  telemetryTableBody.appendChild(row);
}

async function loadTelemetry() {
  const res = await fetch('/telemetry');
  const data = await res.json();
  data.forEach(appendTelemetryRow);
}

const ws = new WebSocket(`ws://${window.location.host}/ws`);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  appendTelemetryRow(data);
};

updateFreqBtn.onclick = async () => {
  const deviceSerial = deviceSerialInput.value;
  const frequency = parseInt(freqInput.value, 10);
  await fetch('/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceSerial, command: 'updateFrequency', frequency })
  });
  alert('Frequency update command sent');
};

rebootBtn.onclick = async () => {
  const deviceSerial = deviceSerialInput.value;
  await fetch('/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceSerial, command: 'reboot' })
  });
  alert('Reboot command sent');
};

window.onload = loadTelemetry;
