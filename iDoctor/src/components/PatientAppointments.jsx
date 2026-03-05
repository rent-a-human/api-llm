import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const PatientAppointments = () => {
  const { resetUserType } = useUser();

  // Mock appointments data
  const upcomingAppointments = [
    {
      id: 1,
      doctorName: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      date: '2024-01-15',
      time: '10:00 AM',
      reason: 'Regular Checkup',
      status: 'Scheduled',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      doctorName: 'Dr. Michael Chen',
      specialty: 'Neurology',
      date: '2024-01-18',
      time: '2:00 PM',
      reason: 'Follow-up Consultation',
      status: 'Scheduled',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const pastAppointments = [
    {
      id: 3,
      doctorName: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrics',
      date: '2024-01-08',
      time: '11:00 AM',
      reason: 'Vaccination',
      status: 'Completed',
      image: 'https://images.unsplash.com/photo-1594824797743-78e9e60b0d7a?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 4,
      doctorName: 'Dr. David Kim',
      specialty: 'Orthopedics',
      date: '2024-01-05',
      time: '3:00 PM',
      reason: 'Back Pain Consultation',
      status: 'Completed',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face'
    }
  ];

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
                className="inline-flex items-center px-1 pt-1 border-b-2 border-medical-green text-sm font-medium text-medical-green"
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
              <span className="text-sm text-gray-600">My Appointments</span>
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
                <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
                <p className="mt-2 text-gray-600">
                  View and manage your upcoming and past appointments.
                </p>
              </div>
              <Link to="/patient/doctors" className="medical-button">
                📅 Book New Appointment
              </Link>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-medical-green">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={appointment.image}
                        alt={appointment.doctorName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{appointment.doctorName}</h3>
                        <p className="text-medical-green font-medium">{appointment.specialty}</p>
                        <p className="text-gray-600">{appointment.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{appointment.date}</p>
                      <p className="text-gray-600">{appointment.time}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button className="px-4 py-2 bg-medical-green text-white rounded-md hover:bg-green-700 transition duration-200">
                      Reschedule
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200">
                      Cancel
                    </button>
                    <button className="px-4 py-2 border border-medical-green text-medical-green rounded-md hover:bg-medical-green hover:text-white transition duration-200">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Appointments */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Appointments</h2>
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 opacity-75">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={appointment.image}
                        alt={appointment.doctorName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{appointment.doctorName}</h3>
                        <p className="text-gray-600">{appointment.specialty}</p>
                        <p className="text-gray-600">{appointment.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{appointment.date}</p>
                      <p className="text-gray-600">{appointment.time}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button className="px-4 py-2 border border-medical-blue text-medical-blue rounded-md hover:bg-medical-blue hover:text-white transition duration-200">
                      View Report
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200">
                      Book Follow-up
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientAppointments;