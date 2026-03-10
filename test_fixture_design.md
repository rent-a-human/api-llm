# Linear Actuator Test Fixture Design and Procedures
## WALL-E Quad Robot Project

---

## 1. Test Fixture Overview

### 1.1 Purpose
This document provides detailed designs and procedures for testing linear actuators for the WALL-E Quad robot project. The test fixtures are designed to validate force output, stroke accuracy, environmental protection, and mechanical integration.

### 1.2 Test Categories
- **Force Performance Testing:** Load capacity, speed vs. force curves
- **Environmental Testing:** IP66 validation, temperature cycling
- **Mechanical Integration:** Mounting interface, dimensional verification
- **Power Consumption:** Current draw, efficiency measurements
- **Durability Testing:** Continuous operation, lifecycle validation

---

## 2. Force Testing Fixture Design

### 2.1 Fixture Components

#### Main Frame Structure
```
    ┌─────────────────────────────────────┐
    │            Test Enclosure            │
    ├─────────────────────────────────────┤
    │  ┌─────────────┐  ┌─────────────┐    │
    │  │  Actuator   │  │  Load Cell  │    │
    │  │   Mount A   │──│    Mount    │    │
    │  └─────────────┘  └─────────────┘    │
    │         │               │            │
    │    ┌────▼────┐    ┌─────▼─────┐      │
    │    │Linear   │    │Data       │      │
    │    │Guide    │    │Acquisition│      │
    │    │System   │    │Unit       │      │
    │    └─────────┘    └───────────┘      │
    └─────────────────────────────────────┘
```

#### Detailed Components List:
1. **Main Frame:** 80/20 aluminum extrusion (2020 series)
2. **Actuator Mount A:** Adjustable mounting plate with multiple hole patterns
3. **Actuator Mount B:** Fixed mounting plate with load cell interface
4. **Load Cell:** S-Type load cell, 0-2000N capacity
5. **Linear Guide System:** Precision linear bearings and guide rails
6. **Data Acquisition:** Arduino-based DAQ with HX711 load cell amplifier

### 2.2 Load Cell Integration

#### Specifications:
- **Capacity:** 0-2000N (450 lbs)
- **Accuracy:** ±0.1% of full scale
- **Output:** 2mV/V nominal
- **Excitation:** 5V DC
- **Amplifier:** HX711 24-bit ADC

#### Wiring Diagram:
```
Load Cell (4-wire):
    Red (+)     →    HX711 E+ (Excitation +)
    Black (-)   →    HX711 E- (Excitation -)
    White (+)   →    HX711 A- (Signal -)
    Green (-)   →    HX711 A+ (Signal +)

Arduino Connections:
    VCC (3.3V)  →    HX711 VCC
    GND         →    HX711 GND
    Pin 2       →    HX711 DT (Data)
    Pin 3       →    HX711 SCK (Clock)
```

### 2.3 Actuator Mounting System

#### Adjustable Mount (Mount A):
- **Material:** 6061-T6 aluminum, 6mm thickness
- **Dimensions:** 120mm x 80mm x 6mm
- **Hole Pattern:** Standard actuator mounting holes + M6 threaded holes
- **Adjustability:** ±10mm in X, Y, Z axes using adjustment screws

#### Fixed Mount with Load Cell (Mount B):
- **Material:** 6061-T6 aluminum, 10mm thickness
- **Dimensions:** 100mm x 100mm x 10mm
- **Interface:** M8 threaded hole for load cell attachment
- **Alignment:** Precision dowel pins for repeatable positioning

---

## 3. Position and Stroke Testing Setup

### 3.1 Linear Scale Measurement System

#### Components:
- **Linear Scale:** Digital linear scale, 0-300mm range, 0.01mm resolution
- **Readout:** Digital display with analog output for data logging
- **Mounting:** Magnetic base with adjustable mounting arm

#### Setup:
```
Actuator Rod → Coupling → Linear Scale Rod
     ↓              ↓
  Load Cell    Magnetic Mount
```

### 3.2 Position Feedback Testing

