// Demo data for the IDoctor Onboarding Feature
// This file contains mock data that can be used for testing and development

export const mockPatientData = {
  appointments: [
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
    },
    {
      id: 3,
      doctorName: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrics',
      date: '2024-01-08',
      time: '11:00 AM',
      reason: 'Vaccination',
      status: 'Completed',
      image: 'https://images.unsplash.com/photo-1594824797743-78e9e60b0d7a?w=150&h=150&fit=crop&crop=face'
    }
  ],
  
  doctors: [
    {
      id: 1,
      name: 'Sarah Johnson',
      specialty: 'Cardiology',
      experience: '15 years',
      rating: 4.9,
      availableSlots: ['10:00 AM', '2:00 PM', '4:00 PM'],
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      bio: 'Dr. Johnson specializes in preventive cardiology and heart disease management.',
      education: 'MD from Harvard Medical School',
      languages: ['English', 'Spanish']
    },
    {
      id: 2,
      name: 'Michael Chen',
      specialty: 'Neurology',
      experience: '12 years',
      rating: 4.8,
      availableSlots: ['9:00 AM', '11:00 AM', '3:00 PM'],
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      bio: 'Expert in neurological disorders and stroke prevention.',
      education: 'MD from Johns Hopkins University',
      languages: ['English', 'Mandarin']
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      specialty: 'Pediatrics',
      experience: '10 years',
      rating: 4.7,
      availableSlots: ['8:00 AM', '1:00 PM', '5:00 PM'],
      image: 'https://images.unsplash.com/photo-1594824797743-78e9e60b0d7a?w=150&h=150&fit=crop&crop=face',
      bio: 'Dedicated to providing comprehensive care for children and adolescents.',
      education: 'MD from Stanford University',
      languages: ['English', 'Spanish']
    }
  ],
  
  medicalRecords: [
    {
      id: 1,
      type: 'Lab Results',
      title: 'Blood Test Results',
      date: '2024-01-10',
      doctor: 'Dr. Sarah Johnson',
      status: 'Normal',
      category: 'Laboratory',
      description: 'Complete blood count and metabolic panel',
      results: {
        hemoglobin: '14.2 g/dL',
        whiteBloodCells: '7,500/μL',
        platelets: '250,000/μL',
        glucose: '95 mg/dL'
      }
    },
    {
      id: 2,
      type: 'Prescription',
      title: 'Blood Pressure Medication',
      date: '2024-01-08',
      doctor: 'Dr. Sarah Johnson',
      status: 'Active',
      category: 'Medications',
      description: 'Lisinopril 10mg once daily',
      dosage: '10mg',
      frequency: 'Once daily',
      duration: 'Ongoing'
    },
    {
      id: 3,
      type: 'Radiology',
      title: 'Chest X-Ray',
      date: '2024-01-05',
      doctor: 'Dr. David Kim',
      status: 'Reviewed',
      category: 'Imaging',
      description: 'Chest radiograph for routine screening',
      findings: 'Normal chest X-ray with no acute findings'
    },
    {
      id: 4,
      type: 'Consultation Notes',
      title: 'Annual Physical Exam',
      date: '2024-01-01',
      doctor: 'Dr. Emily Rodriguez',
      status: 'Complete',
      category: 'Consultations',
      description: 'Comprehensive annual health assessment',
      vitals: {
        bloodPressure: '120/80',
        heartRate: '72 bpm',
        temperature: '98.6°F',
        weight: '150 lbs'
      }
    }
  ]
};

// Helper functions for demo data
export const getUpcomingAppointments = () => {
  return mockPatientData.appointments.filter(apt => apt.status === 'Scheduled');
};

export const getPastAppointments = () => {
  return mockPatientData.appointments.filter(apt => apt.status === 'Completed');
};

export const getMedicalRecordsByCategory = (category) => {
  return mockPatientData.medicalRecords.filter(record => record.category === category);
};

export const getAvailableDoctorsBySpecialty = (specialty) => {
  if (specialty === 'All Specialties') return mockPatientData.doctors;
  return mockPatientData.doctors.filter(doctor => doctor.specialty === specialty);
};

// Demo user scenarios
export const demoScenarios = {
  firstTimeUser: {
    description: "A new user visiting the app for the first time",
    steps: [
      "1. User loads the app",
      "2. Onboarding modal appears",
      "3. User selects either 'Patient' or 'Doctor'",
      "4. App redirects to role-specific dashboard",
      "5. Selection is saved to localStorage"
    ]
  },
  
  returningPatient: {
    description: "A returning patient who has already selected their role",
    steps: [
      "1. User loads the app",
      "2. localStorage contains user type and onboarding completion",
      "3. App skips onboarding and goes directly to patient dashboard",
      "4. User sees personalized patient interface with green branding"
    ]
  },
  
  roleSwitching: {
    description: "User wants to switch from patient to doctor (or vice versa)",
    steps: [
      "1. User is currently in patient portal",
      "2. User clicks 'Switch Role' button",
      "3. localStorage is cleared",
      "4. Onboarding modal appears again",
      "5. User can select different role"
    ]
  }
};

// Test cases for localStorage functionality
export const testLocalStorageScenarios = {
  clearAllData: () => {
    localStorage.removeItem('idoctor-user-type');
    localStorage.removeItem('idoctor-onboarding-completed');
    console.log('localStorage cleared. Refresh page to see onboarding again.');
  },
  
  simulateNewUser: () => {
    testLocalStorageScenarios.clearAllData();
  },
  
  simulateReturningPatient: () => {
    localStorage.setItem('idoctor-user-type', 'patient');
    localStorage.setItem('idoctor-onboarding-completed', 'true');
    console.log('localStorage set for returning patient. Refresh page.');
  },
  
  simulateReturningDoctor: () => {
    localStorage.setItem('idoctor-user-type', 'doctor');
    localStorage.setItem('idoctor-onboarding-completed', 'true');
    console.log('localStorage set for returning doctor. Refresh page.');
  }
};

// Console commands for easy testing
console.log(`
🩺 IDoctor Onboarding Demo Commands:

Test localStorage scenarios:
testLocalStorageScenarios.clearAllData()      // Clear data and show onboarding
testLocalStorageScenarios.simulateNewUser()   // Same as clearAllData
testLocalStorageScenarios.simulateReturningPatient()  // Simulate returning patient
testLocalStorageScenarios.simulateReturningDoctor()   // Simulate returning doctor

Access demo data:
mockPatientData                 // All demo data
getUpcomingAppointments()       // Filtered upcoming appointments
getPastAppointments()           // Filtered past appointments
getAvailableDoctorsBySpecialty('Cardiology')  // Filtered doctors
getMedicalRecordsByCategory('Laboratory')     // Filtered records

Read scenarios:
demoScenarios.firstTimeUser     // Step-by-step first-time user flow
demoScenarios.returningPatient  // Returning patient experience
demoScenarios.roleSwitching     // Role switching process
`);

// Export for use in components
export default {
  mockPatientData,
  getUpcomingAppointments,
  getPastAppointments,
  getAvailableDoctorsBySpecialty,
  getMedicalRecordsByCategory,
  demoScenarios,
  testLocalStorageScenarios
};