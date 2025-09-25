CREATE TABLE devices (
  serial VARCHAR(255) PRIMARY KEY,
  last_login TIMESTAMP,
  frequency INT
);

CREATE TABLE telemetry (
  id SERIAL PRIMARY KEY,
  device_serial VARCHAR(255) REFERENCES devices(serial),
  temperature FLOAT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);