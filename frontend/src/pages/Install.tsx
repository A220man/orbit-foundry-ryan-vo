import { useState } from "react";

interface SkillInstallStep {
  id: string;
  title: string;
  description: string;
  command?: string;
  copyText?: string;
}

const HARNESS_OPTIONS = [
  { id: "claude-code", name: "Claude Code", icon: "🔷" },
  { id: "codex-cli", name: "OpenAI Codex CLI", icon: "⚡" },
  { id: "cursor", name: "Cursor", icon: "🎯" },
  { id: "opencode", name: "OpenCode", icon: "💻" },
  { id: "antigravity", name: "Google Antigravity CLI", icon: "🚀" },
  { id: "copilot", name: "GitHub Copilot", icon: "🤖" },
  { id: "pi", name: "Pi", icon: "🔮" },
];

const INSTALL_STEPS: Record<string, SkillInstallStep[]> = {
  "claude-code": [
    {
      id: "marketplace",
      title: "Add Marketplace",
      description: "Register the marketplace in Claude Code",
      command: "/plugin marketplace add wshobson/agents",
      copyText: "/plugin marketplace add wshobson/agents",
    },
    {
      id: "install",
      title: "Install Plugin",
      description: "Install a plugin from the marketplace",
      command: "/plugin install <plugin-name>@claude-code-workflows",
      copyText: "/plugin install python-development@claude-code-workflows",
    },
    {
      id: "use",
      title: "Use Agent",
      description: "Ask Claude to use the plugin's agents",
      copyText: "Ask: \"Use the python-development agent for this task\"",
    },
  ],
  "codex-cli": [
    {
      id: "marketplace",
      title: "Add Marketplace",
      description: "Register the marketplace in Codex CLI",
      command: "codex plugin marketplace add wshobson/agents",
      copyText: "codex plugin marketplace add wshobson/agents",
    },
    {
      id: "install",
      title: "Install Plugin",
      description: "Install a plugin from the marketplace",
      command: "codex plugin add <plugin-name>@claude-code-workflows",
      copyText: "codex plugin add python-development@claude-code-workflows",
    },
  ],
  "cursor": [
    {
      id: "marketplace",
      title: "Add Marketplace",
      description: "Follow Cursor setup instructions to add the marketplace",
      copyText: "See Cursor setup docs",
    },
    {
      id: "install",
      title: "Install Plugin",
      description: "Install a plugin via Cursor's plugin marketplace",
      copyText: "Install python-development from marketplace",
    },
  ],
  "opencode": [
    {
      id: "clone",
      title: "Clone Repository",
      description: "Clone the agents repository",
      command: "gh repo clone wshobson/agents ~/agents",
      copyText: "gh repo clone wshobson/agents ~/agents",
    },
    {
      id: "install",
      title: "Install for OpenCode",
      description: "Generate and link OpenCode artifacts",
      command: "cd ~/agents && make install-opencode",
      copyText: "cd ~/agents && make install-opencode",
    },
  ],
  "antigravity": [
    {
      id: "clone",
      title: "Clone Repository",
      description: "Clone the agents repository",
      command: "gh repo clone wshobson/agents ~/agents",
      copyText: "gh repo clone wshobson/agents ~/agents",
    },
    {
      id: "install",
      title: "Install for Antigravity",
      description: "Generate Antigravity plugins",
      command: "cd ~/agents && make install-antigravity",
      copyText: "cd ~/agents && make install-antigravity",
    },
  ],
  "copilot": [
    {
      id: "clone",
      title: "Clone Repository",
      description: "Clone the agents repository",
      command: "gh repo clone wshobson/agents ~/agents",
      copyText: "gh repo clone wshobson/agents ~/agents",
    },
    {
      id: "install",
      title: "Install for Copilot",
      description: "Generate Copilot agent profiles and skills",
      command: "cd ~/agents && make install-copilot",
      copyText: "cd ~/agents && make install-copilot",
    },
  ],
  "pi": [
    {
      id: "clone",
      title: "Clone Repository",
      description: "Clone the agents repository",
      command: "gh repo clone wshobson/agents ~/agents",
      copyText: "gh repo clone wshobson/agents ~/agents",
    },
    {
      id: "install",
      title: "Install for Pi",
      description: "Generate Pi skills and prompt templates",
      command: "cd ~/agents && make install-pi",
      copyText: "cd ~/agents && make install-pi",
    },
  ],
};

export function InstallPage() {
  const [selectedHarness, setSelectedHarness] = useState<string>("claude-code");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const steps = INSTALL_STEPS[selectedHarness] || [];
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(text);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Installation Guide</h1>
        <p className="text-slate-600 mt-1">Choose your coding tool and follow the steps to install plugins</p>
      </div>

      <div className="mb-8">
        <label className="form-label">Select your harness</label>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {HARNESS_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedHarness(option.id)}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                selectedHarness === option.id
                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
              aria-pressed={selectedHarness === option.id}
            >
              <div className="text-2xl mb-1">{option.icon}</div>
              <div className="text-sm font-medium">{option.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="card overflow-hidden">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">{step.title}</h3>
                  <p className="text-sm text-slate-500">{step.description}</p>
                </div>
              </div>
            </div>
            {step.command && (
              <div className="card-body p-0 border-t border-slate-100">
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-100 text-sm p-4 m-0 overflow-x-auto"><code>{step.command}</code></pre>
                  <button
                    onClick={() => copyToClipboard(step.copyText ?? step.command ?? "")}
                    className="absolute top-2 right-2 btn btn-ghost btn-sm text-slate-400 hover:text-slate-100"
                    aria-label="Copy command"
                  >
                    {copiedCommand === (step.copyText || step.command) ? (
                      <span className="flex items-center gap-1 text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
            {step.copyText && !step.command && (
              <div className="card-body">
                <p className="text-slate-600">{step.copyText}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 card">
        <div className="card-body">
          <h3 className="font-semibold text-slate-900 mb-4">Skills-only Installation</h3>
          <p className="text-slate-600 mb-4">Install individual skills without the full plugin using GitHub CLI or npx:</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-slate-900 mb-2">GitHub CLI (gh skill)</h4>
              <pre className="bg-slate-900 text-slate-100 text-sm p-4 rounded-lg overflow-x-auto"><code>gh skill install wshobson/agents python-testing-patterns</code></pre>
              <p className="text-sm text-slate-500 mt-2">Requires GitHub CLI 2.90+</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-2">npx skills</h4>
              <pre className="bg-slate-900 text-slate-100 text-sm p-4 rounded-lg overflow-x-auto"><code>npx skills add wshobson/agents --skill python-testing-patterns</code></pre>
              <p className="text-sm text-slate-500 mt-2">Requires Node.js and npm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}