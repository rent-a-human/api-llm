import React, { useState } from 'react';
import { usePatientOnboarding } from '../../contexts/PatientOnboardingContext';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import FormTextarea from '../ui/FormTextarea';
import { validateField } from '../../utils/validation';

const AdditionalContextStep = () => {
  const { state, actions } = usePatientOnboarding();
  const [errors, setErrors] = useState({});

  // Get current step data
  const {
    familyMedicalHistory,
    smokingStatus,
    packYears,
    alcoholConsumption,
    alcoholUnits,
    exerciseFrequency,
    emergencyContact,
    insurance
  } = state;

  // Handle field changes for nested objects
  const handleEmergencyContactChange = (fieldName, value) => {
    actions.setContext({
      emergencyContact: {
        ...emergencyContact,
        [fieldName]: value
      }
    });
    
    // Real-time validation for emergency contact
    if (fieldName === 'phone') {
      const fieldError = validateField('emergencyContactPhone', value);
      setErrors(prev => ({
        ...prev,
        emergencyContactPhone: fieldError
      }));
    }
  };

  const handleInsuranceChange = (fieldName, value) => {
    actions.setContext({
      insurance: {
        ...insurance,
        [fieldName]: value
      }
    });
  };

  const handleFieldChange = (fieldName, value) => {
    actions.setContext({ [fieldName]: value });
    
    // Conditional validation for smoking and alcohol
    if (fieldName === 'smokingStatus' && value !== 'current') {
      actions.setContext({ packYears: '' });
    }
    
    if (fieldName === 'alcoholConsumption' && value !== 'regular') {
      actions.setContext({ alcoholUnits: '' });
    }
  };

  // Relationship options for family medical history
  const relationshipOptions = [
    { value: 'father', label: 'Father' },
    { value: 'mother', label: 'Mother' },
    { value: 'brother', label: 'Brother' },
    { value: 'sister', label: 'Sister' },
    { value: 'son', label: 'Son' },
    { value: 'daughter', label: 'Daughter' },
    { value: 'grandfather', label: 'Grandfather' },
    { value: 'grandmother', label: 'Grandmother' },
    { value: 'uncle', label: 'Uncle' },
    { value: 'aunt', label: 'Aunt' },
    { value: 'cousin', label: 'Cousin' },
    { value: 'other', label: 'Other' }
  ];

  // Smoking status options
  const smokingOptions = [
    { value: 'never', label: 'Never smoked' },
    { value: 'former', label: 'Former smoker' },
    { value: 'current', label: 'Current smoker' }
  ];

  // Alcohol consumption options
  const alcoholOptions = [
    { value: 'never', label: 'Never drink' },
    { value: 'occasional', label: 'Occasional drinker' },
    { value: 'regular', label: 'Regular drinker' }
  ];

  // Exercise frequency options
  const exerciseOptions = [
    { value: 'never', label: 'Never' },
    { value: 'rarely', label: 'Rarely (few times per month)' },
    { value: '1-2_times_week', label: '1-2 times per week' },
    { value: '3-4_times_week', label: '3-4 times per week' },
    { value: 'daily', label: 'Daily' }
  ];

  // Emergency contact relationship options
  const emergencyRelationshipOptions = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'friend', label: 'Friend' },
    { value: 'other_relative', label: 'Other Relative' },
    { value: 'other', label: 'Other' }
  ];

  // Handle adding new family history
  const handleAddFamilyHistory = () => {
    actions.addFamilyHistory({
      relationship: '',
      condition: '',
      ageOfOnset: '',
      notes: ''
    });
  };

  // Calculate validation for the step
  const stepValidation = {
    isValid: emergencyContact.name?.trim() && 
             emergencyContact.phone?.trim() && 
             insurance.provider?.trim() && 
             insurance.policyNumber?.trim() && 
             insurance.groupNumber?.trim(),
    missingFields: []
  };

  if (!emergencyContact.name?.trim()) stepValidation.missingFields.push('Emergency Contact Name');
  if (!emergencyContact.phone?.trim()) stepValidation.missingFields.push('Emergency Contact Phone');
  if (!insurance.provider?.trim()) stepValidation.missingFields.push('Insurance Provider');
  if (!insurance.policyNumber?.trim()) stepValidation.missingFields.push('Policy Number');
  if (!insurance.groupNumber?.trim()) stepValidation.missingFields.push('Group Number');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-medical-green rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">📋</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Additional Context</h2>
        <p className="text-gray-600 mt-2">
          Help us complete your profile with family history, lifestyle, and contact information.
        </p>
      </div>

      {/* Family Medical History */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Family Medical History <span className="text-gray-400">(Optional)</span>
          </label>
          <button
            type="button"
            onClick={handleAddFamilyHistory}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-medical-green bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-green"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Family History
          </button>
        </div>

        {familyMedicalHistory.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600">No family medical history recorded</p>
            <p className="text-sm text-gray-500">Click "Add Family History" to record relevant family medical conditions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {familyMedicalHistory.map((history, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Family History {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => actions.removeFamilyHistory(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    label="Relationship"
                    name={`family-relationship-${index}`}
                    value={history.relationship}
                    onChange={(e) => actions.updateFamilyHistory(index, { relationship: e.target.value })}
                    options={relationshipOptions}
                    placeholder="Select relationship"
                  />
                  <FormInput
                    label="Medical Condition"
                    name={`family-condition-${index}`}
                    value={history.condition}
                    onChange={(e) => actions.updateFamilyHistory(index, { condition: e.target.value })}
                    placeholder="e.g., Heart disease, Cancer, Diabetes"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Age of Onset (if known)"
                    name={`family-age-${index}`}
                    type="number"
                    value={history.ageOfOnset}
                    onChange={(e) => actions.updateFamilyHistory(index, { ageOfOnset: e.target.value })}
                    placeholder="Age when diagnosed"
                    min="0"
                    max="120"
                  />
                  <FormTextarea
                    label="Additional Notes (Optional)"
                    name={`family-notes-${index}`}
                    value={history.notes}
                    onChange={(e) => actions.updateFamilyHistory(index, { notes: e.target.value })}
                    placeholder="Any additional details about this family history..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lifestyle Factors */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Lifestyle Factors</h3>
        
        {/* Smoking Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="Smoking Status"
            name="smokingStatus"
            value={smokingStatus}
            onChange={(e) => handleFieldChange('smokingStatus', e.target.value)}
            options={smokingOptions}
            placeholder="Select smoking status"
            helperText="This information helps assess smoking-related health risks"
          />
          
          {/* Conditional pack-years field */}
          {smokingStatus === 'current' && (
            <FormInput
              label="Pack-Years"
              name="packYears"
              type="number"
              value={packYears}
              onChange={(e) => handleFieldChange('packYears', e.target.value)}
              placeholder="e.g., 10"
              helperText="Number of packs per day × number of years smoking"
              min="0"
              max="100"
            />
          )}
        </div>

        {/* Alcohol Consumption */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="Alcohol Consumption"
            name="alcoholConsumption"
            value={alcoholConsumption}
            onChange={(e) => handleFieldChange('alcoholConsumption', e.target.value)}
            options={alcoholOptions}
            placeholder="Select alcohol consumption"
            helperText="This helps assess alcohol-related health risks"
          />
          
          {/* Conditional alcohol units field */}
          {alcoholConsumption === 'regular' && (
            <FormInput
              label="Units per Week"
              name="alcoholUnits"
              type="number"
              value={alcoholUnits}
              onChange={(e) => handleFieldChange('alcoholUnits', e.target.value)}
              placeholder="e.g., 7"
              helperText="Number of standard drinks per week"
              min="0"
              max="50"
            />
          )}
        </div>

        {/* Exercise Frequency */}
        <FormSelect
          label="Exercise Frequency"
          name="exerciseFrequency"
          value={exerciseFrequency}
          onChange={(e) => handleFieldChange('exerciseFrequency', e.target.value)}
          options={exerciseOptions}
          placeholder="Select exercise frequency"
          helperText="Regular exercise is important for overall health"
        />
      </div>

      {/* Emergency Contact */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Emergency Contact Information</h3>
        <p className="text-sm text-gray-600">
          This information will be used in case of medical emergencies.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Contact Name"
            name="emergencyContactName"
            value={emergencyContact.name}
            onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
            error={errors.emergencyContactName}
            required
            placeholder="Full name of emergency contact"
          />
          
          <FormSelect
            label="Relationship"
            name="emergencyContactRelationship"
            value={emergencyContact.relationship}
            onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
            options={emergencyRelationshipOptions}
            placeholder="Select relationship"
          />
        </div>
        
        <FormInput
          label="Phone Number"
          name="emergencyContactPhone"
          value={emergencyContact.phone}
          onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
          error={errors.emergencyContactPhone}
          required
          placeholder="(555) 123-4567"
          helperText="Provide a reliable phone number where we can reach this contact"
        />
      </div>

      {/* Insurance Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Insurance/Medical Coverage</h3>
        <p className="text-sm text-gray-600">
          Please provide your insurance information for billing and coverage verification.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Insurance Provider"
            name="insuranceProvider"
            value={insurance.provider}
            onChange={(e) => handleInsuranceChange('provider', e.target.value)}
            error={errors.insuranceProvider}
            required
            placeholder="e.g., Blue Cross Blue Shield, Aetna"
          />
          
          <FormInput
            label="Policy Number"
            name="insurancePolicy"
            value={insurance.policyNumber}
            onChange={(e) => handleInsuranceChange('policyNumber', e.target.value)}
            error={errors.insurancePolicy}
            required
            placeholder="Insurance policy number"
          />
        </div>
        
        <FormInput
          label="Group Number"
          name="insuranceGroup"
          value={insurance.groupNumber}
          onChange={(e) => handleInsuranceChange('groupNumber', e.target.value)}
          error={errors.insuranceGroup}
          required
          placeholder="Group number (if applicable)"
          helperText="Group number from your insurance card"
        />
      </div>

      {/* Final Summary */}
      <div className="bg-medical-green bg-opacity-10 border border-medical-green rounded-lg p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-medical-green mt-1 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-lg font-medium text-medical-green">Almost Done!</h4>
            <p className="text-medical-green mt-1">
              You're on the last step of your medical onboarding. This information will help your healthcare providers give you the best possible care.
            </p>
          </div>
        </div>
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
          <span className="text-gray-600">Step 4 of 4: Additional Context</span>
          <span className={`font-medium ${stepValidation.isValid ? 'text-medical-green' : 'text-gray-400'}`}>
            {stepValidation.isValid ? 'Complete' : 'In Progress'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-medical-green h-2 rounded-full transition-all duration-300"
            style={{ width: stepValidation.isValid ? '100%' : '20%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdditionalContextStep;