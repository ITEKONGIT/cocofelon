---
slug: im-losing-my-mind-because-of-lyr
title: "Im Losing My Mind, iTS BECAUSE OF LYR"
date: "2026-08-22"
description: "Why I disappeared into Lyr: local edge computing, face vectorization, ChromaDB, OpenCV queues, memory discipline, threshold engines, and teaching an LLM when it is allowed to think."
category: engineering
tags: ["Lyr", "Edge Computing", "OpenCV", "ChromaDB", "AI", "Memory Optimization"]
series: "Repository Architecture"
part: 5
featured: true
---

Repository: [ITEKONGIT/lyr](https://github.com/ITEKONGIT/lyr)

It has been a while, and I have not written as much in that while.

Why?

I am not all too sure. I am not even going to lie. I have been knee-deep in a very unique aspect of security, working on a cyber-physical engine that runs fully local with edge computing practices.

Somehow, the engineering has been insane.

<figure class="article-figure article-figure-gif">
  <img src="/blog/lyr/lyr-rage.gif" alt="Rage Guy reacting to an overwhelming situation" loading="eager" />
  <figcaption>The emotional state of discovering one more thing the system needs to understand. <a href="https://giphy.com/gifs/Rageguy-hacker-rageguy-rage-guy-onqm2IiY4fX7Zsghp9" target="_blank" rel="noopener">GIF source: Giphy</a>.</figcaption>
</figure>

## I started learning things I thought I already understood

I have been optimizing face vectorization in ChromaDB, which is something I am learning properly for the first time in my life. There is a strange humility in opening a system and realizing that the thing you thought was just “store the face and find it later” is actually a long chain of decisions about representation, distance, storage, indexing, and memory.

The data is not stored as a face. It is stored as a vector: a numerical shape that captures enough of the face's characteristics for another vector to be compared against it. That is the part I found myself returning to again and again. The visual input is only the beginning. The system has to turn that input into something compact, searchable, and useful under pressure.

The [PEACH vector embeddings guide](https://docs.peach.ebu.io/technical/tutorials/tuto-embeddings/) was a useful reference point for thinking through this. It explains the basic movement from an input into a high-dimensional vector, then into indexed similarity search. The interesting part for Lyr is not copying that architecture. It is figuring out what can stay local, what can stay small, and what information is actually worth keeping.

## Memory is not an afterthought

Minimizing memory compute is a lost art in my opinion.

Most software systems, especially thick-client software, use too much memory for my liking. It is as if the machine is an infinite room and every process is allowed to leave its tools on the floor. Then somebody wonders why the room is difficult to move around in.

With Lyr, memory is part of the design conversation from the beginning. A camera can produce frames continuously. A face pipeline can generate vectors continuously. A reasoner can request context continuously. If I let every layer keep everything, the system will become a very expensive way to prove that computers can suffer.

That is why the queue matters.

<figure class="article-figure article-figure-queue">
  <img src="/blog/lyr/opencv_fast_fail_frame_queue.svg" alt="Lyr OpenCV frame pipeline showing a camera, producer thread, bounded queue, consumer thread, and discarded old frames" loading="lazy" />
  <figcaption>Lyr's fast-fail frame queue: keep the newest useful frame, let stale frames go.</figcaption>
</figure>

The producer keeps reading. The bounded queue refuses to become a graveyard for old frames. When it overflows, the oldest frame is discarded. The consumer pulls the freshest frame it can get and continues.

That is not losing data by accident. It is choosing relevance over nostalgia.

In a live system, a frame from three seconds ago may be less useful than the one that arrived a few milliseconds ago. Keeping both forever does not make the system more accurate. It just makes the system heavier.

## The engine has started to feel like a nervous system

Then I started thinking about what it means to feed an algorithm data constantly.

The engine begins to act as a threshold engine, almost like a central nervous system that tells the actual lightweight model when there is an issue and grants it the ability to think.

LLM reasoning is not very friendly on hardware expense. The whole idea is to keep the footprint as small as possible, so the LLM cannot be allowed to sit there staring at every sensor reading like an anxious intern.

It needs a threshold.

The deterministic algorithm is the first layer. I am not a mad man to just cause myself pain. Or maybe I am. That deterministic gate is meant to function like the skin: you feel a certain level of pain, enough to react most times, but not every touch becomes an emergency.

<figure class="article-figure">
  <img src="/blog/lyr/pain-signal-pathway.jpg" alt="Diagram showing sensory signals travelling from receptors through the spinal cord toward the brain" loading="lazy" />
  <figcaption>The analogy I keep coming back to: a signal crosses a threshold before it becomes something the brain must interpret. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3268359/" target="_blank" rel="noopener">Reference: normal pain and touch pathways</a>.</figcaption>
</figure>

The pressure laid on the system translates into a decent live reading. A normal fluctuation can stay in the watching layer. A meaningful breach earns context. Only then does the reasoning layer get involved.

## The LLM is advisory on purpose

The LLM keeps recent reasoning in temporary memory. That gives it just enough context to infer what the issue might be and to weigh the possible explanations and consequences.

But the LLM is advisory.

That boundary is important. If the goal is a lightweight system using cheap, localized inference, excessive LLM calls push directly against the goal. I do not want to build an edge engine and then quietly turn it into a cloud-shaped machine that burns through every resource it can find.

The local model receives data that has already been normalized and canonized by the earlier layers. It makes a quick interpretation, reports whether the situation looks threatening, and returns an answer that another small algorithm can parse.

That last part matters too. The response should not remain as free-floating prose. A minimal memory layer parses the LLM response into something the engine can act on: threat, confidence, explanation, next step.

The LLM can suggest. The deterministic system still controls the room.

## Every sensor becomes a node

This is probably my best part of the pipeline so far.

The architecture allows almost every sensor that can send data to become a digital node. That makes it possible to parse data coming straight into the engine, draw trends after certain thresholds, and verify a reading across sensors instead of trusting one source blindly.

That is how Lyr moves beyond facial identification. The face is one kind of signal. Temperature, motion, audio, environmental readings, and other streams can speak through the same contract.

The system does not need every sensor to be special. It needs every sensor to speak clearly enough for the rest of the pipeline to understand it.

Cross-sensor verification is where the system starts to feel alive. One reading can be noise. Several related readings arriving together can become context. That context can determine whether the LLM gets called, whether a trend is recorded, or whether the system simply keeps watching.

## What this could help with

Think about data centers in remote areas. Server rooms. Industrial environments. Anything that needs active monitoring but cannot afford to send every raw stream to a distant service, or cannot rely on a constant connection to one.

Minimal units can be embedded into those environments. They can watch locally, process locally, and escalate only the moments that deserve human attention.

That is the direction: a multimodal sensory, neuron-like system that can observe live transit without making the hardware carry an entire universe in memory.

## Maybe engineering is not dead

Maybe people's ability to explore is just dying.

It is easier to sit on the baselines of technology and repeat the same approved patterns. It is harder to walk into an uncharted system, learn ChromaDB because the project demands it, discover how vectors actually behave, fight memory thresholds, and then question whether the whole pipeline should be asking the model to think in the first place.

This is why I disappeared.

There is a whole lot more running in my head. Lyr is still moving, and there are still parts of the engine I need to understand before I can speak about them properly.

For now, I am learning that astute engineering is often the discipline of refusing to spend what you do not need to spend: not memory, not inference, not attention, and not certainty.

Later, we will talk about another one of my projects and what I am doing with it.
