# Linear Actuator Procurement and Fit Testing Research Report
## WALL-E Quad Robot Project

### Executive Summary
Comprehensive research on Progressive Automations PA-04/PA-13 linear actuators and alternative suppliers for WALL-E Quad robot leg actuation. This document provides specifications comparison, procurement recommendations, and testing protocols for component validation.

---

## 1. Progressive Automations Actuator Specifications

### PA-04 Linear Actuator
**Primary Specifications:**
- **Force Capacity:** 100 lbs (445N) and 400 lbs (1,780N) versions
- **Stroke Length:** 1" to 40" (configurable)
- **Operating Voltage:** 12VDC / 24VDC
- **Current Draw:** 12A at full load (12V version)
- **Speed:** 
  - 100 lbs version: 2.8"/sec
  - 400 lbs version: 0.98"/sec
- **IP Rating:** IP66 (dust-tight, water-resistant)
- **Duty Cycle:** 20%
- **Screw Type:** ACME screw
- **Mounting Holes:** 0.40" diameter
- **Static Load Rating:** Same as dynamic load rating
- **Dimensions:** A = Stroke Length + 7.87", B = Stroke Length × 2 + 7.87"
- **Operating Temperature:** Not specified in available data
- **Standby Current:** Low power consumption in standby mode
- **Control:** Simple DC motor with positional feedback options

### PA-13 High Force Industrial Linear Actuator
**Primary Specifications:**
- **Force Capacity:** 3000 lbs (13,340N) push/pull, 3500 lbs static hold
- **Stroke Length:** 1" to 40"
- **Operating Voltage:** 12VDC
- **Current Draw:** 20A at full load
- **Screw Type:** ACME screw
- **Duty Cycle:** 20%
- **Mounting Holes:** 0.50" diameter
- **Shaft Material:** Stainless steel
- **Gears:** Metal gears
- **Environmental Protection:** High environmental rating (IP rating not explicitly specified)
- **Suitable for:** Heavy-duty industrial applications

---

## 2. Alternative Supplier Comparison

### Firgelli Technologies
**L12 Series (Micro Linear Actuators)**
- **Force Range:** 35-220 lbs (156-979N)
- **Stroke Options:** 1-30 inches
- **Voltage:** 12V/24V
- **IP Rating:** High IP rating (water & dust resistant)
- **Features:** Compact design, built-in feedback options
- **Applications:** Robotics, automation, marine

**L16 Series**
- **Force Range:** Higher than L12 (exact specifications require vendor contact)
- **Stroke:** Multiple options available
- **Applications:** Higher power applications than L12

### Actuonix Motion Devices
**L12 Series**
- **Force Options:** 100N, 150N models available
- **Stroke Lengths:** 50mm, 100mm options
- **Current:** 3.3mA standby current
- **Voltage:** 12VDC
- **Features:** Microcontroller options, position feedback
- **Gear Ratios:** Multiple ratio options (210:1 etc.)

**P16 Series**
- **Higher force capability** than L12
- **Industrial grade** specifications
- **Multiple control options** available

### Tolomatic Electric Actuators
**RSA/RSM Series**
- **Force Capability:** High force applications
- **IP Rating:** Up to IP69K (superior to PA-04)
- **Screw Options:** Ball screw or roller screw
- **Features:** Enhanced thrust bearing, heavy-duty internal bumpers
- **Maintenance:** Grease zerk for easy lubrication
- **Applications:** Heavy-duty industrial, washdown environments

**RS32/RS40 Series**
- **Various force ratings** available
- **High accuracy** positioning
- **Configurable stroke lengths**
- **Flexible mounting options**

---

## 3. Supplier Analysis Summary

