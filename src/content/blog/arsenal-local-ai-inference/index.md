---
title: "The Arsenal: Building a Local AI Inference Architecture for Security Research"
slug: "arsenal-local-ai-inference"
date: "2026-07-15"
description: "Engineering a localized, offline Controller/Agent AI architecture to protect zero-day context during active engagements."
series: "The Arsenal"
part: 1
difficulty: "Advanced"
tags: ["AI", "Architecture", "Python", "PowerShell", "OpSec"]
---

### The Privacy Problem in Offensive Security
When analyzing sensitive endpoint logs, reverse-engineering proprietary binaries, or generating highly specific evasion payloads, sending that context to OpenAI or Google is a critical operational security failure. You are essentially logging your client data and zero-day signatures on someone else's server.

To solve this, I engineered a localized AI inference architecture.

### The Hardware Split
Running deep-seek or OpenCode models locally requires significant VRAM. Attempting to run this on the same machine you are actively using for heavy virtualization, payload compilation, or exploitation creates resource starvation. 

The solution is a Controller/Agent split:
* **The Inference Server:** A dedicated Windows host (Dell Inspiron 16+) running Ollama. This handles the raw compute and exposes a local API bound to the internal network.
* **The Controller:** My primary Parrot OS bare-metal machine. This acts as the command center, keeping the heavy lifting entirely off the penetration testing environment.

---

### Step 1: Exposing the Inference Server
By default, Ollama binds strictly to `127.0.0.1` for security reasons. To allow the Controller to reach it, we must bind the service to all local interfaces and punch a hole in the Windows Defender Firewall. 

I wrote this PowerShell script (`windows_ollama_bind.ps1`) to automate the binding and firewall configuration on the Dell inference node:

```powershell
<#
.SYNOPSIS
    Jericho Suite: Inference Server Network Binding
#>

Write-Host "[*] Reconfiguring Ollama API Bind Address..." -ForegroundColor Cyan

# Set Ollama to listen on all interfaces
[Environment]::SetEnvironmentVariable("OLLAMA_HOST", "0.0.0.0", "Machine")

# Punch a hole in the Windows Firewall for the API
Write-Host "[*] Configuring Inbound Firewall Rule for port 11434..." -ForegroundColor Cyan
New-NetFirewallRule -DisplayName "Jericho Ollama API" -Direction Inbound -LocalPort 11434 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue

Write-Host "[+] Success. Please restart the Ollama application for changes to take effect." -ForegroundColor Green
Step 2: The Command Line Bridge
To make this usable in the middle of an assessment, I built a CLI bridge in Python (parrot_agent.py) that lives on my Parrot OS terminal.

The critical feature here is the sys.stdin evaluation. It allows the script to intercept piped data from the terminal. This means I can pipe standard output directly to the local Ollama API without intermediate files.

Python
#!/usr/bin/env python3
import argparse
import requests
import sys
import json

# The internal IP of the Windows Inference Server
OLLAMA_HOST = "[http://192.168.1.50:11434/api/generate](http://192.168.1.50:11434/api/generate)"
DEFAULT_MODEL = "deepseek-coder" 

def stream_response(prompt, model, system_prompt=None):
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": True
    }
    
    if system_prompt:
        payload["system"] = system_prompt

    try:
        with requests.post(OLLAMA_HOST, json=payload, stream=True, timeout=30) as response:
            response.raise_for_status()
            
            # Print the streamed response exactly as it generates
            for line in response.iter_lines():
                if line:
                    chunk = json.loads(line).get("response", "")
                    sys.stdout.write(chunk)
                    sys.stdout.flush()
        print() 
        
    except requests.exceptions.RequestException as e:
        print(f"\n[-] API Connection Failed. Is the Windows node online? Error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Jericho Local AI Inference Bridge")
    parser.add_argument("-m", "--model", default=DEFAULT_MODEL, help="Ollama model to execute")
    parser.add_argument("-s", "--system", help="System prompt to dictate AI behavior")
    parser.add_argument("prompt", nargs="?", help="Direct prompt text (optional if piping data)")

    args = parser.parse_args()

    # Detect if data is being piped in via terminal (e.g., cat exploit.c | parrot_agent.py)
    piped_data = ""
    if not sys.stdin.isatty():
        piped_data = sys.stdin.read()

    # Construct the final prompt
    final_prompt = ""
    if args.system:
        final_prompt += f"System Directive: {args.system}\n\n"
    if args.prompt:
        final_prompt += f"{args.prompt}\n"
    if piped_data:
        final_prompt += f"\nData Context:\n{piped_data}"

    if not final_prompt.strip():
        print("[-] Error: No prompt or piped data provided.")
        sys.exit(1)

    # Execute
    stream_response(final_prompt, args.model, args.system)
The Result
This setup allows me to pipe web application logs, nmap scans, or raw network captures directly into the local AI for analysis without ever leaving the terminal.

For example, encountering a strange hex dump mid-assessment is now solved locally:

Bash
cat unknown_payload.bin | ./parrot_agent.py -m deepseek-coder -s "You are a reverse engineering assistant. Analyze this hex dump."
By isolating the compute from the attack surface, we maintain absolute data privacy while gaining the benefits of an AI co-pilot directly in the offensive terminal.
