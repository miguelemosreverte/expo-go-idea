export interface GatewayHealth {
  status: 'ok' | 'degraded' | 'error';
  opencode: 'connected' | 'disconnected';
  timestamp: string;
}

export interface GatewayConfig {
  port: number;
  opencodeHost: string;
  opencodePort: number;
}
