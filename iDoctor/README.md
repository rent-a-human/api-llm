# iDoctor - Medical Dashboard

A modern, responsive React Vite application for managing medical practices, featuring doctors, patients, and appointments.

## Features

### 🏥 Core Functionality
- **Dashboard**: Overview of medical practice statistics and today's schedule
- **Doctors Management**: View and manage doctor profiles, specialties, and schedules
- **Patients Management**: Comprehensive patient records with medical history
- **Appointments**: Schedule and track appointments with filtering capabilities

### 🎨 Design & UI
- **Professional Medical Theme**: Clean, modern design suitable for healthcare environments
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Interactive Components**: Modals, tables, and cards with hover effects
- **Status Indicators**: Color-coded appointment statuses and patient conditions

### 🔧 Technical Features
- **React 19** with modern hooks and functional components
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **React Router** for client-side routing
- **Mock Data**: Comprehensive hard-coded medical data for demonstration

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # Main layout wrapper
│   ├── Navigation.jsx      # Top navigation bar
│   └── StatCard.jsx        # Reusable statistic card
├── pages/
│   ├── Dashboard.jsx       # Main dashboard view
│   ├── Doctors.jsx         # Doctors management
│   ├── Patients.jsx        # Patients management
│   └── Appointments.jsx    # Appointments management
├── data/
│   └── medicalData.js      # Mock medical data
├── App.jsx                 # Main app component with routing
├── main.jsx               # Application entry point
└── index.css              # Global styles and Tailwind imports
```

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd iDoctor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5174`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Data Models

### Doctors
- Personal information and contact details
- Specialty and years of experience
- Patient load and availability
- Professional photos

### Patients
- Personal and contact information
- Medical history and allergies
- Blood type and demographics
- Assigned primary doctor

### Appointments
- Date, time, and appointment type
- Patient and doctor associations
- Status tracking (Scheduled, In Progress, Completed)
- Medical notes and observations

## Key Components

### Dashboard
- Real-time statistics
- Today's appointment schedule
- Recent patient activity
- Available doctor status

### Doctor Management
- Doctor profiles with photos
- Specialty and experience display
- Patient load tracking
- Detailed doctor information modal

### Patient Management
- Searchable patient list
- Comprehensive patient records
- Medical history tracking
- Contact information management

### Appointment System
- Appointment scheduling interface
- Status management
- Patient and doctor assignment
- Appointment filtering and search

## Styling

The application uses Tailwind CSS with custom medical-themed colors:
- Medical Blue: `#0066cc`
- Medical Green: `#10b981`
- Medical Red: `#ef4444`
- Medical Gray: `#6b7280`

Custom CSS classes are available:
- `.medical-card`: Standard card component
- `.medical-button`: Primary button style
- `.medical-button-secondary`: Secondary button style
- `.stat-card`: Statistics card layout

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Customization

The application uses a modular structure allowing easy customization:
- Add new pages in `src/pages/`
- Modify data structure in `src/data/medicalData.js`
- Update styling in `src/index.css`
- Customize theme colors in `tailwind.config.js`

## License

This project is for demonstration purposes and includes mock data only. Not for use in actual medical environments without proper security and compliance measures.

## Contributing

This is a demonstration project. Feel free to fork and modify for your own use cases.