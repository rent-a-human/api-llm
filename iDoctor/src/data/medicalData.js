// Mock data for the iDoctor application

export const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    experience: "15 years",
    email: "sarah.johnson@idoctor.com",
    phone: "(555) 123-4567",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    availability: "Mon-Fri, 9AM-5PM",
    patientsToday: 8,
    totalPatients: 1247
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Pediatrics",
    experience: "12 years",
    email: "michael.chen@idoctor.com",
    phone: "(555) 234-5678",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    availability: "Mon-Sat, 8AM-6PM",
    patientsToday: 12,
    totalPatients: 986
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Dermatology",
    experience: "10 years",
    email: "emily.rodriguez@idoctor.com",
    phone: "(555) 345-6789",
    image: "https://images.unsplash.com/photo-1594824731313-d5a9b2c14b30?w=400&h=400&fit=crop&crop=face",
    availability: "Tue-Sat, 10AM-4PM",
    patientsToday: 6,
    totalPatients: 743
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Orthopedics",
    experience: "18 years",
    email: "james.wilson@idoctor.com",
    phone: "(555) 456-7890",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face",
    availability: "Mon-Fri, 7AM-3PM",
    patientsToday: 4,
    totalPatients: 1523
  }
];

export const patients = [
  {
    id: 1,
    name: "Alice Thompson",
    age: 34,
    gender: "Female",
    email: "alice.thompson@email.com",
    phone: "(555) 111-2222",
    address: "123 Oak Street, Springfield",
    bloodType: "A+",
    allergies: ["Penicillin", "Pollen"],
    lastVisit: "2024-03-15",
    primaryDoctor: 1,
    medicalHistory: ["Hypertension", "Anxiety"]
  },
  {
    id: 2,
    name: "Bob Martinez",
    age: 12,
    gender: "Male",
    email: "bob.martinez@email.com",
    phone: "(555) 222-3333",
    address: "456 Pine Avenue, Springfield",
    bloodType: "O+",
    allergies: [],
    lastVisit: "2024-03-20",
    primaryDoctor: 2,
    medicalHistory: ["ADHD"]
  },
  {
    id: 3,
    name: "Carol Davis",
    age: 28,
    gender: "Female",
    email: "carol.davis@email.com",
    phone: "(555) 333-4444",
    address: "789 Maple Drive, Springfield",
    bloodType: "B-",
    allergies: ["Shellfish"],
    lastVisit: "2024-03-18",
    primaryDoctor: 3,
    medicalHistory: ["Eczema"]
  },
  {
    id: 4,
    name: "David Brown",
    age: 45,
    gender: "Male",
    email: "david.brown@email.com",
    phone: "(555) 444-5555",
    address: "321 Elm Street, Springfield",
    bloodType: "AB+",
    allergies: [],
    lastVisit: "2024-03-22",
    primaryDoctor: 4,
    medicalHistory: ["Arthritis", "Diabetes Type 2"]
  },
  {
    id: 5,
    name: "Emma Wilson",
    age: 67,
    gender: "Female",
    email: "emma.wilson@email.com",
    phone: "(555) 555-6666",
    address: "654 Cedar Lane, Springfield",
    bloodType: "A-",
    allergies: ["Latex"],
    lastVisit: "2024-03-25",
    primaryDoctor: 1,
    medicalHistory: ["Heart Disease", "Osteoporosis"]
  }
];

export const appointments = [
  {
    id: 1,
    patientId: 1,
    doctorId: 1,
    date: "2024-03-28",
    time: "09:00",
    type: "Follow-up",
    status: "Scheduled",
    notes: "Regular blood pressure check"
  },
  {
    id: 2,
    patientId: 2,
    doctorId: 2,
    date: "2024-03-28",
    time: "10:30",
    type: "Routine Check-up",
    status: "Scheduled",
    notes: "Annual physical exam"
  },
  {
    id: 3,
    patientId: 3,
    doctorId: 3,
    date: "2024-03-28",
    time: "14:00",
    type: "Consultation",
    status: "Scheduled",
    notes: "Skin rash evaluation"
  },
  {
    id: 4,
    patientId: 4,
    doctorId: 4,
    date: "2024-03-28",
    time: "11:15",
    type: "Treatment",
    status: "In Progress",
    notes: "Physical therapy session"
  },
  {
    id: 5,
    patientId: 5,
    doctorId: 1,
    date: "2024-03-27",
    time: "15:30",
    type: "Follow-up",
    status: "Completed",
    notes: "Heart condition monitoring"
  },
  {
    id: 6,
    patientId: 1,
    doctorId: 1,
    date: "2024-03-27",
    time: "09:00",
    type: "Treatment",
    status: "Completed",
    notes: "Blood pressure medication adjustment"
  }
];

export const stats = {
  totalDoctors: doctors.length,
  totalPatients: patients.length,
  todayAppointments: appointments.filter(apt => apt.date === "2024-03-28").length,
  completedAppointments: appointments.filter(apt => apt.status === "Completed").length,
  upcomingAppointments: appointments.filter(apt => apt.status === "Scheduled").length,
  activeTreatments: appointments.filter(apt => apt.status === "In Progress").length
};

// Helper functions
export const getDoctorById = (id) => doctors.find(doctor => doctor.id === id);
export const getPatientById = (id) => patients.find(patient => patient.id === id);
export const getAppointmentsByDoctor = (doctorId) => appointments.filter(apt => apt.doctorId === doctorId);
export const getAppointmentsByPatient = (patientId) => appointments.filter(apt => apt.patientId === patientId);
export const getTodayAppointments = () => appointments.filter(apt => apt.date === "2024-03-28");