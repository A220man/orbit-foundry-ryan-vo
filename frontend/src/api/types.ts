export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta: Record<string, unknown> | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
}

export interface PluginBase {
  name: string;
  display_name: string;
  description: string;
  category: string;
  repository_url: string | null;
  homepage_url: string | null;
  license: string;
  is_external: boolean;
  external_url: string | null;
}

export interface PluginCreate extends PluginBase {}

export interface PluginUpdate {
  display_name?: string;
  description?: string;
  category?: string;
  repository_url?: string | null;
  homepage_url?: string | null;
  license?: string;
  is_external?: boolean;
  external_url?: string | null;
}

export interface PluginRead extends PluginBase {
  id: number;
  agent_count: number;
  skill_count: number;
  command_count: number;
  created_at: string;
  updated_at: string;
}

export interface AgentBase {
  name: string;
  description: string;
  model_alias: string | null;
  tools: string[];
}

export interface AgentRead extends AgentBase {
  id: number;
  plugin_id: number;
  created_at: string;
}

export interface SkillBase {
  name: string;
  description: string;
  tags: string[];
}

export interface SkillRead extends SkillBase {
  id: number;
  plugin_id: number;
  created_at: string;
}

export interface CommandBase {
  name: string;
  description: string;
  usage: string | null;
}

export interface CommandRead extends CommandBase {
  id: number;
  plugin_id: number;
  created_at: string;
}

export interface PluginDetail extends PluginRead {
  agents: AgentRead[];
  skills: SkillRead[];
  commands: CommandRead[];
}

export interface HarnessBase {
  name: string;
  display_name: string;
  description: string;
  install_method: string;
  capabilities: Record<string, unknown>;
}

export interface HarnessRead extends HarnessBase {
  id: number;
  created_at: string;
}