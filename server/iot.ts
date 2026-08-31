import { IoTDevice, Package, SensorEvent, TransportRoute } from '../src/types/index.ts';

// Haversine formula to compute great-circle distance between two coordinates in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(3));
}

// Compute shortest distance from a point to a segmented route path
export function calculateDistanceToRoute(point: [number, number], routePoints: [number, number][]): number {
  if (routePoints.length === 0) return 0;
  let minDistance = Infinity;

  for (let i = 0; i < routePoints.length - 1; i++) {
    const p1 = routePoints[i];
    const p2 = routePoints[i + 1];
    // Distance to point 1
    const d1 = calculateDistanceKm(point[0], point[1], p1[0], p1[1]);
    // Distance to midpoint for smoother corridor approximation
    const midLat = (p1[0] + p2[0]) / 2;
    const midLon = (p1[1] + p2[1]) / 2;
    const dMid = calculateDistanceKm(point[0], point[1], midLat, midLon);
    const d2 = calculateDistanceKm(point[0], point[1], p2[0], p2[1]);

    const segMin = Math.min(d1, dMid, d2);
    if (segMin < minDistance) {
      minDistance = segMin;
    }
  }

  return Number(minDistance.toFixed(2));
}

export class IoTService {
  private devices: Map<string, IoTDevice> = new Map();
  private eventHistory: SensorEvent[] = [];

  constructor() {
    this.seedDevices();
  }

  private seedDevices() {
    // 30 IoT smart exam container boxes
    for (let i = 1; i <= 30; i++) {
      const id = `IOT-BOX-${String(i).padStart(3, '0')}`;
      const packageId = i <= 20 ? `ES-PKG-${82930 + i}` : undefined;
      const device: IoTDevice = {
        id,
        type: 'SMART_BOX',
        packageId,
        firmwareVersion: 'v3.8.2-FIPS',
        batteryLevel: Math.floor(82 + (i % 18)),
        status: i === 7 ? 'COMPROMISED' : 'ONLINE',
        lastSeen: new Date(Date.now() - (i % 5) * 60000).toISOString(),
        certificateId: `CERT-ESP32-SECURE-ENCLAVE-${1000 + i}`,
        sensors: {
          reedSwitch: i === 7 ? 'OPEN' : 'CLOSED',
          accelerometerG: i === 7 ? 3.4 : 1.02,
          temperatureCelsius: Number((24.5 + (i % 4) * 0.8).toFixed(1)),
          lightLux: i === 7 ? 480 : 0.5,
          gpsLock: true,
          tamperState: i === 7,
        },
      };
      this.devices.set(id, device);
    }
  }

  public getDevices(): IoTDevice[] {
    return Array.from(this.devices.values());
  }

  public getDevice(id: string): IoTDevice | undefined {
    return this.devices.get(id);
  }

  public recordSensorTelemetry(telemetry: {
    deviceId: string;
    packageId: string;
    reedSwitch?: 'CLOSED' | 'OPEN';
    accelerometerG?: number;
    temperatureCelsius?: number;
    lightLux?: number;
    lat: number;
    lng: number;
    address: string;
    batteryLevel?: number;
  }): { event: SensorEvent; isTamperAlert: boolean; alertReason?: string } {
    const device = this.devices.get(telemetry.deviceId);
    const timestamp = new Date().toISOString();

    if (device) {
      if (telemetry.reedSwitch !== undefined) device.sensors.reedSwitch = telemetry.reedSwitch;
      if (telemetry.accelerometerG !== undefined) device.sensors.accelerometerG = telemetry.accelerometerG;
      if (telemetry.temperatureCelsius !== undefined) device.sensors.temperatureCelsius = telemetry.temperatureCelsius;
      if (telemetry.lightLux !== undefined) device.sensors.lightLux = telemetry.lightLux;
      if (telemetry.batteryLevel !== undefined) device.batteryLevel = telemetry.batteryLevel;
      device.lastSeen = timestamp;
    }

    let isTamperAlert = false;
    let alertReason = '';
    let eventType: SensorEvent['eventType'] = 'GPS_UPDATED';
    let severity: SensorEvent['severity'] = 'INFO';

    // Tamper condition: Physical opening of seal / container
    if (telemetry.reedSwitch === 'OPEN' || (telemetry.lightLux && telemetry.lightLux > 100)) {
      isTamperAlert = true;
      eventType = 'PACKAGE_OPENED';
      severity = 'CRITICAL';
      alertReason = `Physical container breach: Reed magnetic switch opened & ambient light detected (${telemetry.lightLux ?? 450} Lux)`;
      if (device) {
        device.sensors.tamperState = true;
        device.status = 'COMPROMISED';
      }
    } else if (telemetry.accelerometerG && telemetry.accelerometerG > 3.0) {
      isTamperAlert = true;
      eventType = 'MOVEMENT_DETECTED';
      severity = 'HIGH';
      alertReason = `Extreme kinetic shock / impact detected (${telemetry.accelerometerG}G)`;
    } else if (telemetry.temperatureCelsius && (telemetry.temperatureCelsius > 42 || telemetry.temperatureCelsius < 5)) {
      isTamperAlert = true;
      eventType = 'TEMPERATURE_CHANGED';
      severity = 'MEDIUM';
      alertReason = `Thermal envelope breach: Temperature at ${telemetry.temperatureCelsius}°C (Allowed: 10°C - 38°C)`;
    }

    const event: SensorEvent = {
      id: `EVT-IOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      deviceId: telemetry.deviceId,
      packageId: telemetry.packageId,
      timestamp,
      eventType,
      location: {
        lat: telemetry.lat,
        lng: telemetry.lng,
        address: telemetry.address,
      },
      sensorValues: {
        reedSwitch: telemetry.reedSwitch,
        temperature: telemetry.temperatureCelsius,
        light: telemetry.lightLux,
        shock: telemetry.accelerometerG,
      },
      severity,
    };

    this.eventHistory.unshift(event);
    if (this.eventHistory.length > 500) this.eventHistory.pop();

    return { event, isTamperAlert, alertReason };
  }

  public getEventsForPackage(packageId: string): SensorEvent[] {
    return this.eventHistory.filter((e) => e.packageId === packageId);
  }

  public getAllEvents(): SensorEvent[] {
    return [...this.eventHistory];
  }
}

export const iotService = new IoTService();
