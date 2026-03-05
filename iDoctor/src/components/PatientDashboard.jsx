import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const PatientDashboard = () => {
  const { resetUserType } = useUser();
  
  // Mock data for patient view
  const upcomingAppointments = [
    {
      id: 1,
      doctorName: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      time: '10:00 AM',
      reason: 'Regular Checkup',
      status: 'Scheduled'
    },
    {
      id: 2,
      doctorName: 'Dr. Michael Chen',
      specialty: 'Neurology',
      time: '2:00 PM',
      reason: 'Follow-up Consultation',
      status: 'Scheduled'
    }
  ];

  const recentDoctors = [
    {
      id: 1,
      name: 'Sarah Johnson',
      specialty: 'Cardiology',
      experience: '15 years',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Michael Chen',
      specialty: 'Neurology',
      experience: '12 years',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      specialty: 'Pediatrics',
      experience: '10 years',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1594824797743-78e9e60b0d7a?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'David Kim',
      specialty: 'Orthopedics',
      experience: '18 years',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const patientStats = {
    upcomingAppointments: upcomingAppointments.length,
    totalDoctors: recentDoctors.length,
    healthRecords: 8,
    completedAppointments: 12
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
                className="inline-flex items-center px-1 pt-1 border-b-2 border-medical-green text-sm font-medium text-medical-green"
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
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <span className="mr-2">📋</span>
                Medical Records
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Patient Portal</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Welcome to Your Health Portal</h1>
            <p className="mt-2 text-gray-600">
              Manage your appointments, health records, and connect with doctors.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-3xl font-bold text-medical-green">{patientStats.upcomingAppointments}</div>
              <div className="text-sm text-gray-600 mt-1">Upcoming Appointments</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-2">👨‍⚕️</div>
              <div className="text-3xl font-bold text-medical-blue">{patientStats.totalDoctors}</div>
              <div className="text-sm text-gray-600 mt-1">Available Doctors</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-2">📋</div>
              <div className="text-3xl font-bold text-purple-600">{patientStats.healthRecords}</div>
              <div className="text-sm text-gray-600 mt-1">Health Records</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-3xl font-bold text-orange-600">{patientStats.completedAppointments}</div>
              <div className="text-sm text-gray-600 mt-1">Completed Visits</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
                <Link to="/patient/appointments" className="text-medical-green hover:underline text-sm">
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-gray-500">No upcoming appointments</p>
                    <Link to="/patient/doctors" className="mt-4 inline-block medical-button">
                      Book Appointment
                    </Link>
                  </div>
                ) : (
                  upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.doctorName}</p>
                        <p className="text-sm text-gray-600">{appointment.specialty}</p>
                        <p className="text-sm text-gray-600">Reason: {appointment.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Find Doctors */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Find Specialists</h3>
                <Link to="/patient/doctors" className="text-medical-green hover:underline text-sm">
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {recentDoctors.slice(0, 3).map((doctor) => (
                  <div key={doctor.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200 cursor-pointer">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Dr. {doctor.name}</p>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                      <p className="text-sm text-gray-600">{doctor.experience} • ⭐ {doctor.rating}</p>
                    </div>
                    <Link to="/patient/doctors" className="text-sm medical-button">
                      Book
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to="/patient/doctors" className="p-4 bg-medical-green text-white rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center space-x-2">
                <span>📅</span>
                <span>Book Appointment</span>
              </Link>
              <button className="p-4 bg-medical-blue text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center space-x-2">
                <span>💊</span>
                <span>Prescriptions</span>
              </button>
              <Link to="/patient/medical-records" className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-700 transition duration-200 flex items-center justify-center space-x-2">
                <span>📊</span>
                <span>Health Stats</span>
              </Link>
              <button className="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-700 transition duration-200 flex items-center justify-center space-x-2">
                <span>💬</span>
                <span>Message Doctor</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;