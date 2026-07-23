---
slug: apis-friend-or-foe
title: "APIs: Friend or Foe"
date: "2025-04-10"
description: "Exploring the dual nature of APIs — from seamless data exchange to potential weaponization. Windows API manipulation, DLL injection, and API hooking."
category: security
tags: ["API Security", "Windows", "C++"]
---

This is probably going to be a beginner series into what I'm delving into as a person, and it's more around APIs for now. APIs (Application Programming Interfaces) play a huge role in our daily lifestyle, from day-to-day tasks on PCs to small tasks on websites.

> For the regular user, APIs make their work easier; for service providers, APIs simplify operations. What do they do? Pretty simple — they enable data to be shared seamlessly, facilitate data exchange between apps, and connect different software systems.

## But why "foe"?

Over time, APIs can be weaponized to do things that shouldn't be done. This poses huge risks, though security researchers often assure us that systems are safe.

### My Journey into API Exploration

I started developing malware for research purposes, then came across the Windows API to call functions for loading stuff into memory via DLL injection. Over hours and days, I worked on loading shellcode directly into memory via NTDLL.dll.

NTDLL.dll offers many functions for memory manipulation among other things, so I began to explore them one by one to understand how to use them better. I found many functions usable interchangeably for loading different functions.

### Discovering API Hooking

With further research, I encountered API hooking. For Windows 32 and 64-bit systems, API hooking creates a jump section from the first few bytes of a function, making it momentarily stop, hook into another process, and then finish its original task.

This means a harmless process can be repurposed to carry out another action — potentially malicious — while appearing legitimate. **Nothing is always what it seems.**

## The Dual Nature

APIs represent the ultimate dual-use technology:

- **Friend:** Enables seamless integration, automation, and innovation
- **Foe:** Can be weaponized for memory manipulation, code injection, and stealthy attacks

The same Windows APIs that help applications communicate can be twisted to load malicious shellcode into memory or hijack legitimate processes.

> **Key takeaway:** Understanding the dual nature of APIs is essential for both offensive security research and building robust defenses. The same mechanisms that enable legitimate functionality can be subverted for malicious purposes — which is exactly why security engineers need to think like attackers.

*Originally published on [Medium](https://medium.com/@aweemmanuel351/apis-friend-or-foe-1cdedf6cba12).*
