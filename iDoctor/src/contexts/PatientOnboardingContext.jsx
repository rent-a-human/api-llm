import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state for patient onboarding
const initialOnboardingState = {
  // Personal Information
  fullName: '',
  age: '',
  sex: '',
  idNumber: '',
  occupation: '',

  // Medical Information
  reasonForConsultation: '',
  allergies: [],
  medications: [],
  pastMedicalHistory: [],

  // Symptoms
  hasPain: null,
  painIntensity: '',
  painLocations: [],
  symptomDuration: '',
  associatedSymptoms: [],
  painTriggers: '',
  painRelief: '',

  // Additional Context
  familyMedicalHistory: [],
  smokingStatus: '',
  packYears: '',
  alcoholConsumption: '',
  alcoholUnits: '',
  exerciseFrequency: '',
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  },
  insurance: {
    provider: '',
    policyNumber: '',
    groupNumber: ''
  },

  // State management
  currentStep: 1,
  totalSteps: 4,
  isCompleted: false,
  isSaving: false,
  lastSaved: null,
  errors: {},
  warnings: []
};

// Action types
const ACTION_TYPES = {
  // Personal Info
  SET_PERSONAL_INFO: 'SET_PERSONAL_INFO',

  // Medical Info
  SET_MEDICAL_INFO: 'SET_MEDICAL_INFO',
  ADD_ALLERGY: 'ADD_ALLERGY',
  REMOVE_ALLERGY: 'REMOVE_ALLERGY',
  UPDATE_ALLERGY: 'UPDATE_ALLERGY',
  ADD_MEDICATION: 'ADD_MEDICATION',
  REMOVE_MEDICATION: 'REMOVE_MEDICATION',
  UPDATE_MEDICATION: 'UPDATE_MEDICATION',
  ADD_PAST_CONDITION: 'ADD_PAST_CONDITION',
  REMOVE_PAST_CONDITION: 'REMOVE_PAST_CONDITION',
  UPDATE_PAST_CONDITION: 'UPDATE_PAST_CONDITION',

  // Symptoms
  SET_SYMPTOMS: 'SET_SYMPTOMS',
  TOGGLE_PAIN_LOCATION: 'TOGGLE_PAIN_LOCATION',
  TOGGLE_ASSOCIATED_SYMPTOM: 'TOGGLE_ASSOCIATED_SYMPTOM',

  // Additional Context
  SET_CONTEXT: 'SET_CONTEXT',
  ADD_FAMILY_HISTORY: 'ADD_FAMILY_HISTORY',
  REMOVE_FAMILY_HISTORY: 'REMOVE_FAMILY_HISTORY',
  UPDATE_FAMILY_HISTORY: 'UPDATE_FAMILY_HISTORY',

  // Navigation
  NEXT_STEP: 'NEXT_STEP',
  PREVIOUS_STEP: 'PREVIOUS_STEP',
  GO_TO_STEP: 'GO_TO_STEP',
  COMPLETE_ONBOARDING: 'COMPLETE_ONBOARDING',

  // State management
  SET_ERRORS: 'SET_ERRORS',
  SET_WARNINGS: 'SET_WARNINGS',
  SET_SAVING: 'SET_SAVING',
  SET_LAST_SAVED: 'SET_LAST_SAVED',
  LOAD_SAVED_DATA: 'LOAD_SAVED_DATA',
  RESET_ONBOARDING: 'RESET_ONBOARDING'
};

// Reducer function
const onboardingReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_PERSONAL_INFO:
      return {
        ...state,
        ...action.payload
      };

    case ACTION_TYPES.SET_MEDICAL_INFO:
      return {
        ...state,
        ...action.payload
      };

    case ACTION_TYPES.ADD_ALLERGY:
      return {
        ...state,
        allergies: [...state.allergies, action.payload]
      };

    case ACTION_TYPES.REMOVE_ALLERGY:
      return {
        ...state,
        allergies: state.allergies.filter((_, index) => index !== action.payload)
      };

    case ACTION_TYPES.UPDATE_ALLERGY:
      return {
        ...state,
        allergies: state.allergies.map((allergy, index) =>
          index === action.payload.index ? { ...allergy, ...action.payload.allergy } : allergy
        )
      };

    case ACTION_TYPES.ADD_MEDICATION:
      return {
        ...state,
        medications: [...state.medications, action.payload]
      };

    case ACTION_TYPES.REMOVE_MEDICATION:
      return {
        ...state,
        medications: state.medications.filter((_, index) => index !== action.payload)
      };

    case ACTION_TYPES.UPDATE_MEDICATION:
      return {
        ...state,
        medications: state.medications.map((medication, index) =>
          index === action.payload.index ? { ...medication, ...action.payload.medication } : medication
        )
      };

    case ACTION_TYPES.ADD_PAST_CONDITION:
      return {
        ...state,
        pastMedicalHistory: [...state.pastMedicalHistory, action.payload]
      };

    case ACTION_TYPES.REMOVE_PAST_CONDITION:
      return {
        ...state,
        pastMedicalHistory: state.pastMedicalHistory.filter((_, index) => index !== action.payload)
      };

    case ACTION_TYPES.UPDATE_PAST_CONDITION:
      return {
        ...state,
        pastMedicalHistory: state.pastMedicalHistory.map((condition, index) =>
          index === action.payload.index ? { ...condition, ...action.payload.condition } : condition
        )
      };

    case ACTION_TYPES.SET_SYMPTOMS:
      return {
        ...state,
        ...action.payload
      };

    case ACTION_TYPES.TOGGLE_PAIN_LOCATION:
      const location = action.payload;
      const hasLocation = state.painLocations.includes(location);
      return {
        ...state,
        painLocations: hasLocation
          ? state.painLocations.filter(l => l !== location)
          : [...state.painLocations, location]
      };

    case ACTION_TYPES.TOGGLE_ASSOCIATED_SYMPTOM:
      const symptom = action.payload;
      const hasSymptom = state.associatedSymptoms.includes(symptom);
      return {
        ...state,
        associatedSymptoms: hasSymptom
          ? state.associatedSymptoms.filter(s => s !== symptom)
          : [...state.associatedSymptoms, symptom]
      };

    case ACTION_TYPES.SET_CONTEXT:
      return {
        ...state,
        ...action.payload
      };

    case ACTION_TYPES.ADD_FAMILY_HISTORY:
      return {
        ...state,
        familyMedicalHistory: [...state.familyMedicalHistory, action.payload]
      };

    case ACTION_TYPES.REMOVE_FAMILY_HISTORY:
      return {
        ...state,
        familyMedicalHistory: state.familyMedicalHistory.filter((_, index) => index !== action.payload)
      };

    case ACTION_TYPES.UPDATE_FAMILY_HISTORY:
      return {
        ...state,
        familyMedicalHistory: state.familyMedicalHistory.map((history, index) =>
          index === action.payload.index ? { ...history, ...action.payload.history } : history
        )
      };

    case ACTION_TYPES.NEXT_STEP:
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps)
      };

    case ACTION_TYPES.PREVIOUS_STEP:
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1)
      };

    case ACTION_TYPES.GO_TO_STEP:
      return {
        ...state,
        currentStep: action.payload
      };

    case ACTION_TYPES.COMPLETE_ONBOARDING:
      return {
        ...state,
        isCompleted: true,
        currentStep: state.totalSteps
      };

    case ACTION_TYPES.SET_ERRORS:
      return {
        ...state,
        errors: action.payload
      };

    case ACTION_TYPES.SET_WARNINGS:
      return {
        ...state,
        warnings: action.payload
      };

    case ACTION_TYPES.SET_SAVING:
      return {
        ...state,
        isSaving: action.payload
      };

    case ACTION_TYPES.SET_LAST_SAVED:
      return {
        ...state,
        lastSaved: action.payload
      };

    case ACTION_TYPES.LOAD_SAVED_DATA:
      return {
        ...state,
        ...action.payload,
        lastSaved: new Date().toISOString()
      };

    case ACTION_TYPES.RESET_ONBOARDING:
      return {
        ...initialOnboardingState,
        totalSteps: state.totalSteps
      };

    default:
      return state;
  }
};

// Create context
const PatientOnboardingContext = createContext();

// Custom hook to use the context
export const usePatientOnboarding = () => {
  const context = useContext(PatientOnboardingContext);
  if (!context) {
    throw new Error('usePatientOnboarding must be used within a PatientOnboardingProvider');
  }
  return context;
};

