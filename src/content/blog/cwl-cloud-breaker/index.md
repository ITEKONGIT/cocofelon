---
slug: cwl-cloud-breaker
title: "CWL Cloud Breaker — SSRF → EC2 Role Impact"
date: "2024-12-15"
description: "How a tiny input-validation slip in a server-side fetch feature led to catastrophic cloud identity compromise through SSRF and IAM credential extraction."
category: security
tags: ["Cloud Identity", "SSRF", "Pentesting"]
---

**Executive summary:** I hacked a cloud service where a vulnerable EC2-hosted web app with a server-side fetch feature exposed the instance metadata surface via SSRF, allowing temporary IAM role credentials to be disclosed. The chain illustrates how a tiny input-validation slip can become a catastrophic cloud identity compromise.

This document covers: reconnaissance, enumeration, exploitation characterization (redacted), credential validation (redacted), pivot scenarios (conceptual), detection opportunities, remediation playbook, and a prioritized hardening checklist. All live identifiers are replaced with REDACTED_* tokens.

> **Lab Context & Safety Posture**
> Environment: Isolated lab account / sandbox provided by CyberWarFare Labs
> Scope: Single EC2 instance + attached IAM role; no production systems touched
> Controls: Logging enabled, ephemeral resources, pre-agreed rollback plan
> Redaction policy: All IPs, account IDs, role names, secret material and precise metadata addresses replaced

## 1) Reconnaissance — Starting with Low-Hanging Fruit

**Goals:** find public storage, historical artifacts, and repo leakage that point to endpoints or keys.

**Actions (redacted / conceptual):**
- S3-style probing of common bucket naming patterns
- Attempted Wayback/archival harvesting
- GitHub OSINT: discovered repository containing cloud service account artifacts

**Notes & Analysis:** Multi-cloud leakage is a real foot-gun; finding keys for a different cloud often indicates engineering hygiene issues.

## 2) Discovery — Find the Running Asset

**Method:** iterate lab subnet, perform HTTP/host checks, fingerprint web service headers.

**Findings (redacted):**
- A host responded with HTTP 200 and server signature resembling Apache (Ubuntu)
- Additional headers indicated typical LAMP stack responses

## 3) Application Analysis — The Juicy Artifact

**Observed assets:**
- `http://REDACTED_IP/update.html` — contained a form with fields: url, date, ip, organization
- Form POSTs were handled by process.php (server-side script)

The `ip` parameter is likely used in a fetch routine — classic SSRF surface if not validated.

## 4) SSRF Characterization

If a process on the instance accepts a user-supplied URL and performs an outbound HTTP fetch, that process can be induced to retrieve internal-only endpoints (e.g., cloud metadata).

**Result:** SSRF behavior confirmed for ip parameter; application could fetch internal services.

## 5) Credential Extraction

**What was observed (sanitized):**

```
{
  "AccessKeyId": "REDACTED_KEY",
  "SecretAccessKey": "REDACTED_SECRET",
  "Token": "REDACTED_SESSION_TOKEN",
  "Expiration": "REDACTED_EXPIRATION_TIMESTAMP"
}
```

The credentials were temporary and associated with the EC2 instance role.

### IAM Credential Disclosure via SSRF
**Severity: CRITICAL**

Exposure of temporary IAM credentials that map to an instance-attached role is a critical identity disclosure.

## 6) Post-Exploitation Verification

Credentials were valid and capable of performing actions allowed by the instance role.

## 7) Blast Radius & Pivot Scenarios

From the role's permissions, an adversary could conceptually:
- Enumerate object stores and download objects
- List compute resources and discover other instances
- Create ephemeral compute for persistence
- Access secrets/parameter stores
- Chain trust relationships

| Vector | Ease | Impact |
|---|---|---|
| Read S3-like buckets | High | High |
| Assume cross-account role | Medium | High |
| Deploy serverless backdoor | Low | High |
| Exfiltrate DB snapshots | Medium | High |

## 8) Detection Playbook

**CloudTrail / Audit-based:**
- Alert: GetCallerIdentity from instance principal → Critical
- Alert: AssumeRole from instance principal → High

**Network / Host-based:**
- Alert: Outbound HTTP to internal-only CIDR or metadata address → Critical

## 9) Prioritized Remediation & Hardening

**Priority 1 — Immediate:**
1. Enforce IMDSv2
2. Lock down instance IAM roles to least privilege
3. Input allowlist for server-side fetches

**Priority 2 — Short term:**
1. Add WAF rules for SSRF patterns
2. Rotate exposed credentials
3. Improve logging

**Priority 3 — Strategic:**
1. CI/CD secret scanning
2. Network segmentation
3. Threat modeling & least-privilege review

## Lessons Learned

- SSRF is an identity problem in cloud contexts
- Make metadata access harder with IMDSv2
- Logging + SIEM rules win investigations
- Developer hygiene matters

> **Security Disclaimer:** All testing was conducted in authorized lab environments with proper scope and controls. Never test systems without explicit authorization.
