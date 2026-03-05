// Data transformation utilities for patient onboarding
// Transform onboarding data into format suitable for diagnosis

/**
 * Transform raw onboarding data into comprehensive patient profile
 * @param {Object} onboardingData - Raw data from onboarding process
 * @returns {Object} Structured patient profile for diagnosis
 */
export const transformToPatientProfile = (onboardingData) => {
  const {
    // Personal Information
    fullName,
    age,
    sex,
    idNumber,
    occupation,
    
    // Medical Information
    reasonForConsultation,
    allergies = [],
    medications = [],
    pastMedicalHistory = [],
    
    // Symptoms
    hasPain,
    painIntensity,
    painLocations = [],
    symptomDuration,
    associatedSymptoms = [],
    painTriggers,
    painRelief,
    
    // Additional Context
    familyMedicalHistory = [],
    smokingStatus,
    packYears,
    alcoholConsumption,
    alcoholUnits,
    exerciseFrequency,
    emergencyContact,
    insurance
  } = onboardingData;

  return {
    // Basic patient information
    personalInfo: {
      fullName: fullName?.trim() || '',
      age: parseInt(age) || null,
      sex: sex || '',
      idNumber: idNumber?.trim() || '',
      occupation: occupation?.trim() || '',
      onboardingCompleted: true,
      lastUpdated: new Date().toISOString()
    },
    
    // Medical history and current condition
    medicalInfo: {
      reasonForConsultation: reasonForConsultation?.trim() || '',
      allergies: allergies.map(allergy => ({
        name: allergy.name?.trim() || '',
        severity: allergy.severity || '',
        description: allergy.description?.trim() || ''
      })),
      currentMedications: medications.map(med => ({
        name: med.name?.trim() || '',
        dosage: med.dosage?.trim() || '',
        frequency: med.frequency?.trim() || '',
        startDate: med.startDate || null
      })),
      pastMedicalHistory: pastMedicalHistory.map(condition => ({
        condition: condition.condition?.trim() || '',
        date: condition.date || null,
        status: condition.status || '',
        notes: condition.notes?.trim() || ''
      }))
    },
    
    // Current symptoms and pain assessment
    symptoms: {
      hasPain: Boolean(hasPain),
      painIntensity: hasPain ? parseInt(painIntensity) || null : null,
      painLocations: painLocations.filter(location => location.trim()),
      symptomDuration: symptomDuration || '',
      associatedSymptoms: associatedSymptoms.filter(symptom => symptom.trim()),
      painTriggers: painTriggers?.trim() || '',
      painRelief: painRelief?.trim() || ''
    },
    
    // Family and lifestyle context
    context: {
      familyMedicalHistory: familyMedicalHistory.map(history => ({
        relationship: history.relationship?.trim() || '',
        condition: history.condition?.trim() || '',
        ageOfOnset: history.ageOfOnset || null,
        notes: history.notes?.trim() || ''
      })),
      lifestyle: {
        smokingStatus: smokingStatus || '',
        packYears: smokingStatus === 'current' ? parseInt(packYears) || null : null,
        alcoholConsumption: alcoholConsumption || '',
        alcoholUnits: alcoholConsumption === 'regular' ? parseInt(alcoholUnits) || null : null,
        exerciseFrequency: exerciseFrequency || ''
      },
      emergencyContact: {
        name: emergencyContact?.name?.trim() || '',
        relationship: emergencyContact?.relationship?.trim() || '',
        phone: emergencyContact?.phone?.trim() || ''
      },
      insurance: {
        provider: insurance?.provider?.trim() || '',
        policyNumber: insurance?.policyNumber?.trim() || '',
        groupNumber: insurance?.groupNumber?.trim() || ''
      }
    },
    
    // Metadata
    metadata: {
      onboardingCompleted: true,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    }
  };
};

/**
 * Get summary of patient profile for quick reference
 * @param {Object} patientProfile - Transformed patient profile
 * @returns {Object} Summary object for display
 */
export const getPatientSummary = (patientProfile) => {
  const { personalInfo, medicalInfo, symptoms, context } = patientProfile;
  
  return {
    name: personalInfo.fullName,
    age: personalInfo.age,
    sex: personalInfo.sex,
    chiefComplaint: medicalInfo.reasonForConsultation?.substring(0, 100) + '...' || 'Not specified',
    hasPain: symptoms.hasPain,
    painIntensity: symptoms.painIntensity,
    currentMedications: medicalInfo.currentMedications.length,
    allergies: medicalInfo.allergies.length,
    emergencyContact: context.emergencyContact.name,
    insurance: context.insurance.provider,
    lastUpdated: new Date(personalInfo.lastUpdated).toLocaleDateString()
  };
};

/**
 * Validate patient profile completeness
 * @param {Object} patientProfile - Patient profile to validate
 * @returns {Object} Validation result with missing fields
 */
