import React, { useState } from 'react';
import Layout from '../components/Layout';
import { doctors, getAppointmentsByDoctor } from '../data/medicalData';

const Doctors = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const handleDoctorClick = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const closeModal = () => {
    setSelectedDoctor(null);
  };

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
          <p className="mt-2 text-gray-600">
            Manage your medical team and their schedules.
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {doctors.map((doctor) => {
            const doctorAppointments = getAppointmentsByDoctor(doctor.id);
            const todayAppointments = doctorAppointments.filter(apt => apt.date === "2024-03-28");
            
            return (
              <div
                key={doctor.id}
                className="medical-card hover:shadow-lg transition duration-200 cursor-pointer"
                onClick={() => handleDoctorClick(doctor)}
              >
                <div className="text-center">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                  <p className="text-medical-blue font-medium">{doctor.specialty}</p>
                  <p className="text-sm text-gray-600 mt-1">{doctor.experience} experience</p>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Patients Today:</span>
                    <span className="font-medium text-gray-900">{todayAppointments.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Patients:</span>
                    <span className="font-medium text-gray-900">{doctor.totalPatients}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Availability:</span>
                    <span className="font-medium text-gray-900 text-xs">{doctor.availability}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="medical-button w-full text-sm">
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Doctor Detail Modal */}
        {selectedDoctor && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Doctor Details</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={selectedDoctor.image}
                    alt={selectedDoctor.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto"
                  />
                </div>
                
                <div className="md:w-2/3 space-y-4">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{selectedDoctor.name}</h4>
                    <p className="text-medical-blue font-medium">{selectedDoctor.specialty}</p>
                    <p className="text-gray-600">{selectedDoctor.experience} of experience</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-gray-900">{selectedDoctor.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone</p>
                      <p className="text-gray-900">{selectedDoctor.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Patients Today</p>
                      <p className="text-gray-900">{selectedDoctor.patientsToday}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Patients</p>
                      <p className="text-gray-900">{selectedDoctor.totalPatients}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-600">Availability</p>
                      <p className="text-gray-900">{selectedDoctor.availability}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button className="medical-button">
                      Edit Profile
                    </button>
                    <button className="medical-button-secondary">
                      View Schedule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Doctors;