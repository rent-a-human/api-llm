import React from 'react';
import { useUser } from '../contexts/UserContext';

const OnboardingModal = () => {
  const { handleUserTypeSelection } = useUser();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
        {/* Header */}
        <div className="bg-medical-blue text-white p-6 rounded-t-lg">
          <div className="text-center">
            <div className="text-4xl mb-2">🏥</div>
            <h2 className="text-2xl font-bold">Welcome to iDoctor</h2>
            <p className="text-blue-100 mt-2">Your Medical Management Platform</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How would you like to use iDoctor?
            </h3>
            <p className="text-gray-600 text-sm">
              Please select your role to personalize your experience
            </p>
          </div>

          {/* User Type Selection */}
          <div className="space-y-4">
            {/* Patient Option */}
            <button
              onClick={() => handleUserTypeSelection('patient')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-medical-green hover:bg-green-50 transition duration-200 group"
            >
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 bg-medical-green rounded-full flex items-center justify-center group-hover:scale-110 transition duration-200">
                  <span className="text-white text-2xl">👤</span>
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-medical-green">
                    I'm a Patient
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Book appointments, view medical records, and manage my health
                  </p>
                </div>
              </div>
            </button>

            {/* Doctor Option */}
            <button
              onClick={() => handleUserTypeSelection('doctor')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-medical-blue hover:bg-blue-50 transition duration-200 group"
            >
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 bg-medical-blue rounded-full flex items-center justify-center group-hover:scale-110 transition duration-200">
                  <span className="text-white text-2xl">👨‍⚕️</span>
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-medical-blue">
                    I'm a Doctor
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Manage patients, appointments, and medical practice
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              You can change this selection later in settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;