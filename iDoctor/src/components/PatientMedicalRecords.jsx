import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const PatientMedicalRecords = () => {
  const { resetUserType } = useUser();

  // Mock medical records data
  const medicalRecords = [
    {
      id: 1,
      type: 'Lab Results',
      title: 'Blood Test Results',
      date: '2024-01-10',
      doctor: 'Dr. Sarah Johnson',
      status: 'Normal',
      category: 'Laboratory'
    },
    {
      id: 2,
      type: 'Prescription',
      title: 'Blood Pressure Medication',
      date: '2024-01-08',
      doctor: 'Dr. Sarah Johnson',
      status: 'Active',
      category: 'Medications'
    },
    {
      id: 3,
      type: 'Radiology',
      title: 'Chest X-Ray',
      date: '2024-01-05',
      doctor: 'Dr. David Kim',
      status: 'Reviewed',
      category: 'Imaging'
    },
    {
      id: 4,
      type: 'Consultation Notes',
      title: 'Annual Physical Exam',
      date: '2024-01-01',
      doctor: 'Dr. Emily Rodriguez',
      status: 'Complete',
      category: 'Consultations'
    },
    {
      id: 5,
      type: 'Vaccination',
      title: 'Flu Shot',
      date: '2023-12-15',
      doctor: 'Dr. Emily Rodriguez',
      status: 'Complete',
      category: 'Preventive Care'
    },
    {
      id: 6,
      type: 'Lab Results',
      title: 'Cholesterol Test',
      date: '2023-12-10',
      doctor: 'Dr. Sarah Johnson',
      status: 'Follow-up Required',
      category: 'Laboratory'
    }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-purple-100 text-purple-800';
      case 'complete':
        return 'bg-gray-100 text-gray-800';
      case 'follow-up required':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Laboratory':
        return '🧪';
      case 'Medications':
        return '💊';
      case 'Imaging':
        return '📸';
      case 'Consultations':
        return '📋';
      case 'Preventive Care':
        return '💉';
      default:
        return '📄';
    }
  };

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
              <Link
                to="/patient/dashboard"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <span className="mr-2">📊</span>
                Dashboard
              </Link>
              <Link
                to="/patient/doctors"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <span className="mr-2">👨‍⚕️</span>
                Find Doctors
              </Link>
              <Link
                to="/patient/appointments"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <span className="mr-2">📅</span>
                My Appointments
              </Link>
              <Link
                to="/patient/medical-records"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-medical-green text-sm font-medium text-medical-green"
              >
                <span className="mr-2">📋</span>
                Medical Records
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Medical Records</span>
              <button
                onClick={resetUserType}
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
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Medical Records</h1>
                <p className="mt-2 text-gray-600">
                  Access and manage your complete medical history and health information.
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="medical-button-secondary">
                  📊 Download Report
                </button>
                <button className="medical-button">
                  📤 Share Records
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-2">📋</div>
              <div className="text-2xl font-bold text-medical-green">{medicalRecords.length}</div>
              <div className="text-gray-600 text-sm">Total Records</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-2">💊</div>
              <div className="text-2xl font-bold text-blue-600">2</div>
              <div className="text-gray-600 text-sm">Active Medications</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-2">🧪</div>
              <div className="text-2xl font-bold text-purple-600">2</div>
              <div className="text-gray-600 text-sm">Lab Results</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-2xl font-bold text-orange-600">6</div>
              <div className="text-gray-600 text-sm">Months of Data</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-green">
                  <option>All Categories</option>
                  <option>Laboratory</option>
                  <option>Medications</option>
                  <option>Imaging</option>
                  <option>Consultations</option>
                  <option>Preventive Care</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-green">
                  <option>All Time</option>
                  <option>Last Month</option>
                  <option>Last 3 Months</option>
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-green">
                  <option>All Status</option>
                  <option>Normal</option>
                  <option>Active</option>
                  <option>Reviewed</option>
                  <option>Complete</option>
                  <option>Follow-up Required</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="w-full medical-button">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Medical Records List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Medical Records</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {medicalRecords.map((record) => (
                <div key={record.id} className="p-6 hover:bg-gray-50 transition duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getCategoryIcon(record.category)}</div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{record.title}</h4>
                        <p className="text-gray-600">{record.type} • {record.category}</p>
                        <p className="text-sm text-gray-500">Dr. {record.doctor} • {record.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm border border-medical-green text-medical-green rounded-md hover:bg-medical-green hover:text-white transition duration-200">
                          View
                        </button>
                        <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200">
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 bg-medical-green text-white rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center space-x-2">
                <span>📋</span>
                <span>Request Records</span>
              </button>
              <button className="p-4 bg-medical-blue text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center space-x-2">
                <span>🏥</span>
                <span>Import from Hospital</span>
              </button>
              <button className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-700 transition duration-200 flex items-center justify-center space-x-2">
                <span>📱</span>
                <span>Share with Doctor</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientMedicalRecords;