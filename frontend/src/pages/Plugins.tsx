import { PluginList } from "../components/PluginList";

export function PluginsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Plugin Catalog</h1>
        <p className="text-slate-600 mt-1">Browse and discover plugins for your AI coding tools</p>
      </div>
      <PluginList />
    </div>
  );
}