---
slug: jericho-personal-security-toolkit-architecture
title: "Jericho: Why My Security Toolkit Became a Methodology Repository"
date: "2026-07-23"
description: "A deep look at Jericho's repository structure, from cloud and web assessment to mobile, internal discovery, and local AI tooling, and why organization is part of the security practice."
category: engineering
tags: ["Jericho", "Python", "Security Tooling", "Cloud", "Methodology"]
series: "Repository Architecture"
part: 4
featured: true
---

Repository: [ITEKONGIT/jericho](https://github.com/ITEKONGIT/jericho)

And the walls came tumbling down.

Jericho is a personalized security toolkit, but that description is smaller than what the repository is becoming. It is a place where methodologies, scripts, audit logic, mobile notes, cloud assessment, web testing, and local AI experiments can live together without pretending they are one product.

That distinction is the architecture.

## Why centralize tools that do different things?

Security work produces fragments. One engagement needs a cloud enumeration script. Another needs a mobile reversing note. A third needs a Supabase audit or a small internal discovery probe. If each fragment lives in an unrelated folder or private scratchpad, the work is repeated and the reasoning disappears.

Jericho gives those fragments a home while keeping their boundaries visible:

```text
Jericho
├── baas/          platform and backend audits
├── cloud-enum/    cloud and host assessment
├── exploits/      focused research utilities
├── internal/      local discovery and protocol work
├── mobile/        instrumentation and mobile analysis
├── web-app/       web testing utilities
└── ai-inference/  local analysis support
```

The top-level folders are not microservices. They are working domains. That is a useful level of organization for a personal toolkit because it makes the repository searchable without forcing every script into a framework.

## Documentation is an interface

The READMEs inside `baas`, `cloud-enum`, `mobile`, `internal`, and `web-app` are not decoration. They are the interface between a future version of Emmanuel and the version that wrote the script.

A security utility is easy to forget because its implementation is often small but its context is large. The README has to preserve why the tool exists, what it assumes, what it touches, and how it should be used under authorization.

That is why Jericho benefits from the combination of code and methodology. `supabase_audit.py` is more useful when it sits next to the reason for checking RLS, storage, secrets, realtime channels, and database functions. A mobile bypass script is more responsible when its scope and test assumptions are written beside it.

## The repository has layers of confidence

Not every file in a personal toolkit should be presented as production-ready software. Jericho contains different kinds of work:

- repeatable utilities;
- assessment scripts;
- research experiments;
- documentation of a technique;
- supporting automation;
- local infrastructure such as the AI inference bridge.

The next useful metadata for the repository would be a maturity field: `stable`, `experimental`, `lab-only`, or `reference`. That would let the toolkit stay broad without making every folder sound equally finished.

This is especially important for offensive security code. A research script can be technically interesting while still being unsuitable for an unreviewed engagement. Naming the confidence level is part of making the tool safe to reuse.

## Why the local AI work belongs here

The `ai-inference` directory is not a random side quest. It answers a practical problem: sensitive logs, binaries, and engagement context should not automatically leave the local environment just because a reasoning task is convenient.

The Controller/Agent split lets the primary machine send analysis work to a dedicated local inference host. The Windows binding script and the Parrot-side agent make that architecture concrete. The important engineering questions are then visible: network binding, firewall scope, input handling, model selection, and what data is retained.

That is exactly what a personal toolkit should do. It should turn a repeated operational concern into something inspectable.

## The faith in the name

Jericho is not a neutral name to me. It describes the feeling behind the repository: taking apart walls that looked permanent because nobody had bothered to examine how they were built.

The repository is not just a bucket for clever scripts. It is a record of how I learn systems. The folders show where my attention has gone: cloud identity, backend platforms, mobile behavior, web application boundaries, internal networks, and the software I need to understand the work.

## What I would change next

Jericho does not need to become a giant platform. It needs a stronger spine:

1. A manifest for each tool with maturity, scope, language, and authorization notes.
2. Small fixtures and tests for utilities that are meant to be reused.
3. One consistent result format for audit scripts.
4. A clear separation between reusable code, lab experiments, and written methodology.
5. Links from the code back to the engineering notes that explain the decision.

That would preserve the personal character while making the repository easier to navigate and safer to hand to another engineer.

Jericho is finished enough to be useful because it already has a shape. It does not pretend that security work is one tool or one language. It gives the work a place to accumulate, and that accumulation is what turns isolated experiments into a practice.