| Supplier | Force Range | IP Rating | Voltage | Stroke Range | Current Draw | Special Features |
|----------|-------------|-----------|---------|--------------|--------------|------------------|
| **Progressive Automations PA-04** | 100-400 lbs | IP66 | 12/24V | 1-40" | 12A | Versatile, low noise, high speed |
| **Progressive Automations PA-13** | 3000 lbs | High IP | 12V | 1-40" | 20A | Industrial grade, stainless shaft |
| **Firgelli L12** | 35-220 lbs | High IP | 12/24V | 1-30" | Variable | Compact, feedback options |
| **Actuonix L12** | 100-150N | Standard | 12V | 50-100mm | 3.3mA standby | Microcontroller options |
| **Tolomatic RSA** | High force | Up to IP69K | Multiple | Configurable | Variable | Heavy duty, maintenance-friendly |

---

## 4. WALL-E Quad Robot Requirements Analysis

### Design Specifications
- **Robot Weight:** 8-12 kg payload capacity
- **Number of Actuators:** 4 (one per leg)
- **Force Requirements:** 50-1000N operational range
- **Environmental:** IP66+ rating for outdoor operation
- **Operating Voltage:** 12V system
- **Stroke Requirements:** TBD based on leg kinematics
- **Response Time:** Real-time leg positioning
- **Accuracy:** Precise foot positioning for stability

