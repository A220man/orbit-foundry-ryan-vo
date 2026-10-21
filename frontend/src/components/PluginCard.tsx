import { Link } from "react-router-dom";
import type { PluginRead } from "../api/types";

interface PluginCardProps {
  plugin: PluginRead;
}

export function PluginCard({ plugin }: PluginCardProps) {
  return (
    <Link to={`/plugins/${plugin.id}`} className="card h-full hover:shadow-md transition-shadow">
      <div className="card-body flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-slate-900 truncate">{plugin.display_name}</h3>
            <p className="text-sm text-slate-500 mt-1 truncate">{plugin.name}</p>
          </div>
          {plugin.is_external && (
            <span className="badge badge-warning flex-shrink-0">External</span>
          )}
        </div>
        <p className="text-slate-600 text-sm mb-4 flex-1 line-clamp-2">{plugin.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
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
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-400">MIT License</span>
          <span className="text-xs text-slate-400">View details →</span>
        </div>
      </div>
    </Link>
  );
}