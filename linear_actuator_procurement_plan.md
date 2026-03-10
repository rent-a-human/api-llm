# Linear Actuator Procurement and Fit Testing Plan
## WALL-E Quad Robot Project

### Executive Summary
This document outlines the comprehensive plan for researching, procuring, and testing linear actuators for the WALL-E Quad robot project. The focus is on Progressive Automations PA-04/PA-13 actuators and alternative commercial options for the 8-12kg payload robotics application.

---

## 1. Primary Target Actuators

### 1.1 Progressive Automations PA-04
**Key Specifications:**
- **Force Ratings:** 100 lbs (445N) and 400 lbs (1779N) versions
- **Speed:** 2.8"/sec (71mm/s)
- **Environmental Protection:** IP66 rating (dust and water resistant)
- **Voltage:** 12V and 24V versions available
- **Stroke Lengths:** Multiple options available
- **Features:** 
  - Low noise operation
  - Built-in limit switches
  - High environmental protection
  - Feedback options available
- **Applications:** Manufacturing, marine, automotive, home automation
- **Current Draw:** To be determined through testing
- **Dimensions:** A = Stroke Length + 7.87", B = Stroke Length x 2 + 7.87"

### 1.2 Progressive Automations PA-13
**Key Specifications:**
- **Force Ratings:** Up to 3000 lbs (13,345N) dynamic force, 3500 lbs (15,570N) holding force
- **Stroke Lengths:** 4" to 40" (102mm to 1016mm)
- **Environmental Protection:** High environmental protection rating
- **Construction:** Stainless steel shaft with metal gears
- **Feedback Options:** 
  - Potentiometer (up to 6" stroke)
  - Hall effect (up to 40" stroke)
- **Applications:** High-force industrial applications

---

## 2. Alternative Suppliers Analysis

### 2.1 Firgelli Technologies
**L12 Series Linear Actuators:**
- Micro linear actuators with axial design
- Powerful drivetrain with rectangular cross-section
- Optional on-board microcontroller
- 12V and 24V options available
- Force range: 35lbs, 150lbs, 200lbs
- Stroke lengths: 1" to 40"
- Built-in limit switches
- UL recognized components

### 2.2 Thomson Industries
**Electrak Series:**
- Electric actuators with 12V and 24V options
- Self-locking acme screw drive system
- Stainless steel extension tube options
- Synchronization capabilities available
- High durability for demanding applications

### 2.3 Exlar (Curtiss-Wright)
**Electric Linear & Rotary Actuators:**
- Broad range of capabilities and performance
- Linear and rotary configurations
- Robust and reliable solutions
- Cost-effective for various motion applications

---

## 3. Testing Requirements and Parameters

### 3.1 Robot Leg Movement Specifications
- **Stroke Length Requirements:** To be determined based on preliminary leg designs
- **Force Output Requirements:** 50-1000N force range for 8-12kg payload
- **Response Time:** Sub-second positioning accuracy
- **Positioning Accuracy:** ±1mm tolerance required

### 3.2 Environmental and Operational Testing
- **IP66 Rating Validation:** Dust and water ingress protection
- **12V Operation:** Voltage compatibility with robot power system
- **Load Capacity Testing:** 50-1000N force range validation
- **Power Consumption:** Current draw measurement under various loads
- **Heat Generation:** Thermal management assessment
- **Continuous Operation:** Durability under cycling loads

### 3.3 Mechanical Integration Assessment
- **Mounting Interface:** Compatibility with robot leg designs
- **Size Constraints:** Integration with robot chassis
- **Weight Impact:** Effect on overall robot weight
- **Cable Management:** Power and control signal routing

---

## 4. Procurement Strategy

### 4.1 Sample Order Recommendations
**Primary Choice - Progressive Automations PA-04:**
- Order 2x PA-04 actuators in 100N and 400N force ratings
- Stroke length: 4" (102mm) for initial testing
- Include feedback sensor options for position control
- Total estimated cost: $200-400 per actuator

**Alternative Choice - Progressive Automations PA-13:**
- Order 1x PA-13 in mid-force range (1000-1500N)
- Stroke length: 6" (152mm) for testing
- Include hall effect feedback sensor
- Total estimated cost: $300-600 per actuator

**Comparison Samples:**
- 1x Firgelli L12 series actuator
- 1x Thomson Electrak series actuator

### 4.2 Supplier Contact Information
**Progressive Automations:**
- Website: www.progressiveautomations.com
- Sales: 1.800.676.6123
- Email: sales@progressiveautomations.com
- Custom options available
- 15+ years industry experience

**Alternative Suppliers:**
- Firgelli: www.firgelli.com
- Thomson: www.thomsonlinear.com
- Exlar: www.exlar.com

---

## 5. Test Fixture Design Requirements

### 5.1 Force Testing Fixture
- **Load Cell Setup:** 0-2000N capacity load cell
- **Actuator Mounting:** Adjustable mounting brackets
- **Data Acquisition:** Force, displacement, current, voltage monitoring
- **Control System:** Arduino or similar for test control

### 5.2 Stroke and Position Testing
- **Linear Scale:** High-precision displacement measurement
- **Position Sensors:** Potentiometer or encoder feedback
- **Speed Measurement:** Time-based displacement tracking
- **Accuracy Testing:** Repeatability and precision validation

### 5.3 Environmental Testing Setup
- **IP66 Testing:** Dust chamber and water spray test
- **Temperature Monitoring:** Thermocouples for thermal analysis
- **Power Measurement:** Current and voltage logging
- **Continuous Operation:** Automated cycling test rig

---

## 6. Testing Procedures

### 6.1 Physical Fit Testing
1. **Mounting Interface Testing:**
   - Custom mounting bracket fabrication
   - Fit testing with robot leg prototypes
   - Mechanical stress testing under operation
   - Vibration and shock testing

2. **Stroke Length Validation:**
   - Measure actual stroke vs. rated stroke
   - Test stroke consistency across multiple actuators
   - Validate stroke under various load conditions

### 6.2 Force and Performance Testing
1. **Load Testing Protocol:**
   - No-load speed measurement
   - Rated load testing (50%, 75%, 100% of rated force)
   - Overload testing (125% of rated force)
   - Dynamic response testing

2. **Power Consumption Analysis:**
   - Current draw at no load
   - Current draw at rated load
   - Power efficiency calculation
   - Heat generation measurement

### 6.3 Environmental Validation
1. **IP66 Rating Verification:**
   - Dust ingress testing per IP6X standards
   - Water jet testing per IPX6 standards
   - Continuous operation under environmental stress

2. **Durability Testing:**
   - Continuous operation cycles (1000+ cycles)
   - Temperature cycling (-20°C to +60°C)
   - Humidity exposure testing

---

## 7. Evaluation Criteria and Scoring Matrix

### 7.1 Technical Performance (40%)
- Force output capability (10%)
- Speed and response time (10%)
- Positioning accuracy (10%)
- Power efficiency (10%)

### 7.2 Environmental Compatibility (25%)
- IP66 rating compliance (10%)
- Temperature range operation (8%)
- Humidity resistance (7%)

### 7.3 Mechanical Integration (20%)
- Mounting interface compatibility (8%)
- Size and weight constraints (7%)
- Cable management (5%)

### 7.4 Cost and Availability (15%)
- Unit cost (8%)
- Lead time and availability (4%)
- Long-term supply reliability (3%)

---

## 8. Deliverables and Timeline

### 8.1 Week 1-2: Procurement Phase
- [ ] Contact suppliers for detailed specifications
- [ ] Request quotes for sample actuators
- [ ] Place orders for test samples
- [ ] Begin test fixture fabrication

### 8.2 Week 3-4: Testing Phase
- [ ] Receive and inspect actuators
- [ ] Perform physical fit testing
- [ ] Execute force and performance tests
- [ ] Conduct environmental validation

### 8.3 Week 5: Analysis and Reporting
- [ ] Compile test results
- [ ] Analyze cost-benefit data
- [ ] Create supplier comparison matrix
- [ ] Generate procurement recommendations

### 8.4 Final Deliverables
1. **Comprehensive Actuator Supplier Comparison**
   - Technical specifications comparison
   - Price and availability analysis
   - Supplier reliability assessment

2. **Physical Test Results and Recommendations**
   - Performance test data
   - Environmental test results
   - Fit testing validation
   - Recommended actuator selection

3. **Updated Actuator Specifications for CAD Models**
   - Dimensional drawings
   - Mounting interface specifications
   - Weight and center of gravity data
   - Cable routing requirements

4. **Purchase Recommendations for Production Units**
   - Recommended actuator model and quantity
   - Supplier selection rationale
   - Cost projection for full production
   - Lead time and delivery schedule

5. **Updated BOM with Validated Actuator Costs**
   - Complete part numbers and descriptions
   - Unit costs and total costs
   - Alternative part options
   - Cost optimization recommendations

---

## 9. Risk Assessment and Mitigation

### 9.1 Technical Risks
- **Risk:** Actuator force insufficient for robot payload
- **Mitigation:** Test multiple force ratings, consider gear reduction options

- **Risk:** Environmental protection inadequate
- **Mitigation:** Verify IP ratings, consider custom sealing solutions

- **Risk:** Power consumption exceeds robot capacity
- **Mitigation:** Optimize duty cycles, consider power management strategies

### 9.2 Procurement Risks
- **Risk:** Long lead times affecting project schedule
- **Mitigation:** Order samples early, identify multiple suppliers

- **Risk:** Cost overruns due to custom requirements
- **Mitigation:** Standard specifications, volume pricing negotiations

- **Risk:** Supplier reliability concerns
- **Mitigation:** Multiple supplier evaluation, supply chain diversification

---

## 10. Budget Estimation

### 10.1 Sample Actuator Costs
- Progressive Automations PA-04 (100N): $150-200 each
- Progressive Automations PA-04 (400N): $200-250 each
- Progressive Automations PA-13 (1500N): $300-400 each
- Alternative samples (2x): $200-300 each
- **Total Sample Cost:** $1,000-1,500

### 10.2 Test Equipment and Fixtures
- Load cell and instrumentation: $500-800
- Test fixture fabrication: $300-500
- Data acquisition setup: $200-400
- **Total Test Setup:** $1,000-1,700

### 10.3 Estimated Project Total
**Total Estimated Budget:** $2,000-3,200

---

## 11. Next Steps

1. **Immediate Actions (This Week):**
   - Contact Progressive Automations for detailed PA-04/PA-13 specifications
   - Request quotes for sample actuators
   - Begin test fixture design and fabrication planning

2. **Short-term Actions (Next 2 Weeks):**
   - Place orders for sample actuators
   - Finalize test fixture designs
   - Prepare test procedures and documentation

3. **Medium-term Actions (Weeks 3-4):**
   - Receive and begin testing samples
   - Perform comprehensive evaluation
   - Generate preliminary recommendations

This comprehensive plan provides a structured approach to evaluating linear actuators for the WALL-E Quad robot project, ensuring that all technical, environmental, and cost requirements are thoroughly assessed before making final procurement decisions.