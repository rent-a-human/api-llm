import React from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { stats, getTodayAppointments, doctors, patients } from '../data/medicalData';

const Dashboard = () => {
  const todayAppointments = getTodayAppointments();
  const recentPatients = patients.slice(0, 3);
  const availableDoctors = doctors.filter(doctor => doctor.patientsToday < 10);

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Medical Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's what's happening in your medical practice today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Doctors"
            value={stats.totalDoctors}
            icon="👨‍⚕️"
            color="blue"
          />
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon="👥"
            color="green"
          />
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            icon="📅"
            color="blue"
          />
          <StatCard
            title="Active Treatments"
            value={stats.activeTreatments}
            icon="⚕️"
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <div className="medical-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
            <div className="space-y-4">
              {todayAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No appointments scheduled for today</p>
              ) : (
                todayAppointments.slice(0, 5).map((appointment) => {
                  const patient = patients.find(p => p.id === appointment.patientId);
                  const doctor = doctors.find(d => d.id === appointment.doctorId);
                  return (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-medical-blue rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {patient?.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{patient?.name}</p>
                          <p className="text-sm text-gray-600">{doctor?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Patients */}
          <div className="medical-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Patients</h3>
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-medical-green rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-600">{patient.age} years old • {patient.gender}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Last visit</p>
                    <p className="text-sm font-medium text-gray-900">{patient.lastVisit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Available Doctors */}
        <div className="mt-8 medical-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Doctors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableDoctors.map((doctor) => (
              <div key={doctor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
                <div className="flex items-center space-x-3">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{doctor.name}</p>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-600">{doctor.availability}</p>
                  <p className="text-sm font-medium text-medical-blue">{doctor.patientsToday} patients today</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;