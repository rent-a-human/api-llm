# Linear Actuator Testing Protocol
## WALL-E Quad Robot Project - Comprehensive Validation

### Document Control
- **Version:** 1.0
- **Date:** Current
- **Project:** WALL-E Quad Robot Linear Actuator Validation
- **Test Phase:** Phase 1 - Component Validation

---

## 1. Testing Scope and Objectives

### Primary Objectives
1. **Specification Validation:** Verify manufacturer claims for force, speed, and power consumption
2. **Environmental Certification:** Confirm IP66 rating and outdoor operation capability
3. **Mechanical Integration:** Validate fit with preliminary WALL-E Quad leg designs
4. **Performance Benchmarking:** Compare PA-04 against alternative suppliers
5. **Reliability Assessment:** Evaluate durability under continuous operation
6. **Cost-Performance Analysis:** Determine optimal actuator selection for production

### Success Criteria
| Parameter | Target | Measurement Method | Acceptable Range |
|-----------|--------|-------------------|------------------|
| Force Output | ≥95% specification | Digital force gauge | 95-105% |
| Speed | ±10% specification | Timer + ruler | 90-110% |
| Current Draw | ≤15A at full load | Current clamp | ≤15A |
| IP66 Rating | Pass dust/water test | Visual inspection | Pass |
| Position Accuracy | ±2mm | Position sensor | ±2mm |
| Operating Temp | -10°C to +50°C | Thermal testing | Pass |

---

## 2. Test Equipment and Instrumentation

### Required Equipment List
| Equipment | Specification | Purpose | Calibration Required |
|-----------|--------------|---------|---------------------|
| Digital Force Gauge | 0-2000N, ±0.1% | Force measurement | Yes |
| Linear Position Sensor | 0-150mm, ±0.01mm | Stroke position | Yes |
| Current Clamp Meter | 30A AC/DC, ±1% | Current monitoring | Yes |
| Digital Multimeter | 6.5 digit, ±0.01% | Voltage measurement | Yes |
| Temperature Sensors | -50°C to +200°C | Thermal monitoring | Yes |
| Infrared Thermometer | ±1°C accuracy | Surface temperature | No |
| 12V Power Supply | 25A, adjustable | Test power source | Yes |
| Stopwatch | ±0.01s resolution | Speed timing | No |
| Oscilloscope | 4-channel, 100MHz | Signal analysis | Yes |
| Data Logger | 16-channel, 24-bit | Continuous monitoring | Yes |

### Safety Equipment
| Item | Specification | Purpose |
|------|---------------|---------|
| Emergency Stop | Mushroom button | Immediate shutdown |
| Safety Shields | Clear acrylic | Moving part protection |
| Ground Fault Protection | 30mA RCD | Electrical safety |
| First Aid Kit | Industrial grade | Emergency response |
| Fire Extinguisher | CO2 type | Electrical fire suppression |

---

## 3. Test Phase 1: Basic Performance Validation

### Test 1.1: Force Output Characterization

#### Test Setup
1. **Actuator Mounting:**
   - Mount in test fixture with proper alignment
   - Use 80/20 aluminum extrusion framework
   - Ensure free movement without binding
   - Apply proper lubrication to sliding surfaces

2. **Force Measurement:**
   - Attach digital force gauge to actuator rod end
   - Use appropriate mounting adapters
   - Calibrate force gauge with known weights
   - Zero gauge before each test series

3. **Load Conditions:**
   - No load (baseline)
   - 25% of rated force
   - 50% of rated force
   - 75% of rated force
   - 100% of rated force
   - 110% of rated force (overload test)

#### Test Procedure
```
Step 1: Initial Setup (15 minutes)
- Verify all connections
- Check zero force reading
- Record ambient conditions
- Power up equipment (15-min warm-up)

Step 2: Extension Force Testing (30 minutes)
- Position actuator at 50% stroke
- Extend at controlled rate
- Record force at 0%, 25%, 50%, 75%, 100% extension
- Hold at full extension for 10 seconds
- Record peak force achieved

Step 3: Retraction Force Testing (30 minutes)
- Position actuator at 50% stroke
- Retract at controlled rate
- Record force at 100%, 75%, 50%, 25%, 0% retraction
- Hold at full retraction for 10 seconds
- Record peak retraction force

Step 4: Data Analysis (15 minutes)
- Calculate average force at each position
- Identify force variations
- Compare to specifications
- Document any anomalies
```

#### Data Collection Format
| Position | Extension Force (N) | Retraction Force (N) | Temp (°C) | Current (A) | Notes |
|----------|-------------------|---------------------|-----------|-------------|-------|
| 0% | | | | | |
| 25% | | | | | |
| 50% | | | | | |
| 75% | | | | | |
| 100% | | | | | |

#### Pass/Fail Criteria
- **Pass:** Force output ≥95% of specification at all positions
- **Fail:** Force output <95% of specification at any position
- **Warning:** Force output between 95-100% of specification

### Test 1.2: Speed and Response Time Testing

#### Test Setup
1. **Position Measurement:**
   - Mount linear position sensor
   - Zero sensor at retracted position
   - Verify linear relationship to actuator position

2. **Timing System:**
   - Synchronized with data logger
   - Use high-precision timer
   - Trigger on actuator power application

#### Test Procedure
```
Step 1: No-Load Speed Test (15 minutes)
- Extend from 0% to 100% stroke
- Time duration of full extension
- Record average and peak speeds
- Repeat 5 times for consistency

Step 2: Load Speed Test (30 minutes)
- Apply 25% rated load
- Repeat speed test procedure
- Apply 50% rated load
- Repeat speed test procedure
- Apply 75% rated load
- Repeat speed test procedure

Step 3: Response Time Test (15 minutes)
- Apply 25% stroke command
- Measure response time to 90% position
- Apply 50% stroke command
- Measure response time to 90% position
- Apply 75% stroke command
- Measure response time to 90% position
```

#### Data Collection Format
| Load Condition | Extension Time (s) | Retraction Time (s) | Avg Speed (in/s) | Response Time (s) | Position Error (mm) |
|----------------|-------------------|-------------------|------------------|-------------------|---------------------|
| No Load | | | | | |
| 25% Load | | | | | |
| 50% Load | | | | | |
| 75% Load | | | | | |

#### Pass/Fail Criteria
- **Pass:** Speed within ±10% of specification at all loads
- **Pass:** Response time <1 second for 90% position
- **Fail:** Speed <90% of specification
- **Warning:** Speed between 90-100% of specification

### Test 1.3: Power Consumption Analysis

#### Test Setup
1. **Current Measurement:**
   - Install current clamp on power supply line
   - Use data logger for continuous monitoring
   - Set sampling rate to 10 Hz minimum

2. **Voltage Monitoring:**
   - Connect voltmeter across actuator terminals
   - Monitor voltage drop under load
   - Record power supply stability

#### Test Procedure
```
Step 1: Baseline Power Consumption (20 minutes)
- Measure standby current
- Record idle power consumption
- Monitor for 10 minutes for stability

Step 2: Dynamic Power Testing (45 minutes)
- Measure current during extension at no load
- Measure current during extension at 50% load
- Measure current during extension at 100% load
- Record current during retraction at all loads
- Measure peak current during acceleration

Step 3: Efficiency Calculation (15 minutes)
- Calculate input power at each load condition
- Estimate mechanical output power
- Calculate efficiency percentages
- Identify power consumption patterns
```

#### Data Collection Format
| Condition | Voltage (V) | Current (A) | Power (W) | Efficiency (%) | Peak Current (A) |
|-----------|-------------|-------------|-----------|----------------|------------------|
| Standby | | | | | |
| No Load Ext | | | | | |
| 50% Load Ext | | | | | |
| Full Load Ext | | | | | |
| No Load Ret | | | | | |
| 50% Load Ret | | | | | |
| Full Load Ret | | | | | |

#### Pass/Fail Criteria
- **Pass:** Current draw ≤15A at full load
- **Pass:** Efficiency ≥70% at typical loads
- **Warning:** Current draw 15-16A at full load
- **Fail:** Current draw >16A at full load

---

## 4. Test Phase 2: Environmental Protection Validation

### Test 2.1: IP66 Dust Resistance Testing

#### Test Setup
1. **Dust Chamber:**
   - 300mm x 300mm x 400mm acrylic chamber
   - Talcum powder or fine test dust
   - Forced air circulation system
   - Visibility ports for observation

2. **Dust Density Measurement:**
   - Dust concentration meter
   - Target: 10-15 mg/m³
   - Real-time monitoring capability

#### Test Procedure
```
Step 1: Pre-Exposure Testing (15 minutes)
- Functional test at room temperature
- Measure baseline performance
- Document any existing issues
- Photo documentation of actuator condition

Step 2: Dust Exposure (30 minutes)
- Place actuator in dust chamber
- Introduce controlled dust concentration
- Maintain continuous dust flow
- Monitor actuator operation every 10 minutes

Step 3: Post-Exposure Testing (30 minutes)
- Remove actuator from dust chamber
- Allow settling time (5 minutes)
- External cleaning (no disassembly)
- Repeat functional test
- Inspect for dust ingress
```

#### Pass/Fail Criteria
- **Pass:** No dust ingress into actuator housing
- **Pass:** No degradation in force/speed performance
- **Pass:** Continued operation without binding
- **Fail:** Visible dust inside actuator
- **Fail:** Performance degradation >5%
- **Warning:** Minor dust on external surfaces only

### Test 2.2: IP66 Water Resistance Testing

#### Test Setup
1. **Water Spray System:**
   - Adjustable spray nozzle
   - Water pressure: 100 kPa (15 PSI)
   - Spray duration control
   - Drainage system for water collection

2. **Water Quality:**
   - Clean tap water
   - Temperature: 15-25°C
   - pH neutral (6.5-7.5)

#### Test Procedure
```
Step 1: Pre-Water Testing (15 minutes)
- Baseline functional test
- Current consumption measurement
- Temperature monitoring setup
- Photo documentation

Step 2: Water Spray Test (15 minutes)
- Continuous spray from all directions
- Focus on vulnerable areas (gaskets, seals)
- Rotate actuator during spray test
- Monitor for water ingress signs

Step 3: Post-Water Testing (30 minutes)
- Allow 10 minutes for water drainage
- External drying (no heat)
- Functional test immediately
- Inspect internal components
- Measure insulation resistance
```

#### Pass/Fail Criteria
- **Pass:** No water ingress into actuator interior
- **Pass:** Performance unchanged from pre-test
- **Pass:** Insulation resistance >10MΩ
- **Fail:** Visible water inside actuator
- **Fail:** Electrical short circuit
- **Fail:** Performance degradation >10%

### Test 2.3: Temperature Range Testing

#### Test Setup
1. **Temperature Control:**
   - Environmental chamber capability
   - Range: -20°C to +60°C
   - Temperature ramp rate: 2°C/minute
   - 30-minute soak at each test point

2. **Performance Monitoring:**
   - Continuous data logging
   - Temperature sensors on actuator
   - Performance measurement at each temperature

#### Test Procedure
```
Step 1: Low Temperature Test (90 minutes)
- Reduce temperature to -10°C at 2°C/min
- Soak for 30 minutes at -10°C
- Perform functional test
- Reduce to -20°C if actuator still functional
- Soak for 30 minutes
- Attempt functional test
- Warm to room temperature

Step 2: High Temperature Test (90 minutes)
- Increase temperature to +50°C at 2°C/min
- Soak for 30 minutes at +50°C
- Perform functional test
- Increase to +60°C if actuator still functional
- Soak for 30 minutes
- Attempt functional test
- Cool to room temperature

Step 3: Temperature Cycling (120 minutes)
- Cycle between -10°C and +50°C
- 30-minute soak at each extreme
- 5 complete cycles
- Monitor performance throughout
```

