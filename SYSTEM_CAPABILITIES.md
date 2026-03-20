# you-work (The Marketplace Prototype) - Technical Overview

This document provides a comprehensive technical breakdown of the applications within the **you-work** ecosystem (formerly *rent-a-human*). **you-work** is a specialized prototype designed for **Human-to-Human (H2H)**, **Human-to-Agent (H2A)**, and **Agent-to-Agent (A2A)** marketplace interactions.

---

## 🏗️ 1. api-llm (The Intelligence & CAD Engine)
**Role**: Centrally managed backend for model generation, LLM orchestration, and technical research for the **you-work** prototype.

### ⚙️ Core Capabilities
- **Parametric CAD Generation**:
  - Leverages `@jscad/modeling` for programmatic 3D design.
  - Specialized in the **Evolution Series**: Dynamic transformation of base models (e.g., Shopping Cart) into complex mechanical hybrids (Scooter Hybrid with articulated suspension).
  - Supports high-resolution geometry (64+ segments), complex boolean operations, and dynamic unit translation.
- **Dual-Layer LLM Orchestration**:
  - **Cloud Layer**: Primary reasoning via Gemini/Claude APIs.
  - **Local Layer (Ollama)**: Offline fallback using `forceLocal`. Optimized for `llama3.2-vision` (VQA/OCR) and `qwen2.5-coder` (Refactoring/Debugging).
- **MCP Infrastructure**:
  - Implements the **Model Context Protocol (MCP)** to expose filesystem, search, and CAD tools to agentic workflows.
- **Knowledge Framework**:
  - Hosts the project's **Brain** (Knowledge Items & Artifacts).
  - Provides infrastructure for deep technical research (P vs NP analysis, robotics hardware specs).

**Tech Stack**: Node.js, TypeScript, OpenJSCAD, Ollama, MCP SDK.

---

## 🖥️ 2. jarvis-dashboard (Agent Oversight & 3D Control)
- **Holographic Home View (`/agent`)**:
  - Implements an immersive, Iron-Man-inspired 3D dashboard using **React Three Fiber**.
  - Features high-fidelity **holographic panels**, virtual assistants (Eve, Anime Assistant), and dynamic environment mapping.
- **Next-Gen Spatial Interaction**:
  - Native integration for **Eye Tracking** (via face/gaze analysis) and **Hands Tracking** for touchless spatial navigation.
  - Custom **Hand Raycaster** and **TV Navigation** hooks for interacting with 3D UI elements in physical space.
- **Agent Neo Orchestration**:
  - Uses **Agent Neo** as the high-level brain for the dashboard.
  - Implements complex multi-step workflows (Cinematic assistant focusing, digital PDF signing, MCP tool management).
- **Parametric Modeling UI**:
  - Real-time slider-driven geometry updates with persistent state management via LocalStorage.
  - Grouped "Evolution Modules" for managing complex mechanical attachments (suspension, robotic arms).
- **Full Rebranding & I18n**:
  - Fully translated (Spanish/English) interface under the **you-work** brand.

**Tech Stack**: React, Vite, Three.js (React Three Fiber/Drei), MediaPipe (Hand/Face tracking), Agent Neo, Tailwind CSS, Framer Motion.

---

## 🤖 3. Agent Neo (Conversational AI Framework)
**Role**: A framework-agnostic, AI-driven conversational assistant library located at `api-llm/frontend/agent-neo`.

### ⚙️ Core Capabilities
- **Multi-Platform Library**:
  - Built as a **Web Component** for universal compatibility with React, Angular, and Vanilla JS.
- **Workflow Intelligence**:
  - Supports **Deterministic Workflows**: Decision trees with custom branching, `skipIf` logic, and auto-execution steps.
  - **Multi-Turn LLM Interactions**: Advanced conversational capabilities powered by Gemini and Claude.
- **Parametric Personas**:
  - Dynamic persona switching (e.g., "Boris" for Chess) via system role configuration.
- **Tool Calling & Action Integration**:
  - LLM-triggered backend API calls and report generation.

---

## ♟️ 4. chess-3d (Agent-Integrated Gaming)
**Role**: A demonstration of conversational AI integration into complex 3D interactive environments.

### ⚙️ Core Capabilities
- **Conversational "Boris" Agent**:
  - Powered by **Agent Neo**, this agent tracks board state in real-time.
  - Capable of move validation, strategy discussion, and direct board manipulation via natural language.
- **Engine & Logic**:
  - Integrated with `chess.js` for rule validation and move history.
  - Built-in **Stockfish** (WASM) engine for challenging AI opposition (Levels 1-7).
- **Environmental Immersion**:
  - Multiple 3D themes (City, Sunset, Night, Studio) with dynamic lightning and environment mapping.
- **Cross-Platform Readiness**:
  - Configured with **Capacitor** for deployment to iOS and Android as a native wrapper.

**Tech Stack**: React, Three.js (R3F), chess.js, Agent Neo, Capacitor, Stockfish.