// Provider component
export const PatientOnboardingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(onboardingReducer, initialOnboardingState);

  // Auto-save to localStorage
  useEffect(() => {
    const saveData = () => {
      try {
        dispatch({ type: ACTION_TYPES.SET_SAVING, payload: true });
        localStorage.setItem('idoctor-patient-onboarding', JSON.stringify({
          ...state,
          lastSaved: new Date().toISOString()
        }));
        dispatch({ type: ACTION_TYPES.SET_LAST_SAVED, payload: new Date().toISOString() });
        dispatch({ type: ACTION_TYPES.SET_SAVING, payload: false });
      } catch (error) {
        console.error('Failed to save onboarding data:', error);
        dispatch({ type: ACTION_TYPES.SET_SAVING, payload: false });
      }
    };

    // Auto-save after 3 seconds of inactivity
    const timeoutId = setTimeout(saveData, 3000);
    return () => clearTimeout(timeoutId);
  }, [state]);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('idoctor-patient-onboarding');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: ACTION_TYPES.LOAD_SAVED_DATA, payload: parsedData });
      } catch (error) {
        console.error('Failed to load saved onboarding data:', error);
      }
    }
  }, []);

  // Action creators
  const actions = {
    setPersonalInfo: (data) => dispatch({ type: ACTION_TYPES.SET_PERSONAL_INFO, payload: data }),
    setMedicalInfo: (data) => dispatch({ type: ACTION_TYPES.SET_MEDICAL_INFO, payload: data }),

    // Allergy actions
    addAllergy: (allergy) => dispatch({ type: ACTION_TYPES.ADD_ALLERGY, payload: allergy }),
    removeAllergy: (index) => dispatch({ type: ACTION_TYPES.REMOVE_ALLERGY, payload: index }),
    updateAllergy: (index, allergy) => dispatch({ type: ACTION_TYPES.UPDATE_ALLERGY, payload: { index, allergy } }),

    // Medication actions
    addMedication: (medication) => dispatch({ type: ACTION_TYPES.ADD_MEDICATION, payload: medication }),
    removeMedication: (index) => dispatch({ type: ACTION_TYPES.REMOVE_MEDICATION, payload: index }),
    updateMedication: (index, medication) => dispatch({ type: ACTION_TYPES.UPDATE_MEDICATION, payload: { index, medication } }),

    // Past medical history actions
    addPastCondition: (condition) => dispatch({ type: ACTION_TYPES.ADD_PAST_CONDITION, payload: condition }),
    removePastCondition: (index) => dispatch({ type: ACTION_TYPES.REMOVE_PAST_CONDITION, payload: index }),
    updatePastCondition: (index, condition) => dispatch({ type: ACTION_TYPES.UPDATE_PAST_CONDITION, payload: { index, condition } }),

    // Symptoms actions
    setSymptoms: (data) => dispatch({ type: ACTION_TYPES.SET_SYMPTOMS, payload: data }),
    togglePainLocation: (location) => dispatch({ type: ACTION_TYPES.TOGGLE_PAIN_LOCATION, payload: location }),
    toggleAssociatedSymptom: (symptom) => dispatch({ type: ACTION_TYPES.TOGGLE_ASSOCIATED_SYMPTOM, payload: symptom }),

    // Context actions
    setContext: (data) => dispatch({ type: ACTION_TYPES.SET_CONTEXT, payload: data }),
    addFamilyHistory: (history) => dispatch({ type: ACTION_TYPES.ADD_FAMILY_HISTORY, payload: history }),
    removeFamilyHistory: (index) => dispatch({ type: ACTION_TYPES.REMOVE_FAMILY_HISTORY, payload: index }),
    updateFamilyHistory: (index, history) => dispatch({ type: ACTION_TYPES.UPDATE_FAMILY_HISTORY, payload: { index, history } }),

    // Navigation actions
    nextStep: () => dispatch({ type: ACTION_TYPES.NEXT_STEP }),
    previousStep: () => dispatch({ type: ACTION_TYPES.PREVIOUS_STEP }),
    goToStep: (step) => dispatch({ type: ACTION_TYPES.GO_TO_STEP, payload: step }),
    completeOnboarding: () => dispatch({ type: ACTION_TYPES.COMPLETE_ONBOARDING }),

    // State management actions
    setErrors: (errors) => dispatch({ type: ACTION_TYPES.SET_ERRORS, payload: errors }),
    setWarnings: (warnings) => dispatch({ type: ACTION_TYPES.SET_WARNINGS, payload: warnings }),
    setSaving: (isSaving) => dispatch({ type: ACTION_TYPES.SET_SAVING, payload: isSaving }),
    resetOnboarding: () => dispatch({ type: ACTION_TYPES.RESET_ONBOARDING }),

    // Utility actions
    saveNow: () => {
      try {
        dispatch({ type: ACTION_TYPES.SET_SAVING, payload: true });
        localStorage.setItem('idoctor-patient-onboarding', JSON.stringify({
          ...state,
          lastSaved: new Date().toISOString()
        }));
        dispatch({ type: ACTION_TYPES.SET_LAST_SAVED, payload: new Date().toISOString() });
        dispatch({ type: ACTION_TYPES.SET_SAVING, payload: false });
      } catch (error) {
        console.error('Failed to save onboarding data:', error);
        dispatch({ type: ACTION_TYPES.SET_SAVING, payload: false });
      }
    },

    getProgress: () => {
      const stepProgress = (state.currentStep - 1) / (state.totalSteps - 1) * 100;
      const completionProgress = state.isCompleted ? 100 : stepProgress;
      return Math.round(completionProgress);
    },

    isStepValid: (stepNumber) => {
      // This would typically use validation utilities
      // For now, return true for completed steps
      return stepNumber < state.currentStep || state.isCompleted;
    }
  };

  const value = {
    state,
    actions
  };

  return (
    <PatientOnboardingContext.Provider value={value}>
      {children}
    </PatientOnboardingContext.Provider>
  );
};

export default PatientOnboardingContext;