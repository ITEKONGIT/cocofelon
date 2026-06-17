# [cite_start]COCOFELON.LOL // V2 [cite: 93]

[cite_start]**Operator:** Emmanuel Awe [cite: 94]
[cite_start]**Designation:** Offensive Security Engineer [cite: 94]
[cite_start]**Architecture:** "Astral Projection" [cite: 94]

A high-performance, WebGL-driven intelligence terminal serving as the central hub for offensive security research, adversarial emulation, and systems engineering breakdowns. 

[cite_start]This repository houses the source code for the V2 iteration of [cocofelon.lol](https://cocofelon.lol), transitioning from a static HTML/CSS layout into a modern, physics-based Static Site Generator (SSG) environment[cite: 139, 140, 144].

## I. THE INFRASTRUCTURE STACK

[cite_start]This site abandons standard web templates in favor of a bespoke motion-graphics architecture[cite: 95, 331]:

* [cite_start]**The Engine (Astro):** Handles static site generation, creating a blisteringly fast frontend while maintaining a dead-simple, zero-friction markdown backend[cite: 95].
* [cite_start]**The Physics (Three.js):** Powers the background WebGL canvas, rendering a deep-space particle tunnel with real-time fluid distortion and Z-axis scroll mapping[cite: 97, 840, 841].
* [cite_start]**The Motion (GSAP):** Orchestrates the cinematic entrance animations, staggered Z-axis reveals, and the zero-gravity Y-axis hovering of the HUD panels[cite: 98, 481].
* [cite_start]**The Layout (Tailwind CSS):** Utility-first framework utilized for absolute control over the dark, minimalist "Astral Glass" grid[cite: 96, 111].

## II. THE DESIGN LANGUAGE: "ASTRAL PROJECTION"

[cite_start]The aesthetic is "Editorial Cyber" meets "HUD Immersion"—built on volumetric lighting and spatial depth rather than flat, cliché hacker tropes[cite: 105, 439, 465]. 

* [cite_start]**The Color Space:** Absolute Void Black (`#000000`) background [cite: 107][cite_start], Ghost White (`#FAFAFA`) primary text [cite: 108][cite_start], anchored by a "Cryo-Plasma" blend of Surgical Cyan (`#22D3EE`) and Deep Violet (`#A855F7`)[cite: 108].
* [cite_start]**The Typography:** `Syne` (Massive, geometric headers) [cite: 109][cite_start], `Lexend` (High-legibility body) [cite: 110, 852][cite_start], and `JetBrains Mono` (Strict, classified terminal readouts and code blocks)[cite: 110].
* [cite_start]**The Material:** HUD panels are built as "Astral Glass"—sharp corners, zero shadows, heavy backdrop blurs, and razor-thin 1px translucent borders[cite: 111].

## III. THE PUBLISHING PIPELINE

[cite_start]The CMS is completely decoupled from the complex frontend UI, operating on a frictionless Markdown pipeline[cite: 99, 100].

1.  Research and write-ups are drafted locally.
2.  [cite_start]Files are saved as strict `.md` files directly into the `src/content/blog/` directory[cite: 103].
3.  [cite_start]Astro parses the Frontmatter and automatically wraps the raw markdown inside the animated WebGL frontend during the build phase[cite: 104].

## IV. LOCAL DEVELOPMENT

To spin up the Astral Projection environment locally:

```bash
# Clone the repository
git clone [https://github.com/ITEKONGIT/cocofelon-v2.git](https://github.com/ITEKONGIT/cocofelon-v2.git)

# Navigate into the directory
cd cocofelon-v2

# Install dependencies (Astro, Three.js, GSAP, Tailwind)
npm install

# Boot the local development server
npm run dev