#### For Actuators with Built-in Feedback:
1. **Potentiometer-Based Actuators:**
   - Connect analog output to Arduino ADC
   - Calibrate voltage vs. position
   - Test linearity and repeatability

2. **Hall Effect Sensor Actuators:**
   - Connect digital output to Arduino
   - Test pulse count vs. position
   - Verify direction sensing

### 3.3 Speed Measurement Procedure

#### No-Load Speed Test:
1. Mount actuator in test fixture
2. Program Arduino for timed extension/retraction cycles
3. Measure position vs. time using linear scale
4. Calculate speed = distance/time
5. Repeat for multiple cycles and average results

#### Load-Based Speed Test:
1. Apply incremental loads using weights or hydraulic cylinder
2. Measure speed at 25%, 50%, 75%, 100% of rated load
3. Create speed vs. load curve
4. Document any speed degradation patterns

---

## 4. Environmental Testing Chamber

### 4.1 IP66 Testing Setup

#### Dust Testing (IP6X):
- **Chamber:** Sealed test chamber with dust injection system
- **Dust Type:** Talc powder (magnesium silicate, 10-20μm particle size)
- **Test Duration:** 2 hours with continuous dust circulation
- **Procedure:**
  1. Install actuator in sealed chamber
  2. Operate actuator through full stroke cycles
  3. No dust penetration allowed

#### Water Jet Testing (IPX6):
- **Setup:** Water jet nozzle, 12.5mm diameter
- **Pressure:** 100 kPa (14.5 psi) at 3m distance
- **Duration:** 3 minutes minimum
- **Procedure:**
  1. Mount actuator with shaft in vertical position
  2. Direct water jet at all angles around actuator
  3. Operate actuator during test
  4. No water ingress allowed

### 4.2 Temperature Testing Setup

#### Temperature Range Testing:
- **Cold Test:** -20°C for 2 hours
- **Hot Test:** +60°C for 2 hours
- **Cycle Test:** 10 cycles from -20°C to +60°C

#### Equipment:
- **Environmental Chamber:** Programmable temperature chamber
- **Temperature Monitoring:** Multiple thermocouples
- **Data Logging:** Continuous temperature and performance logging

### 4.3 Humidity Testing

#### Test Conditions:
- **Relative Humidity:** 95% ± 3%
- **Temperature:** 40°C ± 2°C
- **Duration:** 48 hours continuous exposure
- **Monitoring:** Condensation detection and corrosion inspection

---

## 5. Power Consumption Testing Setup

### 5.1 Electrical Measurement System

#### Components:
- **Power Supply:** Programmable DC power supply (0-15V, 0-10A)
- **Current Shunt:** Precision current shunt (0.1Ω, 1% accuracy)
- **Voltage Measurement:** High accuracy voltmeter
- **Data Logging:** Computer-based data acquisition

#### Circuit Diagram:
```
Power Supply (+) → Current Shunt → Actuator (+) → Power Supply (-)
                        ↓
                   Voltage Drop Measurement
                        ↓
                   Data Acquisition System
```

### 5.2 Power Analysis Procedures

#### No-Load Power Test:
1. Set supply voltage to 12.0V ±0.1V
2. Measure current draw during extension and retraction
3. Record power consumption at various speeds (if variable speed)
4. Calculate idle power consumption

#### Load-Based Power Test:
1. Apply known loads to actuator
2. Measure current draw at different force levels
3. Calculate power = Voltage × Current
4. Determine efficiency = (Mechanical Power) / (Electrical Power)

#### Power Efficiency Calculation:
```
Mechanical Power = Force (N) × Speed (m/s)
Electrical Power = Voltage (V) × Current (A)
Efficiency = (Mechanical Power) / (Electrical Power) × 100%
```

---

## 6. Data Acquisition System

### 6.1 Arduino-Based DAQ System

#### Hardware Requirements:
- **Arduino Uno or Mega:** Primary data logger
- **HX711 Load Cell Amplifier:** For force measurement
- **ADS1115 16-bit ADC:** For voltage and current measurement
- **SD Card Module:** For data logging
- **Real-Time Clock:** For timestamp accuracy

#### Sensor Connections:
```cpp
// Pin Definitions
#define LOAD_CELL_DT 2    // HX711 Data pin
#define LOAD_CELL_SCK 3   // HX711 Clock pin
#define ACTUATOR_FB_PIN A0 // Actuator feedback (analog)
#define CURRENT_SENSE_PIN A1 // Current measurement
#define TEMP_PIN A2        // Temperature sensor
```

### 6.2 Data Logging Format

#### CSV File Structure:
```
Timestamp,Force_N,Position_mm,Current_A,Voltage_V,Speed_mms,Temp_C,Load_Percent
1638360000,245.3,45.2,1.82,12.0,23.1,25.4,55
1638360001,251.1,45.4,1.85,12.0,23.0,25.5,56
1638360002,248.7,45.6,1.83,12.0,23.1,25.6,56
...
```

### 6.3 Software Interface

#### Arduino Sketch Structure:
```cpp
#include <HX711.h>
#include <SD.h>
#include <Wire.h>
#include <RTClib.h>
#include <SoftwareSerial.h>

// Initialize libraries and objects
HX711 scale;
File dataFile;
RTC_DS1307 rtc;

// Main loop
void loop() {
  readSensors();
  logData();
  delay(100); // 10Hz sampling rate
}

void readSensors() {
  force = scale.get_units(3); // Average of 3 readings
  position = readPositionSensor();
  current = readCurrentSensor();
  voltage = readVoltageSensor();
  temperature = readTemperatureSensor();
}

void logData() {
  if (SD.exists("actuator_test.txt")) {
    dataFile = SD.open("actuator_test.txt", FILE_WRITE);
    dataFile.print(timestamp);
    dataFile.print(",");
    dataFile.print(force);
    // ... more data fields
    dataFile.println();
    dataFile.close();
  }
}
```

---

## 7. Test Procedures and Protocols

### 7.1 Pre-Test Setup

#### Equipment Calibration:
1. **Load Cell Calibration:**
   - Apply known weights (0N, 50N, 100N, 200N)
   - Record voltage output
   - Create calibration curve
   - Verify accuracy within ±1%

2. **Position System Calibration:**
   - Verify linear scale accuracy using precision gauge blocks
   - Test repeatability at multiple positions
   - Document measurement uncertainty

3. **Electrical System Calibration:**
   - Verify voltage measurement accuracy
   - Calibrate current measurement using precision ammeter
   - Test data acquisition timing accuracy

#### System Verification:
1. Run test without actuator to verify zero readings
2. Test manual load application to verify force readings
3. Verify data logging and timestamp accuracy

### 7.2 Force Testing Protocol

#### Test Sequence:
1. **No-Load Test:**
   - Extend and retract actuator 10 cycles
   - Record force readings during motion
   - Verify near-zero force output

2. **Incremental Load Test:**
   - Apply loads: 25%, 50%, 75%, 100% of rated force
   - Hold each load for 30 seconds
   - Record steady-state force output
   - Measure actuator response time to load changes

3. **Overload Test:**
   - Apply 125% of rated force
   - Document any current limiting or protection behavior
   - Verify actuator continues to operate

4. **Dynamic Load Test:**
   - Apply varying loads using programmed sequences
   - Test response time to rapid load changes
   - Verify positioning accuracy under dynamic conditions

### 7.3 Performance Testing Protocol

#### Speed Testing:
1. Measure no-load extension speed
2. Measure no-load retraction speed
3. Measure loaded extension speed at rated load
4. Calculate speed degradation percentage

#### Stroke Accuracy Testing:
1. Measure full extension stroke length
2. Measure full retraction stroke length
3. Test stroke consistency over 100 cycles
4. Measure backlash (clearance at direction change)

#### Position Repeatability:
1. Extend to 25%, 50%, 75%, 100% of stroke
2. Return to start position
3. Repeat approach to same positions
4. Measure position accuracy and repeatability

### 7.4 Environmental Testing Protocol

#### IP66 Dust Test:
1. Install actuator in sealed dust chamber
2. Start talc powder circulation
3. Operate actuator through 10 full cycles
4. Stop circulation and let chamber settle
5. Open chamber and inspect for dust ingress

#### IP66 Water Test:
1. Mount actuator vertically in test setup
2. Apply water jet at 100 kPa from 3m distance
3. Move jet in circular pattern covering all angles
4. Operate actuator during water exposure
5. Inspect for water ingress after test

#### Temperature Cycling:
1. Set chamber to -20°C
2. Hold for 2 hours, operate actuator periodically
3. Ramp temperature to +60°C over 1 hour
4. Hold at +60°C for 2 hours, operate actuator periodically
5. Return to room temperature over 1 hour
6. Repeat cycle 10 times

### 7.5 Power Testing Protocol

#### Current Draw Testing:
1. Measure idle current with actuator stationary
2. Measure extension current with no load
3. Measure retraction current with no load
4. Measure current at 25%, 50%, 75%, 100% load
5. Calculate power consumption at each condition

#### Efficiency Testing:
1. Calculate mechanical power output at each load level
2. Calculate electrical power input
3. Calculate efficiency = mechanical/electrical power
4. Plot efficiency vs. load curve

---

## 8. Data Analysis Procedures

### 8.1 Performance Metrics

#### Force Metrics:
- **Rated Force Accuracy:** |Measured - Rated| / Rated × 100%
- **Force Linearity:** Standard deviation of force measurements
- **Force Repeatability:** Variation in force output over multiple tests

#### Speed Metrics:
- **Speed Accuracy:** |Measured - Rated| / Rated × 100%
- **Speed Consistency:** Standard deviation of speed measurements
- **Speed vs. Load Degradation:** (No-load speed - Loaded speed) / No-load speed

#### Position Metrics:
- **Position Accuracy:** Root mean square error of position measurements
- **Position Repeatability:** Standard deviation of repeated position measurements
- **Stroke Accuracy:** |Actual - Rated| stroke length

### 8.2 Environmental Performance

#### IP66 Compliance:
- **Dust Ingress:** Binary pass/fail (no dust inside housing)
- **Water Ingress:** Binary pass/fail (no water inside housing)
- **Performance After Exposure:** Comparison of pre and post test performance

#### Temperature Performance:
- **Cold Start:** Time to first movement at -20°C
- **Hot Operation:** Performance maintenance at +60°C
- **Thermal Cycling:** Performance degradation over temperature cycles

### 8.3 Reliability Metrics

#### Durability Testing:
- **Cycle Count:** Number of complete extension/retraction cycles
- **Performance Degradation:** Change in performance over test duration
- **Failure Mode:** Description of any failures during testing

#### Power Efficiency:
- **Idle Power:** Power consumption when stationary
- **Operating Efficiency:** Mechanical power / Electrical power
- **Power Factor:** Relationship between current draw and force output

---

## 9. Test Report Template

### 9.1 Executive Summary
- Test objectives and methodology
- Key findings and recommendations
- Overall actuator performance rating

### 9.2 Technical Results
- Force performance data and analysis
- Speed and position accuracy results
- Environmental testing compliance
- Power consumption and efficiency analysis

### 9.3 Comparative Analysis
- Performance vs. specifications
- Comparison with competing products
- Cost-benefit analysis

### 9.4 Recommendations
- Suitability for WALL-E Quad robot application
- Suggested modifications or improvements
- Procurement recommendations

---

## 10. Safety Considerations

### 10.1 Personal Protective Equipment
- Safety glasses required during all testing
- Cut-resistant gloves when handling test fixtures
- Closed-toe shoes required in test area

### 10.2 Test Area Safety
- Keep hands clear of moving parts during operation
- Emergency stop button easily accessible
- Clear area around test fixtures for safe operation

### 10.3 Electrical Safety
- Proper grounding of all equipment
- Use of appropriate fuses and circuit protection
- Lock-out/tag-out procedures for maintenance

### 10.4 High Force Safety
- Use mechanical stops to limit actuator travel
- Keep body parts away from load cell connection points
- Use lifting aids for heavy test fixtures

This comprehensive test fixture design and procedure manual provides the foundation for systematic evaluation of linear actuators for the WALL-E Quad robot project. The modular design allows for adaptation to different actuator sizes and testing requirements.