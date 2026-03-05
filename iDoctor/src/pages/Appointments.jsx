import React, { useState } from 'react';
import Layout from '../components/Layout';
import { appointments, patients, doctors, getDoctorById, getPatientById } from '../data/medicalData';

const Appointments = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const filteredAppointments = appointments.filter(appointment => {
    if (filterStatus === 'all') return true;
    return appointment.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const closeModal = () => {
    setSelectedAppointment(null);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const todaysAppointments = appointments.filter(apt => apt.date === "2024-03-28");
  const upcomingAppointments = appointments.filter(apt => new Date(apt.date) > new Date("2024-03-28"));
  const completedToday = todaysAppointments.filter(apt => apt.status === "Completed");

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-2 text-gray-600">
            Manage patient appointments and schedules.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="stat-number text-2xl">{todaysAppointments.length}</div>
            <div className="stat-label">Today's Appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-number text-2xl text-green-600">{completedToday.length}</div>
            <div className="stat-label">Completed Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-number text-2xl text-blue-600">{upcomingAppointments.length}</div>
            <div className="stat-label">Upcoming Appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-number text-2xl text-yellow-600">
              {todaysAppointments.filter(apt => apt.status === "In Progress").length}
            </div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        {/* Actions and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <button className="medical-button">
            Schedule New Appointment
          </button>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-medical-blue focus:border-medical-blue"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Appointments Table */}
        <div className="medical-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => {
                  const patient = getPatientById(appointment.patientId);
                  const doctor = getDoctorById(appointment.doctorId);
                  
                  return (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{appointment.date}</div>
                        <div className="text-sm text-gray-500">{appointment.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-medical-green rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {patient?.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{patient?.name}</div>
                            <div className="text-sm text-gray-500">{patient?.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{doctor?.name}</div>
                        <div className="text-sm text-gray-500">{doctor?.specialty}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleAppointmentClick(appointment)}
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

        {/* Appointment Detail Modal */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Appointment Details</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="medical-card">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Appointment Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Date</p>
                        <p className="text-gray-900">{selectedAppointment.date}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Time</p>
                        <p className="text-gray-900">{selectedAppointment.time}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Type</p>
                        <p className="text-gray-900">{selectedAppointment.type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                          {selectedAppointment.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="medical-card">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Name</p>
                        <p className="text-gray-900">{getPatientById(selectedAppointment.patientId)?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Age</p>
                        <p className="text-gray-900">{getPatientById(selectedAppointment.patientId)?.age} years old</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Phone</p>
                        <p className="text-gray-900">{getPatientById(selectedAppointment.patientId)?.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Blood Type</p>
                        <p className="text-gray-900">{getPatientById(selectedAppointment.patientId)?.bloodType}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="medical-card">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Doctor Information</h4>
                  <div className="flex items-center space-x-4">
                    <img
                      src={getDoctorById(selectedAppointment.doctorId)?.image}
                      alt={getDoctorById(selectedAppointment.doctorId)?.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{getDoctorById(selectedAppointment.doctorId)?.name}</p>
                      <p className="text-medical-blue">{getDoctorById(selectedAppointment.doctorId)?.specialty}</p>
                      <p className="text-sm text-gray-600">{getDoctorById(selectedAppointment.doctorId)?.experience} experience</p>
                    </div>
                  </div>
                </div>

                <div className="medical-card">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Notes</h4>
                  <p className="text-gray-700">{selectedAppointment.notes}</p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button className="medical-button">
                    Edit Appointment
                  </button>
                  <button className="medical-button-secondary">
                    Update Status
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-200">
                    Cancel Appointment
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

export default Appointments;