import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import OnboardingModal from './components/OnboardingModal';
import PatientApp from './components/PatientApp';
import DoctorApp from './components/DoctorApp';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import './index.css';

const AppContent = () => {
  const { userType, showOnboarding, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🏥</div>
          <div className="text-xl font-semibold text-gray-900">iDoctor</div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showOnboarding && <OnboardingModal />}
      {!showOnboarding && (
        <div className="App">
          <Routes>
            {userType === 'doctor' && (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/appointments" element={<Appointments />} />
              </>
            )}
            {userType === 'patient' && (
              <>
                <Route path="/" element={<Navigate to="/patient/dashboard" replace />} />
                <Route path="/patient/*" element={<PatientApp />} />
              </>
            )}
          </Routes>
        </div>
      )}
    </>
  );
};

function App() {
  return (
    <Router>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </Router>
  );
}

export default App;