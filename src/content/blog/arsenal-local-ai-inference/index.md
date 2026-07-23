---
title: "Building a Local AI Inference Architecture for Security Research"
slug: "arsenal-local-ai-inference"
date: "2026-07-15"
description: "Engineering a localized, offline Controller/Agent AI architecture to protect zero-day context during active engagements."
category: ai
series: "Local AI Notes"
part: 1
difficulty: "Advanced"
tags: ["AI", "Architecture", "Python", "PowerShell", "Security Research"]
---

The standard penetration testing workflow suffers from a critical OpSec vulnerability: sending proprietary binaries and sensitive logs to public AI models.
This post details the engineering of a **Controller/Agent split** architecture. All source code is versioned in the Jericho repository to ensure your local infrastructure remains reproducible.
### I. Infrastructure Mapping
* **Controller Node (Parrot OS):** Executes payloads and network discovery.
* **Inference Server (Dell Inspiron 16+):** Dedicated Ollama instance.
* **Bridge:** Inter-process communication via local network socket (11434).
### II. Deployment: Inference Server
On the Windows Inference Server, we must modify the binding to accept network-level traffic and configure the firewall to expose the API.
**Repository Reference:** [jericho/ai-inference/scripts/windows_ollama_bind.ps1](https://github.com/ITEKONGIT/jericho/blob/main/ai-inference/scripts/windows_ollama_bind.ps1)
```powershell
# Jericho Suite: Inference Server Network Binding
# Binds to 0.0.0.0 for external controller access
[Environment]::SetEnvironmentVariable("OLLAMA_HOST", "0.0.0.0", "Machine")
New-NetFirewallRule -DisplayName "Jericho Ollama API" -Direction Inbound -LocalPort 11434 -Protocol TCP -Action Allow
```
### III. Deployment: CLI Bridge
The  provides the interface to pipe  directly into the inference engine. By reading from the buffer, we avoid storing sensitive data on disk.
**Repository Reference:** [jericho/ai-inference/scripts/parrot_agent.py](https://github.com/ITEKONGIT/jericho/blob/main/ai-inference/scripts/parrot_agent.py)
```python
#!/usr/bin/env python3
import requests, sys, json
OLLAMA_HOST = "http://192.168.1.50:11434/api/generate"
def stream_response(prompt, model):
    payload = {"model": model, "prompt": prompt, "stream": True}
    with requests.post(OLLAMA_HOST, json=payload, stream=True) as response:
        for line in response.iter_lines():
            if line:
                sys.stdout.write(json.loads(line).get("response", ""))
                sys.stdout.flush()
if __name__ == "__main__":
    # Piped data context injection
    piped_data = sys.stdin.read() if not sys.stdin.isatty() else ""
    stream_response(f"Analyze the following data: {piped_data}", "deepseek-coder")
```
### IV. Operational Example
Use this for live log analysis during engagement:
```bash
cat access.log | ./parrot_agent.py -m deepseek-coder
```
