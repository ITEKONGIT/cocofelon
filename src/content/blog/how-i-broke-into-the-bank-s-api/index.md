---
title: "How I Broke Into The Bank's API"
date: undefined
slug: how-i-broke-into-the-bank-s-api
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