---
slug: cwl-cloud-breaker
title: "CWL Cloud Breaker — SSRF → EC2 Role Impact"
date: "2024-12-14"
description: "How a tiny input-validation slip in a server-side fetch feature led to catastrophic cloud identity compromise through SSRF."
tags: ["Cloud"]
readTime: 12
---

> Executive summary: I hacked a cloud service where a vulnerable EC2-hosted web app with a server-side fetch feature exposed the instance metadata surface via SSRF, allowing temporary IAM role credentials to be disclosed. The chain illustrates how a tiny input-validation slip can become a catastrophic cloud identity compromise.



This document covers: reconnaissance, enumeration, exploitation characterization (redacted), credential validation (redacted), pivot scenarios (conceptual), detection opportunities, remediation playbook, and a prioritized hardening checklist. All live identifiers are replaced with REDACTED_* tokens.



> **WARNING: ⚠️ Lab Context & Safety Posture**
> Environment: Isolated lab account / sandbox provided by CyberWarFare Labs
>                         Scope: Single EC2 instance + attached IAM role; no production systems touched
>                         Controls: Logging enabled, ephemeral resources, pre-agreed rollback plan
>                         Redaction policy: All IPs, account IDs, role names, secret material and precise metadata addresses replaced



## 1) Reconnaissance — Starting with Low-Hanging Fruit



**Goals:** find public storage, historical artifacts, and repo leakage that point to endpoints or keys.



#### Actions (redacted / conceptual):


                - S3-style probing of common bucket naming patterns: results returned HTTP_STATUS_NOT_FOUND for the tested names
- Attempted Wayback/archival harvesting — tooling absent in the specific lab VM; method noted for future runs
- GitHub OSINT: discovered repository containing cloud service account artifacts — for a different provider (non-AWS)



**Notes & Analysis:** Multi-cloud leakage is a real foot-gun; finding keys for a different cloud often indicates engineering hygiene issues and could enable lateral pivot in cross-cloud setups. No public buckets were found, so we pivoted to host discovery.



## 2) Discovery — Find the Running Asset



**Method:** iterate lab subnet, perform HTTP/host checks (non-destructive), and fingerprint the web service headers.



#### Findings (redacted):


                - A host responded at REDACTED_IP with HTTP 200 and server signature resembling Apache/REDACTED_VER (Ubuntu)
- Additional headers indicated typical LAMP stack responses; webroot served a simple app UI



**Verification:** Whois/ASN lookup mapping confirmed the IP was allocated to REDACTED_CLOUD_PROVIDER. This validated an EC2-hosted hypothesis and focused the cloud pivot analysis.



## 3) Application Analysis — The Juicy Artifact



**Observed assets (redacted):**


                - `http://REDACTED_IP/update.html` — contained a form with fields: url, date, ip, organization
- Form POSTs were handled by process.php (server-side script). App echoing/processing behavior suggested server-side retrieval of user-supplied ip/url content



> 🎯 Key Observation


The `ip` parameter is likely used in a fetch routine (fetch, curl, file_get_contents(), etc.) — classic SSRF surface if not validated.




## 4) SSRF Characterization



**Threat model recap:** If a process on the instance accepts a user-supplied URL and performs an outbound HTTP fetch, that process can be induced to retrieve internal-only endpoints (e.g., cloud metadata) — which exposes identity material.



#### Safe validation flow (conceptual):


                1. Submit a lab-controlled external URL that returns a known marker
2. Confirm that marker appears in the application's response/logs — indicates server-side fetch capability
3. Once SSRF behavior is confirmed, escalate only within lab rules to verify internal reachability



**Result:** SSRF behavior confirmed for ip parameter; application could fetch internal services reachable from the instance.



## 5) Credential Extraction



**What was observed (sanitized):**



**JSON Response (Redacted)**
```
{
  "AccessKeyId": "REDACTED_KEY",
  "SecretAccessKey": "REDACTED_SECRET",
  "Token": "REDACTED_SESSION_TOKEN",
  "Expiration": "REDACTED_EXPIRATION_TIMESTAMP"
}
```