### Recommended Actuator Selection Criteria
1. **Force Rating:** Minimum 200-300N per actuator (safety factor)
2. **Stroke:** 2-6 inches (estimated for robot leg movement)
3. **Speed:** Fast response for dynamic stability (1-3"/sec)
4. **Power:** <15A per actuator at full load
5. **Size:** Compact for integration in leg structure
6. **Feedback:** Position feedback for closed-loop control

---

## 5. Procurement Recommendations

### Primary Recommendation: Progressive Automations PA-04
**Justification:**
- ✅ IP66 rating meets environmental requirements
- ✅ 12V operation matches robot electrical system
- ✅ 400 lbs version provides adequate force margin
- ✅ Proven industrial reliability
- ✅ Available in multiple stroke lengths
- ✅ Reasonable current draw (12A)
- ✅ Established supplier with technical support

**Suggested Configuration:**
- Model: PA-04-6-400-HS (6" stroke, 400 lbs, high speed)
- Quantity: 2 units for initial testing
- Estimated Cost: $200-300 per unit

### Alternative Option: Firgelli L12 Series
**Justification:**
- ✅ Compact size ideal for robot integration
- ✅ Good force-to-size ratio
- ✅ Position feedback options
- ✅ Competitive pricing
- ❓ May require force verification testing
- ❓ IP rating needs confirmation

### Not Recommended: PA-13 for WALL-E Application
**Reason:** Excessive force capacity (3000 lbs) creates unnecessary cost, size, and power consumption for the 8-12kg robot application.

---

## 6. Testing Protocol

### Phase 1: Basic Performance Testing
**Objective:** Validate manufacturer specifications

#### Test Equipment Required:
- Digital force gauge (0-2000N range)
- Linear position sensor
- 12V power supply (20A capacity)
- Current measurement tools
- Timer/stopwatch
- Temperature sensor

#### Test Procedures:

**A. Force Output Testing**
1. Mount actuator in test fixture
2. Connect to force gauge
3. Measure push/pull force at:
   - No load
   - 25% stroke
   - 50% stroke  
   - 75% stroke
   - Full stroke
4. Record force readings and compare to specifications

**B. Speed Testing**
1. Set actuator to continuous extension/retraction
2. Measure time for full stroke
3. Calculate actual speed
4. Test at various load conditions

**C. Current Consumption Testing**
1. Measure current at no load
2. Measure current at 50% load
3. Measure current at full load
4. Record standby current
5. Monitor current during acceleration/deceleration

### Phase 2: Environmental Testing
**Objective:** Validate IP66 rating and environmental protection

#### Test Procedures:
1. **Dust Resistance Test**
   - Expose actuator to fine dust for 30 minutes
   - Inspect for dust ingress
   - Verify continued operation

2. **Water Resistance Test**
   - Direct water spray test (simulating rain)
   - Verify IP66 compliance
   - Check for water ingress

3. **Temperature Testing**
   - Operating range test (-10°C to +50°C)
   - Monitor performance across temperature range
   - Check for thermal shutdown or degradation

### Phase 3: Integration Testing
**Objective:** Validate fit and integration with robot leg design

#### Test Procedures:
1. **Mechanical Fit Testing**
   - Mount in preliminary leg design
   - Check clearances and mounting points
   - Verify stroke clearance in robot structure

2. **Dynamic Testing**
   - Integrate with robot control system
   - Test continuous operation cycles
   - Measure response time to commands

3. **Load Testing**
   - Simulate robot operational loads
   - Test under worst-case scenarios
   - Verify positional accuracy under load

---

## 7. Cost Analysis

### PA-04 Pricing (Estimated)
- **100 lbs version:** $150-200 per unit
- **400 lbs version:** $200-300 per unit
- **High-speed version:** Additional $50-75 per unit
- **Mounting hardware:** $25-50 per unit
- **Shipping:** $25-50 per order

### Total Initial Testing Investment
- 2x PA-04 actuators (400 lbs, 6" stroke): $500-700
- Test fixtures and equipment: $200-400
- Shipping and handling: $50-100
- **Total Phase 1 Testing Cost:** $750-1200

### Production Cost Projection (4 actuators)
- 4x PA-04 actuators: $1000-1400
- Mounting hardware: $100-200
- **Total Production Cost:** $1100-1600

---

## 8. Timeline and Next Steps

### Immediate Actions (Week 1)
1. ✅ Complete supplier research
2. 🔄 Order 2x PA-04-6-400-HS actuators for testing
3. 🔄 Procure test equipment
4. 🔄 Design test fixtures

### Testing Phase (Weeks 2-3)
1. 🔄 Receive actuators
2. 🔄 Build test fixtures
3. 🔄 Execute Phase 1 testing protocols
4. 🔄 Document results

### Integration Phase (Week 4)
1. 🔄 Preliminary leg design modifications
2. 🔄 Integration testing
3. 🔄 Performance validation
4. 🔄 Final procurement recommendation

### Deliverables Due
- Complete test results report
- Final actuator procurement recommendation
- Updated actuator specifications for CAD integration
- Purchase order for production units

---

## 9. Risk Assessment

### Technical Risks
- **Force output insufficient:** Mitigate by selecting 400 lbs version
- **Current draw too high:** Validate with electrical testing
- **Size/weight impact:** Confirm through integration testing
- **Positional accuracy:** Verify with feedback testing

### Supply Chain Risks
- **Long lead times:** Order early for testing phase
- **Supplier availability:** Identify backup suppliers (Firgelli, Tolomatic)
- **Price fluctuations:** Lock in testing unit pricing

### Project Risks
- **Testing delays:** Buffer timeline for unexpected issues
- **Performance shortfall:** Have alternative actuator options ready
- **Integration issues:** Maintain design flexibility for mounting

---

## 10. Conclusions and Recommendations

### Primary Recommendation
Proceed with **Progressive Automations PA-04-6-400-HS** linear actuators for WALL-E Quad robot implementation based on:
- Proven IP66 environmental protection
- Adequate force capacity with safety margin
- Compatible 12V electrical system
- Reasonable current consumption
- Established supplier reliability

### Next Steps
1. **Immediate:** Order 2 testing units for validation
2. **Week 1:** Execute comprehensive testing protocol
3. **Week 2:** Integration testing with leg design
4. **Week 3:** Final procurement decision and production order

### Success Criteria
- Force output ≥300N consistently
- Current draw <15A at rated load
- IP66 protection validated
- Mechanical integration successful
- Positional accuracy ±2mm achievable

---

**Document Version:** 1.0
**Date:** Current
**Prepared for:** WALL-E Quad Robot Project
**Status:** Ready for procurement action