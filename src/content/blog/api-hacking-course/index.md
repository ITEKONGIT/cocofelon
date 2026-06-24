---
slug: api-hacking-course
title: "I Took a Hacking Course So I Decided to Hack"
date: "2025-03-15"
description: "APISEC UNI course review and VAPI hacking walkthrough — exploiting OWASP Top 10 API vulnerabilities from BOLA to SQL injection."
tags: ["API Security"]
---

**TL;DR:** Completed the APIsec University course, then immediately applied it to VAPI — a vulnerable API lab. Here's my walkthrough of exploiting OWASP Top 10 API vulnerabilities.

Just wrapped up the API penetration testing course from APIsec University. Theory is cool and all, but I needed to put hands on keyboard. Enter VAPI — a deliberately vulnerable API designed for practicing exactly what I learned.

## API 1: Broken Object Level Authorization (BOLA)
**Severity: HIGH**

Created a user, grabbed my ID, then started incrementing. Changed `user_id=1` to `user_id=2`, `3`, etc. API returned other users' data without any authorization check.

```
GET /api1/user/2
Authorization: Bearer [my_token]

Response: {"id": 2, "name": "victim", "email": "..."}
```

**Impact:** Access to any user's data by guessing IDs.

## API 2: Broken User Authentication
**Severity: CRITICAL**

The authentication endpoint had no brute-force protection. Fired up Burp Intruder with a password list and got hits within minutes. The tokens were also predictable — base64 encoded credentials.

**Impact:** Account takeover via credential stuffing.

## API 3: Excessive Data Exposure
**Severity: MEDIUM**

The user endpoint returned everything — password hashes, API keys, internal flags. The frontend just filtered it out, but the API handed over the crown jewels.

```
Response includes:
- password_hash
- api_secret_key  
- is_admin: false
- internal_user_id
```

## API 5: Broken Function Level Authorization
**Severity: CRITICAL**

Found a "Create User" endpoint. Added an `isAdmin` parameter. Got a 200 response.

```
POST /api5/user
{"username": "cocofelon", "password": "...", "isAdmin": true}

Response: 200 OK
```

**Impact:** Instant privilege escalation.

## API 7: CORS Misconfiguration
**Severity: HIGH**

The CORS header was screaming `Access-Control-Allow-Origin: *` while still allowing credentials.

**Impact:** Cross-origin data theft.

## API 8: SQL Injection
**Severity: CRITICAL**

Login endpoint. Threw in `' OR 1-- ` in the username. Got a 500 with MySQL syntax error. Jackpot.

```
sqlmap -u "http://vapi/api8/login" \
  --data="username=admin&password=test" \
  --dbs --tables -D vapi -T a_p_i8_users --dump
```

**Impact:** Complete database compromise.

## API 9: Improper Assets Management
**Severity: HIGH**

Current API (v2) had rate limits. But I spotted `/v1/` paths still accessible — no limits there. Brute-forced a 4-digit PIN using FFUF.

**Impact:** Bypass modern security controls via legacy endpoints.

## API 10: Insufficient Logging & Monitoring
**Severity: MEDIUM**

Just POST to the "Get Flag" endpoint. No authentication, no logging, no alerts. Pure stealth access.

## Bonus APIs

- **API 11:** Fuzzing found hidden `/admin/secret` endpoint
- **API 12:** XXE via XML bomb payload
- **API 13:** Chained previous vulns for full account takeover

## Key Takeaways

OWASP Top 10 for APIs isn't just theory — these vulnerabilities exist in production systems. The course gave me methodology; VAPI gave me muscle memory.

- Always test authorization on every endpoint, every parameter
- Check for legacy API versions that bypass new controls
- CORS misconfigs are everywhere — test them
- APIs trust client-side filtering too much

**Next up:** Taking this methodology to real bug bounty programs. Stay tuned.
