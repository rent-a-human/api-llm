import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PatientOnboarding from './PatientOnboarding';
import { PatientOnboardingProvider } from '../contexts/PatientOnboardingContext';
import PatientDashboard from './PatientDashboard';
import PatientDoctors from './PatientDoctors';
import PatientAppointments from './PatientAppointments';
import PatientMedicalRecords from './PatientMedicalRecords';

/**
 * Patient App Component
 * 
 * This component handles routing and onboarding for the patient portal.
 * It shows the onboarding flow for new patients and regular patient app for existing ones.
 */
const PatientAppRoutes = () => {
  // Check if patient needs onboarding
  const needsOnboarding = () => {
    const hasCompletedOnboarding = localStorage.getItem('idoctor-patient-onboarding-completed');
    const patientProfile = localStorage.getItem('idoctor-patient-profile');
    return !hasCompletedOnboarding || !patientProfile;
  };

  // Show onboarding if needed
  if (needsOnboarding()) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PatientOnboardingProvider>
          <PatientOnboarding 
            onComplete={(profile) => {
              localStorage.setItem('idoctor-patient-onboarding-completed', 'true');
              localStorage.setItem('idoctor-patient-profile', JSON.stringify(profile));
              // Force reload to show patient app
              window.location.reload();
            }}
          />
        </PatientOnboardingProvider>
      </div>
    );
  }

  // Show regular patient app with navigation
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Patient Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-medical-green">iDoctor</span>
                <span className="ml-2 text-sm text-gray-500">Patient Portal</span>
              </div>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <a
                href="/patient/dashboard"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-medical-green text-sm font-medium text-medical-green"
              >
                <span className="mr-2">📊</span>
                Dashboard
              </a>
              <a
                href="/patient/doctors"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <span className="mr-2">👨‍⚕️</span>
                Find Doctors
              </a>
              <a
                href="/patient/appointments"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <span className="mr-2">📅</span>
                My Appointments
              </a>
              <a
                href="/patient/medical-records"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <span className="mr-2">📋</span>
                Medical Records
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Patient Portal</span>
              <button
                onClick={() => {
                  localStorage.removeItem('idoctor-patient-onboarding-completed');
                  localStorage.removeItem('idoctor-patient-profile');
                  localStorage.removeItem('idoctor-patient-onboarding');
                  window.location.reload();
                }}
                className="text-sm text-medical-blue hover:underline"
              >
                Restart Onboarding
              </button>
              <div className="w-8 h-8 bg-medical-green rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">P</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/patient/dashboard" replace />} />
          <Route path="/dashboard" element={<PatientDashboard />} />
          <Route path="/doctors" element={<PatientDoctors />} />
          <Route path="/appointments" element={<PatientAppointments />} />
          <Route path="/medical-records" element={<PatientMedicalRecords />} />
        </Routes>
      </main>
    </div>
  );
};

export default PatientAppRoutes;