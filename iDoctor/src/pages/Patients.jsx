import React, { useState } from 'react';
import Layout from '../components/Layout';
import { patients, getAppointmentsByPatient, getDoctorById } from '../data/medicalData';

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
  };

  const closeModal = () => {
    setSelectedPatient(null);
  };

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="mt-2 text-gray-600">
            Manage patient records and medical history.
          </p>
        </div>

        {/* Search and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search patients by name, email, or phone..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-medical-blue focus:border-medical-blue"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="medical-button">
            Add New Patient
          </button>
        </div>

        {/* Patients Table */}
        <div className="medical-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Primary Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => {
                  const primaryDoctor = getDoctorById(patient.primaryDoctor);
                  const appointments = getAppointmentsByPatient(patient.id);
                  const recentAppointment = appointments[0];
                  
                  return (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-medical-green rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                            <div className="text-sm text-gray-500">{patient.age} years old • {patient.gender}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.email}</div>
                        <div className="text-sm text-gray-500">{patient.phone}</div>
                        <div className="text-sm text-gray-500">Blood: {patient.bloodType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{primaryDoctor?.name}</div>
                        <div className="text-sm text-gray-500">{primaryDoctor?.specialty}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.lastVisit}</div>
                        {recentAppointment && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            recentAppointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                            recentAppointment.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            Next: {recentAppointment.time}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handlePatientClick(patient)}
                          className="text-medical-blue hover:text-blue-700 mr-3"
                        >
                          View Details
                        </button>
                        <button className="text-medical-green hover:text-green-700">
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patient Detail Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Patient Details</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Patient Basic Info */}
                <div className="medical-card">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Full Name</p>
                      <p className="text-gray-900">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Age</p>
                      <p className="text-gray-900">{selectedPatient.age} years old</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Gender</p>
                      <p className="text-gray-900">{selectedPatient.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Blood Type</p>
                      <p className="text-gray-900">{selectedPatient.bloodType}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-600">Address</p>
                      <p className="text-gray-900">{selectedPatient.address}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="medical-card">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-gray-900">{selectedPatient.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone</p>
                      <p className="text-gray-900">{selectedPatient.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="medical-card">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Primary Doctor</p>
                      <p className="text-gray-900">{getDoctorById(selectedPatient.primaryDoctor)?.name}</p>
                      <p className="text-sm text-gray-500">{getDoctorById(selectedPatient.primaryDoctor)?.specialty}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Medical History</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedPatient.medicalHistory.map((condition, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Allergies</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedPatient.allergies.length > 0 ? (
                          selectedPatient.allergies.map((allergy, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {allergy}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No known allergies</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Last Visit</p>
                      <p className="text-gray-900">{selectedPatient.lastVisit}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button className="medical-button">
                    Edit Patient
                  </button>
                  <button className="medical-button-secondary">
                    View Appointments
                  </button>
                  <button className="medical-button-secondary">
                    Medical Records
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Patients;