#### Data Collection Format
| Temperature (°C) | Force Output (N) | Speed (in/s) | Current (A) | Status | Notes |
|------------------|------------------|--------------|-------------|--------|-------|
| -20 | | | | | |
| -10 | | | | | |
| 0 | | | | | |
| +25 | | | | | |
| +50 | | | | | |
| +60 | | | | | |

#### Pass/Fail Criteria
- **Pass:** Functional operation at -10°C to +50°C
- **Pass:** Performance within ±10% of room temperature baseline
- **Warning:** Limited function at temperature extremes
- **Fail:** Failure below -10°C or above +50°C

---

## 5. Test Phase 3: Integration Testing

### Test 3.1: Mechanical Integration Assessment

#### Test Setup
1. **WALL-E Quad Leg Mockup:**
   - Preliminary leg design (3D printed or machined)
   - All mounting interfaces included
   - Clearance verification capability
   - Adjustable mounting positions

2. **Fit Assessment Tools:**
   - Digital calipers for clearance measurement
   - Thread gauges for mounting hole verification
   - Alignment tools for mounting precision
   - Photo documentation setup

#### Test Procedure
```
Step 1: Visual Fit Assessment (30 minutes)
- Compare actuator dimensions to leg cavity
- Verify stroke length fits within leg structure
- Check mounting hole alignment
- Assess cable routing clearance
- Photo document fit issues

Step 2: Mounting Interface Testing (45 minutes)
- Install actuator in leg mockup
- Verify mounting hardware fit
- Check torque requirements
- Test multiple mounting orientations
- Validate sealing around actuator

Step 3: Stroke Clearance Verification (30 minutes)
- Simulate full leg movement range
- Verify actuator stroke clearance
- Check for interference with other components
- Test emergency stop clearance
- Measure total required space envelope
```

#### Fit Assessment Checklist
| Component | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| Housing Fit | Adequate clearance | Pass/Fail | |
| Mounting Holes | Proper alignment | Pass/Fail | |
| Stroke Length | Sufficient range | Pass/Fail | |
| Cable Clearance | No interference | Pass/Fail | |
| Emergency Access | Serviceable | Pass/Fail | |
| Sealing Interface | Maintain IP rating | Pass/Fail | |

### Test 3.2: Control System Integration

#### Test Setup
1. **Control Electronics:**
   - Motor controller capable of 12V/20A
   - Position feedback processing
   - Safety interlocks and limits
   - User interface for testing

2. **Data Acquisition:**
   - Position feedback monitoring
   - Control signal analysis
   - Response time measurement
   - Error tracking capability

#### Test Procedure
```
Step 1: Basic Control Testing (30 minutes)
- Connect motor controller to actuator
- Test basic extension/retraction commands
- Verify direction control
- Check emergency stop functionality
- Monitor current consumption

Step 2: Position Control Testing (60 minutes)
- Implement PID position controller
- Test accuracy at multiple setpoints
- Measure steady-state error
- Test overshoot and settling time
- Verify repeatability

Step 3: Dynamic Response Testing (45 minutes)
- Step response testing
- Ramp response testing
- Continuous operation cycling
- Disturbance rejection testing
- Long-term stability testing
```

#### Control Performance Metrics
| Test Parameter | Target | Measurement | Status |
|----------------|--------|-------------|--------|
| Position Accuracy | ±2mm | RMS error | |
| Overshoot | <5% | Maximum overshoot | |
| Settling Time | <2s | 2% band | |
| Repeatability | ±1mm | 10-cycle test | |
| Response Time | <1s | 90% position | |

---

## 6. Test Phase 4: Reliability and Endurance

### Test 4.1: Continuous Operation Testing

#### Test Setup
1. **Automated Cycling System:**
   - Programmable duty cycle controller
   - Position feedback for cycle counting
   - Failure detection and protection
   - Continuous data logging

2. **Monitoring Systems:**
   - Current consumption tracking
   - Temperature monitoring
   - Performance degradation measurement
   - Failure mode detection

