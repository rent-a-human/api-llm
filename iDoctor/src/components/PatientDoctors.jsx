import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const PatientDoctors = () => {
  const { resetUserType } = useUser();

  // Mock doctor data for patients
  const doctors = [
    {
      id: 1,
      name: 'Sarah Johnson',
      specialty: 'Cardiology',
      experience: '15 years',
      rating: 4.9,
      availableSlots: ['10:00 AM', '2:00 PM', '4:00 PM'],
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Michael Chen',
      specialty: 'Neurology',
      experience: '12 years',
      rating: 4.8,
      availableSlots: ['9:00 AM', '11:00 AM', '3:00 PM'],
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      specialty: 'Pediatrics',
      experience: '10 years',
      rating: 4.7,
      availableSlots: ['8:00 AM', '1:00 PM', '5:00 PM'],
      image: 'https://images.unsplash.com/photo-1594824797743-78e9e60b0d7a?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'David Kim',
      specialty: 'Orthopedics',
      experience: '18 years',
      rating: 4.9,
      availableSlots: ['10:30 AM', '2:30 PM'],
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
                className="inline-flex items-center px-1 pt-1 border-b-2 border-medical-green text-sm font-medium text-medical-green"
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
              <span className="text-sm text-gray-600">Find Doctors</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Find Doctors</h1>
            <p className="mt-2 text-gray-600">
              Search and book appointments with our qualified healthcare professionals.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-green">
                  <option>All Specialties</option>
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Pediatrics</option>
                  <option>Orthopedics</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Enter location"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-green"
                />
              </div>
              <div className="flex items-end">
                <button className="w-full medical-button">
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Doctors List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
                <div className="flex items-start space-x-4">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">Dr. {doctor.name}</h3>
                    <p className="text-medical-green font-medium">{doctor.specialty}</p>
                    <p className="text-gray-600 text-sm">{doctor.experience} experience</p>
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm text-gray-600 ml-1">{doctor.rating} (124 reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Available Time Slots</h4>
                  <div className="flex flex-wrap gap-2">
                    {doctor.availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        className="px-3 py-1 text-sm border border-medical-green text-medical-green rounded-full hover:bg-medical-green hover:text-white transition duration-200"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex space-x-3">
                  <button className="flex-1 bg-medical-green text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200">
                    Book Appointment
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDoctors;