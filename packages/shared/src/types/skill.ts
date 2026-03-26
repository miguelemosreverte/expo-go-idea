export interface Skill {
  name: string;
  description: string;
  path: string;
  enabled: boolean;
}

export interface Plugin {
  name: string;
  version: string;
  enabled: boolean;
  config: Record<string, unknown>;
}
