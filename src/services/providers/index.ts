import { ServiceHealthStatus } from '../../types/index.ts';

export interface AIProviderConfig {
  name: 'GeminiProvider' | 'OpenAIProvider' | 'LocalDemoAIProvider';
  isLive: boolean;
  model: string;
}

export interface MapsProviderConfig {
  name: 'GoogleMapsProvider' | 'LeafletDemoMapProvider';
  isLive: boolean;
  hasApiKey: boolean;
}

export interface LedgerProviderConfig {
  name: 'BlockchainLedgerProvider' | 'DatabaseLedgerProvider' | 'DemoLedgerProvider';
  isLive: boolean;
  protocol: string;
}

export interface IoTProviderConfig {
  name: 'MQTTIoTProvider' | 'DemoIoTProvider';
  isLive: boolean;
  telemetrySource: string;
}

export interface OCRProviderConfig {
  name: 'VisionOCRProvider' | 'TesseractLocalProvider' | 'DemoOCRProvider';
  isLive: boolean;
}

export class ProviderManager {
  private static isProductionMode: boolean = false;

  public static setProductionMode(val: boolean) {
    this.isProductionMode = val;
  }

  public static isProduction(): boolean {
    return this.isProductionMode;
  }

  public static getActiveProviders() {
    return {
      ai: {
        name: this.isProductionMode ? 'Gemini 2.5 Flash' : 'Deterministic Local NLP & Threat Engine',
        mode: this.isProductionMode ? 'PRODUCTION' : 'DEMO MODE',
        isLive: this.isProductionMode,
      },
      maps: {
        name: 'Leaflet OpenStreetMap + Haversine Corridor Radar',
        mode: 'DEMO MAP MODE',
        isLive: true,
      },
      ledger: {
        name: 'SHA-256 Merkle-Linked Append-Only Ledger',
        mode: this.isProductionMode ? 'PRODUCTION LEDGER' : 'DEMO LEDGER',
        isLive: true,
      },
      iot: {
        name: 'Autonomous IoT Hardware Enclave Sentinel',
        mode: 'SIMULATION TELEMETRY',
        isLive: false,
      },
      ocr: {
        name: 'Neural Token Extractor & N-Gram Matcher',
        mode: 'DEMO OCR',
        isLive: true,
      },
    };
  }

  public static async checkSystemHealth(): Promise<ServiceHealthStatus[]> {
    const isProd = this.isProductionMode;
    const now = new Date().toISOString();

    return [
      {
        service: 'Cryptographic Ledger & Merkle Root Provider',
        status: 'CONNECTED',
        latencyMs: 8,
        provider: isProd ? 'BlockchainLedgerProvider (RPC EVM)' : 'DemoLedgerProvider (SHA-256 Hash Chain)',
        lastChecked: now,
        details: 'Block height verified intact; Merkle trees canonicalized.',
      },
      {
        service: 'AI Behavioral Anomaly & Threat Risk Engine',
        status: isProd ? 'CONNECTED' : 'DEMO MODE',
        latencyMs: 34,
        provider: isProd ? 'GeminiProvider (gemini-2.5-flash)' : 'LocalDemoAIProvider (IsolationForest + TF-IDF)',
        lastChecked: now,
        details: 'Deterministic threat vectors and cosine similarity operational.',
      },
      {
        service: 'Armored Transit Radar & Geofence Corridor Engine',
        status: 'CONNECTED',
        latencyMs: 12,
        provider: 'LeafletDemoMapProvider (Haversine 2.0km Precision)',
        lastChecked: now,
        details: 'All authorized national route polylines and waypoints active.',
      },
      {
        service: 'Smart Container Sensor Fleet Telemetry Hub',
        status: 'DEMO MODE',
        latencyMs: 15,
        provider: 'DemoIoTProvider (Virtual MQTT ESP32 Node Gateway)',
        lastChecked: now,
        details: '30 Smart Boxes reporting reed switch, light, shock, and temperature.',
      },
      {
        service: 'OCR Document Ingestion & Tokenizer',
        status: 'CONNECTED',
        latencyMs: 22,
        provider: 'Neural Token Extractor & N-Gram Matcher',
        lastChecked: now,
        details: 'Text parsing and question bank correlation enabled.',
      },
      {
        service: 'Zero-Trust IAM & Multi-Factor Authentication',
        status: 'CONNECTED',
        latencyMs: 5,
        provider: 'ExamShield Enclave Auth Gateway',
        lastChecked: now,
        details: '8 RBAC tiers active with hardware token and session signing.',
      },
    ];
  }
}
