import { api, useApi } from "../api";
import type { HarnessRead } from "../api/types";

const HARNESS_ICONS: Record<string, React.ReactNode> = {
  "claude-code": (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
  ),
  "codex-cli": (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
    </svg>
  ),
  "cursor": (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
    </svg>
  ),
  "opencode": (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.7 19.3l-5.5-5.5 5.5-5.5"/>
    </svg>
  ),
  "antigravity": (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
    </svg>
  ),
  "copilot": (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
    </svg>
  ),
  "pi": (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
    </svg>
  ),
};

export function HarnessesPage() {
  const { data, error, loading } = useApi(() => api.listHarnesses());

  if (loading && !data) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card animate-pulse p-6">
            <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4"></div>
            <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3 className="text-lg font-medium text-slate-700 mb-1">Failed to load harnesses</h3>
        <p className="text-slate-500 mb-4">{error?.message || "Unknown error"}</p>
      </div>
    );
  }

  const harnesses = data.data.items;

  // Capability labels for the comparison table
  const capabilityLabels: Record<string, string> = {
    agents: "Agents",
    skills: "Skills",
    commands: "Commands",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Supported Harnesses</h1>
        <p className="text-slate-600 mt-1">Installation methods and capabilities for each AI coding tool</p>
      </div>

      {/* Capability Comparison Table */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Harness</th>
              {Object.entries(capabilityLabels).map(([key, label]) => (
                <th key={key} className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                  {label}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Installation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {harnesses.map((harness: HarnessRead) => (
              <tr key={harness.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      {HARNESS_ICONS[harness.name] || (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{harness.display_name}</div>
                      <div className="text-sm text-slate-500 font-mono">{harness.name}</div>
                    </div>
                  </div>
                </td>
                {Object.entries(capabilityLabels).map(([key]) => (
                  <td key={key} className="px-4 py-3 text-center">
                    {(harness.capabilities?.[key] as boolean) ? (
                      <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono whitespace-nowrap">
                    {harness.install_method}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {harnesses.map((harness: HarnessRead) => (
          <div key={harness.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                {HARNESS_ICONS[harness.name] || (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg text-slate-900 truncate">{harness.display_name}</h2>
                <p className="text-sm text-slate-500 mt-1">{harness.name}</p>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-4">{harness.description}</p>

            <div className="mb-4">
              <h3 className="font-medium text-sm text-slate-900 mb-2">Installation</h3>
              <pre className="bg-slate-900 text-slate-100 text-xs p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
{harness.install_method}
              </pre>
            </div>

            <div>
              <h3 className="font-medium text-sm text-slate-900 mb-2">Capabilities</h3>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(harness.capabilities || {}).map(([key, value]) => (
                  <span
                    key={key}
                    className={`badge text-xs ${value ? "badge-success" : "badge-error"}`}
                  >
                    {key.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
