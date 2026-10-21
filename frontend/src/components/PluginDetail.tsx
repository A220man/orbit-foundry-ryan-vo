import { useParams, Link } from "react-router-dom";
import { api, useApi } from "../api";
import type { AgentRead, SkillRead, CommandRead } from "../api/types";

export function PluginDetailView() {
  const { id } = useParams<{ id: string }>();
  const pluginId = parseInt(id || "0", 10);

  const { data, error, loading } = useApi(() => api.getPlugin(pluginId));

  if (loading && !data) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="card-body space-y-3">
                <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3 className="text-lg font-medium text-slate-700 mb-1">Plugin not found</h3>
        <p className="text-slate-500 mb-4">{error?.message || "The plugin you're looking for doesn't exist."}</p>
        <Link to="/plugins" className="btn btn-primary">
          Back to plugins
        </Link>
      </div>
    );
  }

  const plugin = data.data;

  const renderSection = <T extends { name: string; description: string }>(
    title: string,
    items: T[],
    emptyMessage: string,
    renderItem: (item: T) => React.ReactNode
  ) => (
    <div className="card">
      <div className="card-header">
        <h3 className="font-semibold text-slate-900">{title} ({items.length})</h3>
      </div>
      <div className="card-body">
        {items.length === 0 ? (
          <p className="text-slate-500 text-center py-8">{emptyMessage}</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => renderItem(item))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link to="/plugins" className="text-sm text-slate-500 hover:text-slate-700 mb-2 inline-block">
            ← Back to plugins
          </Link>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{plugin.display_name}</h1>
            <span className="text-sm text-slate-500 font-mono">{plugin.name}</span>
            {plugin.is_external && <span className="badge badge-warning">External</span>}
          </div>
          <p className="text-slate-600 mt-2 max-w-2xl">{plugin.description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="badge badge-primary">{plugin.category}</span>
            <span className="badge badge-outline text-slate-500 border-slate-200">
              {plugin.agent_count} agents
            </span>
            <span className="badge badge-outline text-slate-500 border-slate-200">
              {plugin.skill_count} skills
            </span>
            <span className="badge badge-outline text-slate-500 border-slate-200">
              {plugin.command_count} commands
            </span>
            <span className="badge badge-outline text-slate-500 border-slate-200">
              {plugin.license}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {plugin.repository_url && (
            <a href={plugin.repository_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
              Repository
            </a>
          )}
          {plugin.homepage_url && (
            <a href={plugin.homepage_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
              Homepage
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {renderSection(
          "Agents",
          plugin.agents,
          "No agents in this plugin",
          (agent: AgentRead) => (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <h4 className="font-medium text-slate-900">{agent.name}</h4>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">{agent.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {agent.model_alias && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{agent.model_alias}</span>
                )}
                {agent.tools.map((tool) => (
                  <span key={tool} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{tool}</span>
                ))}
              </div>
            </div>
          )
        )}

        {renderSection(
          "Skills",
          plugin.skills,
          "No skills in this plugin",
          (skill: SkillRead) => (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <h4 className="font-medium text-slate-900">{skill.name}</h4>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">{skill.description}</p>
              {skill.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {skill.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {renderSection(
          "Commands",
          plugin.commands,
          "No commands in this plugin",
          (command: CommandRead) => (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <h4 className="font-medium text-slate-900 font-mono">{command.name}</h4>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">{command.description}</p>
              {command.usage && (
                <code className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-2 inline-block">{command.usage}</code>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}