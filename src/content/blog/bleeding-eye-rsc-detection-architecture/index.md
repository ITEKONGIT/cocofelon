---
slug: bleeding-eye-rsc-detection-architecture
title: "Bleeding Eye: Building a Detection Pipeline for React Server Components"
date: "2026-07-23"
description: "How Bleeding Eye maps RSC surfaces, extracts action identifiers, triages architectural attack vectors, validates safely, and turns the result into structured security evidence."
category: security
tags: ["Bleeding Eye", "Python", "RSC", "Asyncio", "Application Security"]
series: "Repository Architecture"
part: 3
---

Repository: [ITEKONGIT/bleeding-eye](https://github.com/ITEKONGIT/bleeding-eye)

Bleeding Eye exists because modern application frameworks keep changing the shape of the attack surface. A traditional crawler can find pages and links. It is much less useful when the meaningful behavior is hidden inside serialized component state, server actions, JavaScript chunks, and framework-specific request flows.

The repository focuses on React Server Components as a case study in that problem.

## Why the project is a pipeline

The framework is organized into three phases:

```text
surface mapping -> methodological triage -> validation and reporting
```

That separation keeps discovery from pretending to be proof.

Phase 1 finds the surface: HTML endpoints, JavaScript chunks, RSC patterns, and unique action IDs. Phase 2 maps those observations to a taxonomy of possible component-level attack vectors. Phase 3 runs safe, parameterized tests and produces evidence with confidence and exposure metrics.

This is a better shape for automation than a single function called `scan`. A scanner that mixes crawling, exploit generation, and reporting becomes difficult to test and difficult to trust.

## Asyncio is a throughput decision

The core is written in Python and uses `asyncio` for high-concurrency state mapping. That fits the first phase of the problem: many endpoints, chunks, and responses have to be inspected while the tool waits on network I/O.

The important architectural boundary is that concurrency belongs mainly in collection. It should not automatically leak into validation. A high-concurrency crawler can be useful; a high-concurrency validator can become noisy, unsafe, or impossible to explain.

That is why the project benefits from distinct modules such as `base_crawler`, `rsc_crawler`, `data_extractor`, `endpoint_identifier`, `pattern_detector`, and `result_aggregator`. Each module can own one kind of uncertainty instead of forcing the whole system to carry it.

## RSC changes what “endpoint” means

With a conventional web application, a security tool can often begin with URLs and HTTP verbs. RSC introduces another layer: the serialized exchange between server-rendered components and the client, plus the actions that can be invoked through that exchange.

Bleeding Eye therefore looks for patterns rather than only routes. The crawler and endpoint identifier work together to discover where component state and server actions appear. The pattern detector then has to distinguish an interesting framework shape from a normal JavaScript response.

That distinction is the core research problem. Detection here is not just matching a string. It is building enough context to say: this endpoint behaves like an RSC surface, this action identifier is reachable, and this implementation deserves a validation attempt.

## Validation needs a safety boundary

The README is explicit that exploit payloads for unpatched CVEs are sanitized. The architecture also describes safe, parameterized validation tests. That is the right compromise for a public research repository.

The validator should prove the behavior it claims without becoming an uncontrolled exploit engine. In practice, that means each test needs:

- a clear precondition;
- bounded input;
- a reversible or read-only effect where possible;
- a confidence score;
- evidence sufficient for a maintainer to reproduce the issue safely.

The `interrogator`, `payloads`, `active_tester`, and reporting layers are where that contract can be enforced. The most important output is not a dramatic console line. It is a finding that explains the surface, the observation, the validation result, and the limits of the claim.

## The reporting layer is the handoff

Bleeding Eye produces JSON and plain-text reports. That is an engineering choice worth defending. JSON is useful for pipelines and later analysis; plain text is useful when a human is reading a finding in a terminal or an assessment folder.

The result aggregator should be the point where raw observations become normalized evidence. It should not hide the difference between “detected,” “suspected,” and “validated.” Those states are not interchangeable, especially when the framework is being used against a moving target like a JavaScript application.

## Where the project can mature

Bleeding Eye describes itself as active research and a methodology demonstration. The next steps are less about adding more payloads and more about making its evidence model explicit: a stable finding schema, fixtures for RSC responses, deterministic replay of crawl results, and tests that verify the boundary between mapping and validation.

The project is valuable because it treats framework-aware application security as an engineering problem. The tool has to understand how the framework moves data before it can make a useful security claim about the application built on top of it.
