---
slug: osint-techniques
title: "OSINT Techniques for Web, API, Cloud, and Mobile"
date: "2025-02-20"
description: "Practical OSINT methodology across four penetration testing domains. Focus on actionable techniques that convert passive reconnaissance into valid attack vectors."
tags: ["Recon & Malware"]
---

**Overview:** Practical OSINT methodology across four penetration testing domains. Focus on actionable techniques that convert passive reconnaissance into valid attack vectors.

> **Authorization Required:** Never perform reconnaissance on systems you don't have explicit permission to test. Unauthorized scanning may violate laws and terms of service.

## 1. Web OSINT — Surface Enumeration

Web reconnaissance is about finding forgotten artifacts, exposed endpoints, and historical data that reveal attack surface.

### Key Techniques

- **Subdomain enumeration:** `amass enum -d target.com`
- **Historical URLs:** `waybackurls target.com | grep -E '\.(json|xml|config)'`
- **Directory discovery:** `feroxbuster -u https://target.com -w wordlist.txt`
- **Git exposure:** Check for `/.git/config`, use gitleaks for secrets

### High-Value Targets

- `.env` files with credentials
- `/admin`, `/backup`, `/debug` endpoints
- Exposed `.git` directories
- Configuration files in Wayback Machine

## 2. API OSINT — Schema Discovery

APIs often expose more than intended through documentation, error messages, and predictable patterns.

### Key Techniques

- **Documentation hunting:** Check `/swagger`, `/api-docs`, `/openapi.json`
- **Endpoint fuzzing:** `ffuf -w api-wordlist.txt -u https://api.target.com/FUZZ`
- **Version discovery:** Test `/v1/`, `/v2/`, `/api/v1/`
- **Error message analysis:** Verbose errors leak stack traces, database info

### High-Value Targets

- Exposed Swagger/OpenAPI specifications
- Bearer tokens in JavaScript files
- Legacy API versions without rate limiting
- GraphQL introspection endpoints

## 3. Cloud OSINT — Identity Hunting

Cloud reconnaissance is different: **identity = access**. A single misconfiguration can expose credentials that control infrastructure.

### Key Techniques

- **Bucket enumeration:** `s3scanner scan --bucket target-prod`
- **DNS reconnaissance:** Look for cloud provider CNAMEs
- **Metadata probing:** SSRF to `169.254.169.254` for IAM credentials
- **Certificate transparency:** Find subdomains via CT logs

### High-Value Targets

- Public S3/GCS/Azure Blob storage
- Exposed IAM credentials via SSRF
- CloudFormation/Terraform templates with secrets
- Lambda function environment variables

> **Critical insight:** Cloud OSINT has exponentially higher impact. Web OSINT gives you data; cloud OSINT can give you credentials that actually control the infrastructure.

## 4. Mobile OSINT — Binary Analysis

Mobile apps often contain hardcoded secrets and debug endpoints that developers forget to remove before release.

### Key Techniques

- **APK extraction:** `apktool d app.apk`
- **Decompilation:** Use jadx for Java source recovery
- **String analysis:** `strings app.apk | grep -i api`
- **Traffic interception:** mitmproxy with certificate pinning bypass

## Comparative Analysis

| Domain | Primary Artifacts | Typical Outcome | Speed → Impact |
|---|---|---|---|
| Web | HTML, JS, backups | Data exposure | Medium |
| API | JSON, tokens, headers | Scoped access | Fast |
| Cloud | Buckets, roles, metadata | Live credentials | Fast → Explosive |
| Mobile | APK/IPA, local storage | App secrets | Slow |

## Quick Reference: Tools by Domain

| Domain | Tools | Key Findings |
|---|---|---|
| Web | amass, waybackurls, httpx, gitleaks | .env, /admin, .git |
| API | Burp, ffuf, openapi-grabber | Swagger, bearer tokens |
| Cloud | s3scanner, cloud_enum, passive DNS | Public buckets, SSRF → IMDS |
| Mobile | apktool, jadx, mitmproxy | Hardcoded keys, debug endpoints |

## Defender Recommendations

- **Cloud:** Enforce IMDSv2, least-privilege IAM, enable audit logging, block public bucket listing
- **API:** Centralize auth at gateway, scope tokens, rate limit aggressively, validate JWT server-side
- **Web:** CI/CD hygiene, remove debug artifacts, monitor Wayback for leaks
- **Mobile:** Never hardcode keys, use Keychain/Keystore, enforce certificate pinning

## Closing Thought

OSINT is the art of turning noise into attack vectors. Be methodical, automate the repetitive stuff, and focus on what moves the engagement: tokens, credentials, IAM roles.

Cloud pentesting requires a different mindset — think identity graphs and trust boundaries, not just files and endpoints. Web/API/mobile OSINT often leaves you with screenshots. Cloud OSINT can leave you with credentials that actually move production infrastructure.

*Stay curious, stay authorized.*
