export interface OpenCodeManagerOptions {
  host?: string;
  port?: string;
  onCrash?: () => void;
}

export class OpenCodeManager {
  private host: string;
  private port: string;
  private running = false;
  private onCrash?: () => void;

  constructor(options?: OpenCodeManagerOptions) {
    this.host = options?.host ?? process.env['OPENCODE_HOST'] ?? 'localhost';
    this.port = options?.port ?? process.env['OPENCODE_PORT'] ?? '4096';
    this.onCrash = options?.onCrash;
  }

  /** Start the OpenCode process (stub: assumes already running). */
  async spawn(): Promise<void> {
    // Stub: in production this would spawn the OpenCode process.
    // For now, we just mark it as running assuming an external process exists.
    this.running = true;
  }

  /** Gracefully stop the OpenCode process. */
  async stop(): Promise<void> {
    this.running = false;
  }

  /** Restart the OpenCode process. */
  async restart(): Promise<void> {
    await this.stop();
    await this.spawn();
  }

  /** Check if the OpenCode process is alive by hitting its health endpoint. */
  async isRunning(): Promise<boolean> {
    try {
      const res = await fetch(`http://${this.host}:${this.port}/global/health`, {
        signal: AbortSignal.timeout(3000),
      });
      this.running = res.ok;
      return res.ok;
    } catch {
      this.running = false;
      if (this.onCrash) {
        this.onCrash();
      }
      return false;
    }
  }

  getBaseUrl(): string {
    return `http://${this.host}:${this.port}`;
  }
}
