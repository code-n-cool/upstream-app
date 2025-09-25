<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Telemetry Monitoring</title>
</head>
<body>
  <h1>Telemetry Data</h1>
  <div id="data"></div>
  <button onclick="rebootDevice()">Reboot Device</button>

  <script>
    const ws = new WebSocket('ws://localhost:8080/ws');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      document.getElementById('data').innerHTML = JSON.stringify(data);
    };

    function rebootDevice() {
      fetch('/command', {
        method: 'POST',
        body: JSON.stringify({ deviceSerial: 'device-001', command: 'reboot' }),
        headers: { 'Content-Type': 'application/json' }
      });
    }
  </script>
</body>
</html>