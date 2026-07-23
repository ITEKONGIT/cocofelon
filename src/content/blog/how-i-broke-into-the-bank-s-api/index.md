---
title: "How I Broke Into The Bank's API"
date: "2025-10-15"
slug: how-i-broke-into-the-bank-s-api
description: "Draft notes for a redacted banking API authorization case study. Placeholder code and images need cleanup before publication."
category: fintech
tags: ["API Security", "Fintech", "Authorization"]
status: draft
series: "Bank Hacks"
part: 2
difficulty: "Advanced"
---

They left an unauthenticated endpoint exposed.

[code:bash]
curl -X GET https://target.bank.com/api/v2/users
[/code]

The response dumped 40,000 records. Including PINs.

[image: exposed-pin-response.png]
Caption: Raw API response showing PIN fields in plaintext

||This part is still sensitive and cannot be disclosed||
