import React, { useState, useEffect } from 'react';
import { usePatientOnboarding } from '../../contexts/PatientOnboardingContext';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import { validateField } from '../../utils/validation';

const PersonalInfoStep = () => {
  const { state, actions } = usePatientOnboarding();
  const [errors, setErrors] = useState({});

  // Get current step data
  const {
    fullName,
    age,
    sex,
    idNumber,
    occupation
  } = state;

  // Handle field changes with real-time validation
  const handleFieldChange = (fieldName, value) => {
    // Update the state
    actions.setPersonalInfo({ [fieldName]: value });
    
    // Real-time validation
    const fieldError = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldError
    }));
  };

  // Handle blur events for validation
  const handleFieldBlur = (fieldName, value) => {
    const fieldError = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldError
    }));
  };

  // Sex/gender options
  const sexOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_say', label: 'Prefer not to say' }
  ];

  // Calculate overall validation for the step
  const stepValidation = {
    isValid: !errors.fullName && !errors.age && !errors.sex && !errors.idNumber,
    missingFields: []
  };

  if (!fullName?.trim()) stepValidation.missingFields.push('Full Name');
  if (!age) stepValidation.missingFields.push('Age');
  if (!sex) stepValidation.missingFields.push('Sex/Gender');
  if (!idNumber?.trim()) stepValidation.missingFields.push('ID Number');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-medical-green rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">👤</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
        <p className="text-gray-600 mt-2">
          Let's start with some basic information about you.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Full Name */}
        <FormInput
          label="Full Name"
          name="fullName"
          value={fullName}
          onChange={(e) => handleFieldChange('fullName', e.target.value)}
          onBlur={(e) => handleFieldBlur('fullName', e.target.value)}
          error={errors.fullName}
          required
          placeholder="Enter your full legal name"
          helperText="Please use your full legal name as it appears on official documents"
        />

        {/* Age and Sex Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age */}
          <FormInput
            label="Age"
            name="age"
            type="number"
            value={age}
            onChange={(e) => handleFieldChange('age', e.target.value)}
            onBlur={(e) => handleFieldBlur('age', e.target.value)}
            error={errors.age}
            required
            min="0"
            max="150"
            placeholder="Enter your age"
            helperText="Age in years"
          />

          {/* Sex/Gender */}
          <FormSelect
            label="Sex/Gender"
            name="sex"
            value={sex}
            onChange={(e) => handleFieldChange('sex', e.target.value)}
            onBlur={(e) => handleFieldBlur('sex', e.target.value)}
            error={errors.sex}
            required
            options={sexOptions}
            placeholder="Select sex/gender"
            helperText="This information helps with accurate medical assessment"
          />
        </div>

        {/* ID/Identification Number */}
        <FormInput
          label="ID/Identification Number"
          name="idNumber"
          value={idNumber}
          onChange={(e) => handleFieldChange('idNumber', e.target.value)}
          onBlur={(e) => handleFieldBlur('idNumber', e.target.value)}
          error={errors.idNumber}
          required
          placeholder="Driver's license, passport, or ID number"
          helperText="This helps us verify your identity and access your medical records"
        />

        {/* Occupation (Optional) */}
        <FormInput
          label="Occupation"
          name="occupation"
          value={occupation}
          onChange={(e) => handleFieldChange('occupation', e.target.value)}
          onBlur={(e) => handleFieldBlur('occupation', e.target.value)}
          error={errors.occupation}
          placeholder="Your current occupation (optional)"
          helperText="Occupation can help identify work-related health factors"
        />
      </div>

      {/* Validation Summary */}
      {!stepValidation.isValid && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Please complete required fields</h4>
              <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                {stepValidation.missingFields.map(field => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Progress Indicator for this step */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Step 1 of 4: Personal Information</span>
          <span className={`font-medium ${stepValidation.isValid ? 'text-medical-green' : 'text-gray-400'}`}>
            {stepValidation.isValid ? 'Complete' : 'In Progress'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-medical-green h-2 rounded-full transition-all duration-300"
            style={{ width: stepValidation.isValid ? '100%' : '60%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;