**Important note:** The credentials were temporary and associated with the EC2 instance role REDACTED_ROLE. No permanent long-lived credentials were discovered in this chain.



### IAM Credential Disclosure via SSRF
**Severity:** `CRITICAL`



Exposure of temporary IAM credentials that map to an instance-attached role is a critical identity disclosure. These credentials can be used to perform any action the role permits.





## 6) Post-Exploitation Verification



**Purpose:** Ensure the extracted credentials are real and enumerate what the role could access, so defenders can prioritize remediations.



#### Conceptual checks performed:


                - Use the extracted temporary credentials to call a get-caller-identity-equivalent to verify principal identity
- Enumerate a minimal set of permitted APIs to determine blast radius



**Outcome:** Credentials were valid and capable of performing actions allowed by the instance role.



## 7) Blast Radius & Pivot Scenarios



From the role's permissions, an adversary could conceptually:


                - Enumerate object stores and download objects if read permission exists
- List compute resources and discover other instances or functions to attack
- Create ephemeral compute (if allowed) to achieve persistence
- Access secrets/parameter stores to obtain further credentials
- Chain trust relationships by using permissive role policies



| Vector | Ease | Impact |
|---|---|---|
| Read S3-like buckets | High | High |
| Assume cross-account role | Medium | High |
| Deploy serverless backdoor | Low | High |
| Exfiltrate DB snapshots | Medium | High |



## 8) Detection Playbook



Build these rules into your SIEM/IDS/WAF:



#### CloudTrail / Audit-based:

                - **Alert:** EventName == "GetCallerIdentity" originating from an instance principal that doesn't match deployment automation accounts → *Critical*
- **Alert:** AssumeRole events where source is an instance principal and not a known automation identity → *High*



#### Network / Host-based:

                - **Alert:** Outbound HTTP(S) from web server process to internal-only CIDR or metadata address → *Critical*
- **Alert:** Web processes performing high-frequency outbound fetches to many different hosts → *Medium*



#### Application / WAF:

                - **Rule:** Block requests containing internal-only URL patterns in parameters used for server-side fetches
- **Rule:** Rate-limit and challenge forms that accept external URLs



## 9) Prioritized Remediation & Hardening



#### Priority 1 — Immediate (minutes to hours):

                1. **Enforce metadata protection:** require IMDSv2 or equivalent session-based metadata requirement
2. **Lock down instance IAM roles:** change role policies to least privilege; remove broad * actions
3. **Input allowlist:** stop server-side fetches to arbitrary hosts — implement strict allowlists



#### Priority 2 — Short term (hours to days):

                1. Add WAF rules to detect and block SSRF-like input patterns
2. Rotate any exposed credentials and invalidate sessions
3. Improve logging to detect future similar attempts



#### Priority 3 — Strategic (days to weeks):

                1. CI/CD secret scanning: implement automated scanning for leaked secrets
2. Network segmentation: limit egress from web tiers to required endpoints only
3. Threat modeling & least-privilege review across roles and policies



## 10) Incident Response Checklist



If you detect this in production:


                1. **Isolate:** limit the instance's network egress and isolate the workload
2. **Rotate:** revoke/rotate exposed credentials and force session invalidation
3. **Audit:** collect CloudTrail logs and host logs to build a timeline
4. **Contain:** enforce IMDS protections and deploy emergency WAF rule
5. **Eradicate:** remove the vulnerable code path, patch the app, and redeploy
6. **Remediate:** least-privilege review and rotation of roles/keys system-wide
7. **Review:** run tabletop to update runbooks and detection rules



## Lessons Learned


                - SSRF is an identity problem in cloud contexts — input validation alone is not enough if the instance can reach identity endpoints
- Make metadata access harder, not easier: IMDSv2-like protections + network egress controls
- Logging + SIEM rules win investigations — detect the reconnaissance before the extraction
- Developer hygiene matters: secrets in repos, test keys, and permissive IAM are consistent root causes



> Shoutout: CyberWarFare Labs — thanks for the range practice.



> **WARNING: 🔐 Security Disclaimer**
> All testing was conducted in authorized lab environments with proper scope and controls. Never test systems without explicit authorization.