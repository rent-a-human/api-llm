# AI-Powered Wheel-Assisted Quadruped Grocery Assistant  
**Project Codename:** WALL-E Quad (or "Robbie")  

**Owner:** John Lenin Ortiz G (@johnlogam)  
**Location:** Bucaramanga, Santander, Colombia  
**Start Date:** March 2026  
**Goal:** Fully local/offline, stable 4-legged (wheel-assisted) carbon-fiber robot using commercial linear actuators.  
Primary use case: Assist with real grocery shopping (carry 8–12 kg bags, navigate stores/sidewalks/curbs, recognize items, follow natural language commands).  

## Core Design Principles
- 100% local & independent (Ollama + Qwen3-VL, no cloud after setup)
- Hybrid locomotion: wheels for efficient flat movement, legs for steps/uneven terrain
- Frame: carbon fiber (lightweight + stiff, high strength-to-weight)
- Actuators: commercial linear (prismatic) for simplicity & load-bearing
- Size: ~50–70 cm tall, 40–60 cm long (medium dog scale)
- Payload target: 8–12 kg sustained
- Runtime goal: 2–4 hours per charge (field-replaceable batteries later)

## Development Phases & Milestones

### Phase 0 – Planning & Design
- Finalize specs: exact dimensions, DOF per leg, battery target, safety features
- CAD modeling (Fusion 360 free tier recommended)
  - Design one full leg (linear actuator + wheel + carbon tube link)
  - Chassis layout (battery, compute, camera placement)
- Create initial BOM & order long-lead items
- Join communities for feedback: r/robotics, Open Dynamic Robot Initiative Discord, ROS Discourse

**Deliverables**
- Fusion 360 project file (shareable .f3d)
- BOM v0.1 with links & estimated costs
- Git repo initialized (`git init`)

### Phase 1 – Mechanical Chassis & Legs
- Source & cut carbon fiber tubes/plates
- Build 4 legs:
  - 2–3 DOF each using linear actuators
  - Attach small DC geared wheel + motor on lower leg segment
- Fabricate/3D-print mounts, brackets, battery tray
- Add lightweight basket (carbon/printed, ~10 kg capacity)
- Static assembly test: weight distribution, balance on flat surface

**Key Parts**
- Carbon fiber: DragonPlate / Amazon 3K weave tubes & sheets
- Linear actuators: Progressive Automations PA-04 / PA-13 (IP66, 12 V, 50–1000 N force)
- Wheels: 100–150 mm diameter + geared DC motors (e.g. 37 mm series)

### Phase 2 – Electronics, Power & Low-Level Control (2–4 weeks)
- Compute board: Raspberry Pi 5 (baseline) or Jetson Orin Nano (faster vision)
- Low-level controller: ESP32 / Arduino Mega (PWM + relays for actuators)
- Power system: 12 V 10–20 Ah LiPo/LiFePO4 + BMS + DC-DC bucks
- Core sensors:
  - RGB-D camera (Realsense D435 / Orbbec Astra 2)
  - IMU (BNO055 / ICM-42688)
  - Wheel odometry encoders
- Basic wiring & waterproofing prep

**Milestone**
- Actuators respond to serial/ROS commands (extend/retract)
- Power-up sequence tested, no smoke :)

### Phase 3 – Software Stack & AI Integration (4–8 weeks, can overlap)
1. Install ROS 2 Jazzy / Iron on compute board
2. Locomotion layer:
   - Inverse kinematics adapted for linear joints
   - Basic gait + wheel/leg mode switching
   - Use/adapt open-source wheel-leg repos (GitHub)
3. Navigation: Nav2 stack + RTAB-Map / Cartographer SLAM
4. AI brain (fully local):
   - Ollama server running
   - Model: `qwen3-vl:8b` (recommended) or `qwen3-vl:4b` (lighter) : going for qwen3-vl:4b (already installed)
   - ROS node: camera frame → base64 → Ollama API → high-level plan
   - Example commands: "Find the milk aisle", "Avoid the cart in front"
5. Voice interface: local Whisper (speech-to-text) + Piper (text-to-speech)
6. Stability features: context summarization, watchdog restart, error recovery

**Milestone**
- Robot describes live camera view and follows simple voice navigation commands

### Phase 4 – Grocery Features & Real-World Testing (4–6 weeks)
- Visual item recognition: Qwen3-VL + lightweight YOLO (fine-tune on grocery dataset if needed)
- Shopping mission flow: "Go to store → get eggs + bread → return home"
- Safety layer: physical E-stop, software collision avoidance, low-battery homing
- Long-duration tests: 1–2 hour continuous operation
- Iterate on reliability (vibration damping, heat management, actuator wear)

### Phase 5 – Polish & Scaling (ongoing)
- Add simple gripper arm (1–2 extra linear actuators)
- Upgrade compute/model (qwen3-vl:30b on stronger hardware)
- Full waterproofing, LED lighting, reflective strips
- Future: multi-robot coordination, cloud-offload fallback (optional)

## Estimated Prototype Budget (2026 prices, ~$1,000–2,000)

| Category            | Items                                      | Approx. Cost (USD) |
|---------------------|--------------------------------------------|--------------------|
| Frame               | Carbon fiber tubes, plates, mounts         | 100–250            |
| Actuators           | 8–12 × linear actuators                    | 800–1,600          |
| Wheels & drive      | 4 × geared motors + wheels                 | 80–200             |
| Compute & accel.    | Pi 5 / Jetson Orin Nano + Hailo/Coral      | 80–500             |
| Vision              | RGB-D camera                               | 100–300            |
| Power               | Battery, BMS, chargers                     | 100–250            |
| Electronics         | ESP32, relays, wires, etc.                 | 50–200             |
| 3D printing / misc  | Filament, tools, shipping                  | 50–300             |
| **Total**           |                                            | **1,360–3,600**    |

## Immediate Next Steps

- [X] Create new folder to project files & append this README -> wall-e-quad-robot folder created
- [X] Roadmap to install a 3d cad tool (Fusion 360 || solidworks || ... ) that we can evolve procedurally (via background tasks - createTask tool) -> Choosen tool: OnShape (url: https://cad.onshape.com/documents?resourceType=resourceuserowner&nodeId=69ac7368013efc4f64891644 creds: { username: 10-10515@usb.ve, password: Sofia_2017*})
- [ ] Read and understand src/mcp/server.ts file to modify it to add new tools for interoperability with cad tool → sketch one leg assembly -> do stress analysis | motion analysis (REQUIRED: create test-tool.mjs files -> run them to check tools are operational)
- [ ] set up a parametrized geometry to evolve using genetic algorithms
- [ ] Iterate from previous step to achieve full assembly
- [ ] 3D print parts for choosen geometry
- [ ] Decide compute platform (Pi 5 vs Jetson)
- [ ] Order 1–2 sample linear actuators for fit testing


**Version:** 1.1 – March 2026  
**Last Updated:** 2026-03-07  

