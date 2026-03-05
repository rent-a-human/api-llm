import React, { useState, useEffect } from 'react';
import { usePatientOnboarding } from '../contexts/PatientOnboardingContext';
import { useUser } from '../contexts/UserContext';
import { transformToPatientProfile } from '../utils/dataTransform';
import { validateStep } from '../utils/validation';

// Step components
import PersonalInfoStep from './onboarding/PersonalInfoStep';
import MedicalInfoStep from './onboarding/MedicalInfoStep';
import SymptomsStep from './onboarding/SymptomsStep';
import AdditionalContextStep from './onboarding/AdditionalContextStep';
import ProgressIndicator from './ProgressIndicator';

const PatientOnboarding = ({ onComplete }) => {
  const { state, actions } = usePatientOnboarding();
  const { userType } = useUser();
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState(null);

  // Step configuration
  const steps = [
    {
      id: 1,
      title: 'Personal Info',
      description: 'Basic information',
      component: PersonalInfoStep
    },
    {
      id: 2,
      title: 'Medical Info',
      description: 'Health history',
      component: MedicalInfoStep
    },
    {
      id: 3,
      title: 'Symptoms',
      description: 'Current symptoms',
      component: SymptomsStep
    },
    {
      id: 4,
      title: 'Additional Context',
      description: 'Lifestyle & contacts',
      component: AdditionalContextStep
    }
  ];

  // Safe access to state with fallback values
  const currentStep = state?.currentStep || 1;
  const totalSteps = state?.totalSteps || 4;
  const isSaving = state?.isSaving || false;
  const lastSaved = state?.lastSaved || null;

  // Get current step configuration with safe access
  const currentStepConfig = steps[currentStep - 1];
  const CurrentStepComponent = currentStepConfig?.component;

  // Auto-save current step data when user navigates
  useEffect(() => {
    if (state && currentStep > 1) {
      actions.saveNow();
    }
  }, [currentStep, state]);

  // Handle step navigation with validation
  const handleNextStep = () => {
    if (!state) return;
    
    const currentStepData = getCurrentStepData();
    const validation = validateStep(currentStep, currentStepData);
    
    if (!validation.isValid) {
      actions.setErrors(validation.errors);
      return;
    }

    if (currentStep < totalSteps) {
      actions.nextStep();
    } else {
      // Last step - complete onboarding
      handleCompleteOnboarding();
    }
  };

  const handlePreviousStep = () => {
    if (!state || currentStep <= 1) return;
    actions.previousStep();
  };

  const handleStepClick = (stepNumber) => {
    if (!state) return;
    
    if (stepNumber < currentStep || actions.isStepValid(stepNumber)) {
      actions.goToStep(stepNumber);
    }
  };

  // Get current step data for validation
  const getCurrentStepData = () => {
    if (!state) return {};
    
    const {
      // Personal Info
      fullName, age, sex, idNumber, occupation,
      // Medical Info
      reasonForConsultation, allergies, medications, pastMedicalHistory,
      // Symptoms
      hasPain, painIntensity, painLocations, symptomDuration, associatedSymptoms, painTriggers, painRelief,
      // Additional Context
      familyMedicalHistory, smokingStatus, packYears, alcoholConsumption, alcoholUnits, exerciseFrequency,
      emergencyContact, insurance
    } = state;

    return {
      fullName, age, sex, idNumber, occupation,
      reasonForConsultation, allergies, medications, pastMedicalHistory,
      hasPain, painIntensity, painLocations, symptomDuration, associatedSymptoms, painTriggers, painRelief,
      familyMedicalHistory, smokingStatus, packYears, alcoholConsumption, alcoholUnits, exerciseFrequency,
      emergencyContact, insurance
    };
  };

  // Handle onboarding completion
  const handleCompleteOnboarding = async () => {
    if (!state) return;
    
    setIsCompleting(true);
    setCompletionError(null);

    try {
      // Validate all steps before completion
      const allValid = steps.every((_, stepIndex) => {
        const stepNumber = stepIndex + 1;
        const stepData = getCurrentStepData();
        const validation = validateStep(stepNumber, stepData);
        return validation.isValid;
      });

      if (!allValid) {
        setCompletionError('Please complete all required fields before finishing.');
        setIsCompleting(false);
        return;
      }

      // Transform data for storage
      const patientProfile = transformToPatientProfile(state);
      
      // Save to localStorage for persistence
      localStorage.setItem('idoctor-patient-profile', JSON.stringify(patientProfile));
      localStorage.setItem('idoctor-patient-onboarding-completed', 'true');
      
      // Complete onboarding
      actions.completeOnboarding();
      
      // Notify parent component
      if (onComplete) {
        onComplete(patientProfile);
      }

    } catch (error) {
      console.error('Error completing onboarding:', error);
      setCompletionError('An error occurred while saving your information. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  // Handle save and exit
  const handleSaveAndExit = () => {
    if (state) {
      actions.saveNow();
    }
    if (onComplete) {
      onComplete(null, { saveOnly: true });
    }
  };

  // Show loading state while context is initializing
  if (!state) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-green mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Onboarding</h3>
          <p className="text-gray-600">Please wait while we initialize the form...</p>
        </div>
      </div>
    );
  }

  // Render loading state during completion
  if (isCompleting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-green mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Completing Onboarding</h3>
          <p className="text-gray-600">Please wait while we save your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-medical-green rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-lg font-bold">iD</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Patient Onboarding</h1>
                <p className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Save indicator */}
              <div className="flex items-center text-sm text-gray-500">
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-medical-green mr-2"></div>
                    Saving...
                  </>
                ) : lastSaved ? (
                  <>
                    <svg className="w-3 h-3 text-medical-green mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Saved
                  </>
                ) : (
                  'Not saved'
                )}
              </div>
              
              {/* Save and Exit button */}
              <button
                onClick={handleSaveAndExit}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100"
              >
                Save & Exit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Progress Indicator Sidebar */}
          <div className="lg:col-span-1">
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
              completedSteps={Array.from({ length: currentStep - 1 }, (_, i) => i + 1)}
              onStepClick={handleStepClick}
              steps={steps}
            />
          </div>

          {/* Form Content */}
          <div className="lg:col-span-3">
            {/* Error Display */}
            {completionError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{completionError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentStepConfig?.title || 'Unknown Step'}
                </h2>
                <p className="text-gray-600">
                  {currentStepConfig?.description || 'Please complete this section'}
                </p>
              </div>

              {/* Render current step component */}
              {CurrentStepComponent && (
                <CurrentStepComponent
                  data={state}
                  onUpdate={(stepData) => {
                    // Update the appropriate state based on current step
                    switch (currentStep) {
                      case 1:
                        actions.setPersonalInfo(stepData);
                        break;
                      case 2:
                        actions.setMedicalInfo(stepData);
                        break;
                      case 3:
                        actions.setSymptoms(stepData);
                        break;
                      case 4:
                        actions.setContext(stepData);
                        break;
                      default:
                        break;
                    }
                  }}
                  errors={state.errors || {}}
                  onNext={handleNextStep}
                  onPrevious={handlePreviousStep}
                  isFirstStep={currentStep === 1}
                  isLastStep={currentStep === totalSteps}
                  isCompleting={isCompleting}
                />
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1 || isCompleting}
                  className={`px-6 py-2 rounded-md font-medium ${
                    currentStep === 1 || isCompleting
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>

                <button
                  onClick={handleNextStep}
                  disabled={isCompleting}
                  className={`px-6 py-2 rounded-md font-medium ${
                    isCompleting
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-medical-green text-white hover:bg-green-600'
                  }`}
                >
                  {currentStep === totalSteps ? 'Complete Onboarding' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientOnboarding;