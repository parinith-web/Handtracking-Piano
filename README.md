# Handtracking Piano

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-96.8%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.4.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-FF6F00?style=for-the-badge&logo=google&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**A real-time, gesture-controlled virtual piano powered by computer vision and ML-based hand landmark detection — playable entirely without physical contact.**

[Live Demo](https://handtracking-piano.vercel.app/) · [Source Code](https://github.com/parinith-web/Handtracking-Piano) · [Report Bug](https://github.com/parinith-web/Handtracking-Piano/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Performance Metrics](#performance-metrics)
- [Features](#features)
- [Getting Started](#getting-started)
- [ML Inference Pipeline](#ml-inference-pipeline)
- [Deployment](#deployment)

---

## Overview

**Handtracking Piano** is a touchless, browser-native musical instrument that leverages **real-time ML inference** via Google's MediaPipe Hands to detect and track 21 hand landmarks per frame at sub-50ms latency. Finger positions are mapped to piano key triggers using a custom collision detection algorithm, producing audio output via the **Tone.js** Web Audio synthesis engine.

The application requires **no plugins, no downloads, and no hardware peripherals** beyond a standard webcam — running entirely within a WebAssembly-accelerated browser context.

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                         │
│                Physical Hand Gesture in 3D Space                │
└───────────────────────────┬─────────────────────────────────────┘
                            │  getUserMedia() — WebRTC API
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CAPTURE LAYER                              │
│         MediaStream @ 30fps  →  HTMLVideoElement Buffer         │
└───────────────────────────┬─────────────────────────────────────┘
                            │  Per-frame pixel tensor
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ML INFERENCE LAYER                            │
│    MediaPipe Hands  →  21 Landmark Coordinates (x, y, z)        │
│    WASM-accelerated, ~30ms inference latency per frame          │
└───────────────────────────┬─────────────────────────────────────┘
                            │  Normalized landmark vectors
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  COLLISION DETECTION LAYER                      │
│        Fingertip (landmark 8) mapped to key bounding box        │
│        Debounced event firing to prevent re-trigger noise       │
└───────────────────────────┬─────────────────────────────────────┘
                            │  Key trigger event
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUDIO SYNTHESIS LAYER                        │
│     Tone.js  →  PolySynth  →  Web Audio API  →  Speaker Output  │
│     End-to-end audio latency: < 20ms (AudioContext scheduling)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## System Architecture

```
handtracking-piano/
├── src/
│   ├── components/          # React component tree
│   │   ├── Piano/           # Key rendering & collision zones
│   │   ├── HandTracker/     # MediaPipe integration & landmark processing
│   │   └── UI/              # Futuristic HUD-style interface elements
│   ├── hooks/               # Custom React hooks (useHandTracking, useAudio)
│   ├── lib/                 # Utility functions, audio engine config
│   └── pages/               # Route-level components (react-router v7)
├── public/                  # Static assets
├── dist/                    # Production build output (Vite bundled)
├── vite.config.ts           # Vite + Tailwind v4 + React plugin config
└── package.json
```

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Runtime** | React 18.3 + TypeScript | Component rendering, strict type safety |
| **Build Toolchain** | Vite 6.4 | HMR dev server, ESM-native bundling, tree-shaking |
| **CV / ML** | MediaPipe Hands 0.4 | Real-time hand landmark detection (21 keypoints) |
| **Camera API** | `@mediapipe/camera_utils` | WebRTC `getUserMedia` abstraction & frame loop |
| **Audio Engine** | Tone.js 15 | Polyphonic synthesis, Web Audio API scheduling |
| **Styling** | Tailwind CSS v4 + Radix UI | Utility-first CSS, accessible unstyled primitives |
| **Animation** | Motion (Framer) 12 | GPU-accelerated CSS transitions |
| **Routing** | React Router v7 | SPA client-side navigation |
| **Deployment** | Vercel (Edge Network) | CDN-distributed static asset delivery |

---

## Performance Metrics

```
┌──────────────────────────────────────────────┐
│           LATENCY BREAKDOWN                  │
├──────────────────────────────────────────────┤
│  Camera Capture Interval     ~33ms  (30fps)  │
│  ML Inference (MediaPipe)    ~30ms  per frame │
│  Landmark → Key Mapping      < 1ms           │
│  Web Audio Scheduling        < 5ms           │
│  DOM Re-render (React)       < 16ms          │
├──────────────────────────────────────────────┤
│  Total End-to-End Latency    ~50–80ms        │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│           BUNDLE ANALYSIS                    │
├──────────────────────────────────────────────┤
│  Build Tool         Vite (ESM + Rollup)      │
│  JS Bundling        Tree-shaken, code-split  │
│  CSS Output         Tailwind purged          │
│  Assets             SVG + CSV only           │
└──────────────────────────────────────────────┘
```

> **Note:** End-to-end latency is hardware-dependent. Benchmarks measured on Chrome 124, Intel i5, integrated webcam @ 30fps.

---

## Features

- **Touchless Gesture Control** — Piano keys triggered by fingertip proximity using real-time landmark collision detection
- **On-Device ML Inference** — MediaPipe Hands runs entirely client-side via WebAssembly; no server round-trips, zero data exfiltration
- **Polyphonic Audio Synthesis** — Simultaneous multi-note playback via Tone.js `PolySynth`, with configurable oscillator waveforms
- **Futuristic HUD UI** — Glassmorphism-inspired interface with GPU-accelerated keypress animations
- **Responsive Layout** — Adaptive piano octave rendering across viewport breakpoints
- **Zero-Install Deployment** — Fully browser-native; no WebGL extensions, no native binaries required
- **Privacy-First** — All webcam processing occurs locally; no video frames transmitted to any server

---

## Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| Browser | Chrome / Edge (WebRTC + WASM required) |
| Webcam | Any standard USB or integrated camera |

### Installation

```bash
# Clone the repository
git clone https://github.com/parinith-web/Handtracking-Piano.git
cd Handtracking-Piano

# Install dependencies
npm install

# Start the development server (HMR enabled)
npm run dev
```

Open `http://localhost:5173` in your browser.

> **HTTPS Required for Production:** Browser's `getUserMedia()` API mandates a secure context (`https://` or `localhost`). Vercel provides automatic TLS termination for all deployments.

### Build for Production

```bash
# Compile + bundle for production
npm run build

# Preview the production build locally
npm run preview
```

Output artifacts are emitted to `/dist` — fully static, CDN-deployable.

---

## ML Inference Pipeline

MediaPipe Hands returns a normalized landmark graph per hand per frame:

```
Hand Landmark Indices (MediaPipe):

        8   (INDEX TIP) ← Primary trigger point
        |
        7
        |
        6
        |
        5 ─── 4 (THUMB TIP)
       /
  0 (WRIST)
```

The **index fingertip (landmark index `8`)** is projected from normalized `[0,1]` coordinate space onto the piano canvas bounding box via an affine transformation. A debounce gate (~100ms cooldown per key) prevents retriggering from jitter in the landmark stream.

---

## Deployment

This project is deployed on **Vercel** with the following configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "nodeVersion": "20.x"
}
```

**Live URL:** [https://handtracking-piano.vercel.app/](https://handtracking-piano.vercel.app/)

Every push to `main` triggers an automatic production deployment through Vercel's build pipeline.

---

## License

This project is MIT licensed. See the repository for license details.

---

<div align="center">

Developed by [parinith-web](https://github.com/parinith-web)

⭐ Star this repo if you found it useful!

</div>
