export interface BrowserStatus {
  connected: boolean;
  currentUrl: string | null;
  tabCount: number;
}

export interface BrowserAction {
  id: string;
  type: 'navigate' | 'click' | 'type' | 'screenshot';
  args: Record<string, unknown>;
  status: 'pending' | 'approved' | 'denied' | 'completed';
}
