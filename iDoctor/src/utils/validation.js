// Form validation utilities for patient onboarding

export const validatePersonalInfo = (data) => {
  const errors = {};

  // Full name validation
  if (!data.fullName || data.fullName.trim().length === 0) {
    errors.fullName = 'Full name is required';
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters long';
  } else if (data.fullName.trim().length > 100) {
    errors.fullName = 'Full name must be less than 100 characters';
  }

  // Age validation
  if (!data.age || data.age === '') {
    errors.age = 'Age is required';
  } else {
    const ageNum = parseInt(data.age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      errors.age = 'Age must be between 0 and 150';
    }
  }

  // Sex/gender validation
  if (!data.sex || data.sex === '') {
    errors.sex = 'Please select your sex/gender';
  }

  // ID/identification number validation
  if (!data.idNumber || data.idNumber.trim().length === 0) {
    errors.idNumber = 'ID/identification number is required';
  } else if (!/^[A-Za-z0-9\-_]+$/.test(data.idNumber.trim())) {
    errors.idNumber = 'ID can only contain letters, numbers, hyphens, and underscores';
  } else if (data.idNumber.trim().length < 5) {
    errors.idNumber = 'ID must be at least 5 characters long';
  }

  // Occupation is optional, but let's validate format if provided
  if (data.occupation && data.occupation.trim().length > 100) {
    errors.occupation = 'Occupation must be less than 100 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateMedicalInfo = (data) => {
  const errors = {};

  // Reason for consultation validation
  if (!data.reasonForConsultation || data.reasonForConsultation.trim().length === 0) {
    errors.reasonForConsultation = 'Reason for consultation is required';
  } else if (data.reasonForConsultation.trim().length < 10) {
    errors.reasonForConsultation = 'Please provide more detail (at least 10 characters)';
  }

  // Validate dynamic lists format
  if (data.allergies && !Array.isArray(data.allergies)) {
    errors.allergies = 'Invalid allergies format';
  }

  if (data.medications && !Array.isArray(data.medications)) {
    errors.medications = 'Invalid medications format';
  }

  if (data.pastMedicalHistory && !Array.isArray(data.pastMedicalHistory)) {
    errors.pastMedicalHistory = 'Invalid medical history format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateSymptoms = (data) => {
  const errors = {};

  // Pain assessment validation
  if (data.hasPain === undefined || data.hasPain === null) {
    errors.hasPain = 'Please indicate if you are experiencing pain';
  }

  // Pain intensity validation (conditional)
  if (data.hasPain === true) {
    if (!data.painIntensity || data.painIntensity === '') {
      errors.painIntensity = 'Please rate your pain intensity';
    } else {
      const intensity = parseInt(data.painIntensity);
      if (isNaN(intensity) || intensity < 1 || intensity > 10) {
        errors.painIntensity = 'Pain intensity must be between 1 and 10';
      }
    }
  }

  // Pain location validation (conditional)
  if (data.hasPain === true && (!data.painLocations || data.painLocations.length === 0)) {
    errors.painLocations = 'Please select where you are experiencing pain';
  }

  // Symptom duration validation
  if (!data.symptomDuration || data.symptomDuration === '') {
    errors.symptomDuration = 'Please select how long you have been experiencing symptoms';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateAdditionalContext = (data) => {
  const errors = {};

  // Emergency contact validation
  if (!data.emergencyContact || !data.emergencyContact.name || data.emergencyContact.name.trim().length === 0) {
    errors.emergencyContactName = 'Emergency contact name is required';
  } else if (data.emergencyContact.name.trim().length < 2) {
    errors.emergencyContactName = 'Emergency contact name must be at least 2 characters';
  }

  if (!data.emergencyContact || !data.emergencyContact.phone || data.emergencyContact.phone.trim().length === 0) {
    errors.emergencyContactPhone = 'Emergency contact phone is required';
  } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(data.emergencyContact.phone.replace(/[\s\-\(\)]/g, ''))) {
    errors.emergencyContactPhone = 'Please enter a valid phone number';
  }

  // Insurance validation (all required)
  if (!data.insurance || !data.insurance.provider || data.insurance.provider.trim().length === 0) {
    errors.insuranceProvider = 'Insurance provider is required';
  }

  if (!data.insurance || !data.insurance.policyNumber || data.insurance.policyNumber.trim().length === 0) {
    errors.insurancePolicy = 'Policy number is required';
  }

  if (!data.insurance || !data.insurance.groupNumber || data.insurance.groupNumber.trim().length === 0) {
    errors.insuranceGroup = 'Group number is required';
  }

  // Family medical history format validation
  if (data.familyMedicalHistory && !Array.isArray(data.familyMedicalHistory)) {
    errors.familyMedicalHistory = 'Invalid family medical history format';
  }

  // Lifestyle validation
  if (data.smokingStatus === 'current' && (!data.packYears || data.packYears === '')) {
    errors.packYears = 'Pack-years is required for current smokers';
  }

  if (data.alcoholConsumption === 'regular' && (!data.alcoholUnits || data.alcoholUnits === '')) {
    errors.alcoholUnits = 'Alcohol units is required for regular drinkers';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateStep = (stepNumber, data) => {
  switch (stepNumber) {
    case 1:
      return validatePersonalInfo(data);
    case 2:
      return validateMedicalInfo(data);
    case 3:
      return validateSymptoms(data);
    case 4:
      return validateAdditionalContext(data);
    default:
      return { isValid: true, errors: {} };
  }
};

// Real-time validation for individual fields
export const validateField = (name, value, context = {}) => {
  switch (name) {
    case 'fullName':
      if (!value || value.trim().length === 0) return 'Full name is required';
      if (value.trim().length < 2) return 'Must be at least 2 characters';
      if (value.trim().length > 100) return 'Must be less than 100 characters';
      break;

    case 'age':
      if (!value || value === '') return 'Age is required';
      const ageNum = parseInt(value);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) return 'Age must be 0-150';
      break;

    case 'sex':
      if (!value || value === '') return 'Please select an option';
      break;

    case 'idNumber':
      if (!value || value.trim().length === 0) return 'ID number is required';
      if (!/^[A-Za-z0-9\-_]+$/.test(value)) return 'Only letters, numbers, hyphens, underscores allowed';
      if (value.trim().length < 5) return 'Must be at least 5 characters';
      break;

    case 'emergencyContactPhone':
      if (!value || value.trim().length === 0) return 'Phone number is required';
      if (!/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) return 'Invalid phone number';
      break;

    case 'reasonForConsultation':
      if (!value || value.trim().length === 0) return 'Reason for consultation is required';
      if (value.trim().length < 10) return 'Please provide more detail (at least 10 characters)';
      break;

    default:
      return null;
  }
  return null;
};