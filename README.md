# IoT Device Telemetry & Control System

## Overview
This project implements a complete **IoT telemetry system** where simulated devices connect to a backend server, report CPU temperature data, and receive remote commands such as frequency updates and reboots. The system is built with **TypeScript, Node.js, Express, PostgreSQL, and WebSockets**, and includes a simple frontend dashboard to visualize telemetry data in real-time.

---

## Key Features
- **Device Simulation**
  - Devices connect via TCP sockets (`net` module).
  - Each device reports telemetry (CPU temperature) at a configurable frequency.
  - Devices can receive commands (`updateFrequency`, `reboot`).

- **Backend (Server)**
  - Built with **Express + WebSockets** for real-time updates.
  - Stores telemetry data in **PostgreSQL**.
  - Exposes REST APIs:
    - `GET /telemetry` → fetch all telemetry history.
    - `POST /command` → send commands to devices.
  - Broadcasts live telemetry updates via WebSocket to frontend clients.

- **Frontend (Dashboard)**
  - **index.html + app-front.js** served by Express.
  - Displays a **real-time telemetry table** with device serial, timestamp, and temperature.
  - Commands can be sent via UI controls:
    - Update telemetry frequency.
    - Reboot device.
  - New telemetry data appears **instantly at the top of the table**.

---

## Technologies Used
- **Node.js + TypeScript** (core server + device simulation)
- **Express** (API + static frontend hosting)
- **express-ws** (WebSocket integration)
- **PostgreSQL** (persistent telemetry storage)
- **systeminformation** (device CPU temperature data)
- **HTML + JavaScript** (frontend dashboard)

---

## Setup & Run

### 1. Clone the repo
```bash
git clone https://github.com/code-n-cool/upstream-app.git
cd upstream-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Create a `.env` file:
```bash
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
DB_NAME=telemetrydb
DEVICE_SERIAL=device-001
SERVER_HOST=localhost
```

### 4. Start the server
```bash
ts-node src/app.ts
```

### 5. Start a simulated device
```bash
ts-node src/device.ts
```

### 6. Open the dashboard
```bash
http://localhost:8080
```

## Example Workflow

1. Start server and device.
2. Device logs in and begins sending telemetry at default frequency.
3. Backend stores data in PostgreSQL and pushes live updates to frontend.
4. User opens the dashboard to see telemetry updates in real time.
5. User sends Update Frequency or Reboot command from the UI.

## Possible Improvements

- Add authentication & authorization for devices and frontend users.
- Implement historical charts for temperature trends.
- Add multi-device support with filtering in the dashboard.
- Deploy using Docker with PostgreSQL and Node.js services.

## Device Reboot Support with PM2 (Optional Improvement)
In this project, the simulated IoT device (`device.ts`) can receive a **reboot** command from the backend.  
By default, calling `process.exit(0)` just ends the Node process.  
To make it feel like a real device reboot, I use **[PM2](https://pm2.keymetrics.io/)** as a process manager to automatically restart the device when it exits.

### 1. Install PM2
```bash
npm install -g pm2
```

### 2. Start the device under PM2
```bash
pm2 start src/device.ts --interpreter ts-node --name device-001
```

### 3. Verify and monitor
```bash
pm2 list

pm2 logs device-001
```

### 4. Multiple devices (optional)
To simulate multiple IoT devices
```bash
pm2 start src/device.ts --interpreter ts-node --name device-002 -- --DEVICE_SERIAL=device-002
```

### 6. Auto-start on system boot (optional)
```bash
pm2 startup
pm2 save
```