#### Test Procedure
```
Step 1: Short-Term Cycling (2 hours)
- 100 continuous cycles at 50% load
- Monitor performance every 25 cycles
- Record temperature every 10 cycles
- Measure current consumption trend
- Check for unusual noises or vibrations

Step 2: Extended Cycling (8 hours)
- Continuous cycling until failure or 1000 cycles
- Reduce load if temperature exceeds limits
- Monitor current consumption trend
- Record performance degradation
- Document any failures or anomalies

Step 3: Recovery Testing (1 hour)
- Allow actuator to cool to ambient
- Perform full performance test
- Compare to baseline measurements
- Calculate performance retention
- Identify any permanent degradation
```

#### Endurance Test Data
| Cycle Count | Force Output (N) | Speed (in/s) | Current (A) | Temp (°C) | Status |
|-------------|------------------|--------------|-------------|-----------|--------|
| 0 | | | | | Baseline |
| 100 | | | | | |
| 250 | | | | | |
| 500 | | | | | |
| 750 | | | | | |
| 1000 | | | | | Final |

### Test 4.2: Accelerated Aging Testing

#### Test Setup
1. **Stress Testing:**
   - Elevated temperature operation (+40°C)
   - Increased load (110% of rated)
   - High-frequency cycling
   - Extended duty cycle (30% vs 20%)

2. **Failure Mode Analysis:**
   - Thermal imaging for hotspot detection
   - Vibration analysis for bearing wear
   - Electrical monitoring for insulation failure
   - Mechanical wear measurement

#### Test Procedure
```
Step 1: Thermal Stress Testing (4 hours)
- Operate at +40°C ambient
- Apply 75% rated load continuously
- Monitor temperature rise
- Measure performance degradation
- Allow cooling cycles

Step 2: Overload Testing (2 hours)
- Apply 110% rated load
- Test at 25%, 50%, 75% stroke positions
- Monitor for thermal protection
- Test recovery after overload
- Document any damage or degradation

Step 3: Extended Duty Cycle (6 hours)
- Increase duty cycle to 30%
- Reduce rest periods between cycles
- Monitor cumulative heating effects
- Check for thermal runaway
- Verify thermal protection activation
```

---

## 7. Data Analysis and Reporting

### Statistical Analysis Requirements
1. **Performance Consistency:**
   - Calculate standard deviation of measurements
   - Identify measurement repeatability
   - Assess measurement uncertainty

2. **Trend Analysis:**
   - Performance degradation over time
   - Temperature effects on performance
   - Current consumption trends

3. **Comparative Analysis:**
   - Compare to specification limits
   - Benchmark against alternative suppliers
   - Cost-performance ratio analysis

### Report Structure
1. **Executive Summary:**
   - Overall test results
   - Pass/fail determination
   - Key findings and recommendations

2. **Detailed Results:**
   - Complete test data
   - Statistical analysis
   - Performance trends

3. **Technical Analysis:**
   - Failure mode identification
   - Design recommendations
   - Integration considerations

4. **Procurement Recommendation:**
   - Go/no-go decision
   - Final specifications
   - Production quantities and timeline

---

## 8. Risk Management and Safety Protocols

### Safety Requirements
1. **Personal Protective Equipment:**
   - Safety glasses required at all times
   - Gloves for hot/cold parts handling
   - Hearing protection during noise testing

2. **Electrical Safety:**
   - Proper grounding of all equipment
   - GFCI protection on AC circuits
   - Emergency disconnect capability

3. **Mechanical Safety:**
   - Safety guards on moving parts
   - Emergency stop accessibility
   - Proper lifting procedures for heavy actuators

### Test Failure Protocols
1. **Immediate Actions:**
   - Stop testing if safety issues arise
   - Document failure conditions
   - Notify engineering team

2. **Root Cause Analysis:**
   - Systematic failure investigation
   - Component analysis if failure occurs
   - Design modification recommendations

3. **Corrective Actions:**
   - Implement process improvements
   - Update test procedures
   - Enhance safety protocols

---

**Document Version:** 1.0
**Approved by:** Engineering Team
**Test Director:** Project Engineer
**Status:** Ready for execution