export const validatePatientProfile = (patientProfile) => {
  const missingFields = [];
  const warnings = [];
  
  // Check required personal info
  if (!patientProfile.personalInfo.fullName) missingFields.push('Full Name');
  if (!patientProfile.personalInfo.age) missingFields.push('Age');
  if (!patientProfile.personalInfo.sex) missingFields.push('Sex/Gender');
  if (!patientProfile.personalInfo.idNumber) missingFields.push('ID Number');
  
  // Check medical info
  if (!patientProfile.medicalInfo.reasonForConsultation) missingFields.push('Reason for Consultation');
  
  // Check emergency contact
  if (!patientProfile.context.emergencyContact.name) missingFields.push('Emergency Contact Name');
  if (!patientProfile.context.emergencyContact.phone) missingFields.push('Emergency Contact Phone');
  
  // Check insurance
  if (!patientProfile.context.insurance.provider) missingFields.push('Insurance Provider');
  if (!patientProfile.context.insurance.policyNumber) missingFields.push('Policy Number');
  
  // Warnings for incomplete sections
  if (patientProfile.medicalInfo.allergies.length === 0) {
    warnings.push('No allergies recorded');
  }
  if (patientProfile.medicalInfo.currentMedications.length === 0) {
    warnings.push('No current medications recorded');
  }
  if (patientProfile.context.familyMedicalHistory.length === 0) {
    warnings.push('No family medical history recorded');
  }
  
  return {
    isComplete: missingFields.length === 0,
    missingFields,
    warnings,
    completeness: calculateCompletenessScore(patientProfile)
  };
};

/**
 * Calculate completeness score for patient profile
 * @param {Object} patientProfile - Patient profile
 * @returns {number} Completeness score (0-100)
 */
const calculateCompletenessScore = (patientProfile) => {
  let score = 0;
  let totalChecks = 0;
  
  // Personal info (25 points)
  totalChecks += 5;
  if (patientProfile.personalInfo.fullName) score++;
  if (patientProfile.personalInfo.age) score++;
  if (patientProfile.personalInfo.sex) score++;
  if (patientProfile.personalInfo.idNumber) score++;
  if (patientProfile.personalInfo.occupation) score++;
  
  // Medical info (25 points)
  totalChecks += 5;
  if (patientProfile.medicalInfo.reasonForConsultation) score++;
  if (patientProfile.medicalInfo.allergies.length >= 0) score++;
  if (patientProfile.medicalInfo.currentMedications.length >= 0) score++;
  if (patientProfile.medicalInfo.pastMedicalHistory.length >= 0) score++;
  if (patientProfile.symptoms.symptomDuration) score++;
  
  // Symptoms (25 points)
  totalChecks += 5;
  if (patientProfile.symptoms.hasPain !== null) score++;
  if (patientProfile.symptoms.painLocations.length >= 0) score++;
  if (patientProfile.symptoms.associatedSymptoms.length >= 0) score++;
  if (patientProfile.symptoms.painTriggers) score++;
  if (patientProfile.symptoms.painRelief) score++;
  
  // Context (25 points)
  totalChecks += 5;
  if (patientProfile.context.emergencyContact.name) score++;
  if (patientProfile.context.emergencyContact.phone) score++;
  if (patientProfile.context.insurance.provider) score++;
  if (patientProfile.context.insurance.policyNumber) score++;
  if (patientProfile.context.insurance.groupNumber) score++;
  
  return Math.round((score / totalChecks) * 100);
};

/**
 * Export patient profile for external use (JSON format)
 * @param {Object} patientProfile - Patient profile
 * @returns {string} JSON string of patient profile
 */
export const exportPatientProfile = (patientProfile) => {
  const exportData = {
    ...patientProfile,
    metadata: {
      ...patientProfile.metadata,
      exportedAt: new Date().toISOString(),
      exportedBy: 'iDoctor Patient Onboarding System'
    }
  };
  
  return JSON.stringify(exportData, null, 2);
};

/**
 * Get risk factors from patient profile
 * @param {Object} patientProfile - Patient profile
 * @returns {Array} Array of identified risk factors
 */
export const getRiskFactors = (patientProfile) => {
  const riskFactors = [];
  
  // Age-related risks
  if (patientProfile.personalInfo.age && patientProfile.personalInfo.age >= 65) {
    riskFactors.push({
      type: 'age',
      severity: 'moderate',
      description: 'Advanced age (65+) may increase risk for various conditions'
    });
  }
  
  // Lifestyle risks
  if (patientProfile.context.lifestyle.smokingStatus === 'current') {
    riskFactors.push({
      type: 'smoking',
      severity: 'high',
      description: 'Current smoking increases risk for cardiovascular and respiratory diseases'
    });
  }
  
  if (patientProfile.context.lifestyle.alcoholConsumption === 'regular') {
    riskFactors.push({
      type: 'alcohol',
      severity: 'moderate',
      description: 'Regular alcohol consumption may affect liver and cardiovascular health'
    });
  }
  
  if (patientProfile.context.lifestyle.exerciseFrequency === 'never') {
    riskFactors.push({
      type: 'inactivity',
      severity: 'moderate',
      description: 'Sedentary lifestyle increases risk for various health conditions'
    });
  }
  
  // Pain-related risks
  if (patientProfile.symptoms.hasPain && patientProfile.symptoms.painIntensity >= 7) {
    riskFactors.push({
      type: 'pain',
      severity: 'high',
      description: 'Severe pain intensity may indicate serious underlying condition'
    });
  }
  
  // Family history risks
  patientProfile.context.familyMedicalHistory.forEach(history => {
    if (history.condition.toLowerCase().includes('cancer') ||
        history.condition.toLowerCase().includes('heart') ||
        history.condition.toLowerCase().includes('stroke')) {
      riskFactors.push({
        type: 'family_history',
        severity: 'moderate',
        description: `Family history of ${history.condition} may increase risk`
      });
    }
  });
  
  return riskFactors;
};