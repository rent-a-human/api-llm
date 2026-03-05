import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import PatientOnboarding from './PatientOnboarding';
import { PatientOnboardingProvider } from '../contexts/PatientOnboardingContext';

/**
 * Patient Onboarding Trigger Component
 * 
 * This component handles the logic for determining when to show the patient onboarding flow.
 * It checks if a patient needs to complete onboarding after selecting their role.
 */
const PatientOnboardingTrigger = ({ children }) => {
  const { userType, handleUserTypeSelection } = useUser();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (userType === 'patient') {
      // Check if patient has completed onboarding
      const hasCompletedOnboarding = localStorage.getItem('idoctor-patient-onboarding-completed');
      const patientProfile = localStorage.getItem('idoctor-patient-profile');
      
      if (!hasCompletedOnboarding || !patientProfile) {
        // Patient needs to complete onboarding
        setShowOnboarding(true);
      } else {
        // Patient has already completed onboarding, show dashboard
        setShowOnboarding(false);
      }
    }
    
    setIsCheckingOnboarding(false);
  }, [userType]);

  // Handle onboarding completion
  const handleOnboardingComplete = (profile, options = {}) => {
    if (options.saveOnly) {
      // Just save progress, don't complete onboarding
      return;
    }

    // Mark onboarding as completed
    localStorage.setItem('idoctor-patient-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  // Show loading state while checking onboarding status
  if (isCheckingOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-green mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Patient Portal</h3>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if required
  if (userType === 'patient' && showOnboarding) {
    return (
      <PatientOnboardingProvider>
        <PatientOnboarding 
          onComplete={handleOnboardingComplete}
        />
      </PatientOnboardingProvider>
    );
  }

  // Show regular patient app
  return <>{children}</>;
};

export default PatientOnboardingTrigger;