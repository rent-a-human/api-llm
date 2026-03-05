import React from 'react';

const PatientLayout = ({ children, onResetUserType }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom patient navigation would go here */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-medical-green">iDoctor</span>
                <span className="ml-2 text-sm text-gray-500">Patient Portal</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Patient Portal</span>
              <button
                onClick={onResetUserType}
                className="text-sm text-medical-blue hover:underline"
              >
                Switch Role
              </button>
              <div className="w-8 h-8 bg-medical-green rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">P</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default PatientLayout;