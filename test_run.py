import subprocess
result = subprocess.run(['cd', '/var/lib/alan-portfolio/workspaces/ryan/orbit-foundry-ryan-vo/backend', '&&', '.', 'venv/bin/activate', '&&', 'python', '-m', 'pytest', 'tests/', '-v'], capture_output=True, text=True, shell=True)
print(result.stdout)
print(result.stderr)
