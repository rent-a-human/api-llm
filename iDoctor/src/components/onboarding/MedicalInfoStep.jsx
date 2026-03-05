import React, { useState } from 'react';
import { usePatientOnboarding } from '../../contexts/PatientOnboardingContext';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import FormTextarea from '../ui/FormTextarea';
import { validateField } from '../../utils/validation';

const MedicalInfoStep = () => {
  const { state, actions } = usePatientOnboarding();
  const [errors, setErrors] = useState({});

  // Get current step data
  const {
    reasonForConsultation,
    allergies,
    medications,
    pastMedicalHistory
  } = state;

  // Handle field changes
  const handleFieldChange = (fieldName, value) => {
    actions.setMedicalInfo({ [fieldName]: value });
    
    // Real-time validation
    const fieldError = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldError
    }));
  };

  // Allergy severity options
  const severityOptions = [
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' },
    { value: 'life_threatening', label: 'Life-threatening' }
  ];

  // Medication frequency options
  const frequencyOptions = [
    { value: 'once_daily', label: 'Once daily' },
    { value: 'twice_daily', label: 'Twice daily' },
    { value: 'three_times_daily', label: 'Three times daily' },
    { value: 'four_times_daily', label: 'Four times daily' },
    { value: 'as_needed', label: 'As needed' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'other', label: 'Other' }
  ];

  // Medical condition status options
  const statusOptions = [
    { value: 'active', label: 'Active/Current' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'chronic', label: 'Chronic' },
    { value: 'recurring', label: 'Recurring' }
  ];

  // Handle adding new items to dynamic lists
  const handleAddAllergy = () => {
    actions.addAllergy({
      name: '',
      severity: '',
      description: ''
    });
  };

  const handleAddMedication = () => {
    actions.addMedication({
      name: '',
      dosage: '',
      frequency: '',
      startDate: ''
    });
  };

  const handleAddPastCondition = () => {
    actions.addPastCondition({
      condition: '',
      date: '',
      status: '',
      notes: ''
    });
  };

  // Calculate validation for the step
  const stepValidation = {
    isValid: reasonForConsultation?.trim().length >= 10,
    missingFields: []
  };

  if (!reasonForConsultation?.trim()) stepValidation.missingFields.push('Reason for Consultation');
  if (reasonForConsultation?.trim().length < 10) stepValidation.missingFields.push('More detail needed for Reason for Consultation');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-medical-green rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">🏥</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Medical Information</h2>
        <p className="text-gray-600 mt-2">
          Help us understand your medical history and current health status.
        </p>
      </div>

      {/* Reason for Consultation */}
      <FormTextarea
        label="Reason for Consultation"
        name="reasonForConsultation"
        value={reasonForConsultation}
        onChange={(e) => handleFieldChange('reasonForConsultation', e.target.value)}
        onBlur={(e) => handleFieldBlur('reasonForConsultation', e.target.value)}
        error={errors.reasonForConsultation}
        required
        placeholder="Please describe why you are seeking medical attention..."
        rows={4}
        helperText="Provide as much detail as possible about your current health concerns"
        maxLength={500}
        showCharCount
      />

      {/* Known Allergies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Known Allergies <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={handleAddAllergy}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-medical-green bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-green"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Allergy
          </button>
        </div>

        {allergies.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600">No known allergies</p>
            <p className="text-sm text-gray-500">Click "Add Allergy" to record any known allergies</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allergies.map((allergy, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Allergy {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => actions.removeAllergy(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Allergen"
                    name={`allergy-name-${index}`}
                    value={allergy.name}
                    onChange={(e) => actions.updateAllergy(index, { name: e.target.value })}
                    placeholder="e.g., Penicillin, Peanuts, Dust mites"
                  />
                  <FormSelect
                    label="Severity"
                    name={`allergy-severity-${index}`}
                    value={allergy.severity}
                    onChange={(e) => actions.updateAllergy(index, { severity: e.target.value })}
                    options={severityOptions}
                    placeholder="Select severity"
                  />
                </div>
                <FormTextarea
                  label="Description (Optional)"
                  name={`allergy-description-${index}`}
                  value={allergy.description}
                  onChange={(e) => actions.updateAllergy(index, { description: e.target.value })}
                  placeholder="Describe the reaction or additional details..."
                  rows={2}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Medications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Current Medications <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={handleAddMedication}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-medical-green bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-green"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Medication
          </button>
        </div>

        {medications.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600">No current medications</p>
            <p className="text-sm text-gray-500">Click "Add Medication" to record any medications you are taking</p>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map((medication, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Medication {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => actions.removeMedication(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Medication Name"
                    name={`medication-name-${index}`}
                    value={medication.name}
                    onChange={(e) => actions.updateMedication(index, { name: e.target.value })}
                    placeholder="e.g., Lisinopril, Metformin"
                  />
                  <FormInput
                    label="Dosage"
                    name={`medication-dosage-${index}`}
                    value={medication.dosage}
                    onChange={(e) => actions.updateMedication(index, { dosage: e.target.value })}
                    placeholder="e.g., 10mg, 500mg"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    label="Frequency"
                    name={`medication-frequency-${index}`}
                    value={medication.frequency}
                    onChange={(e) => actions.updateMedication(index, { frequency: e.target.value })}
                    options={frequencyOptions}
                    placeholder="Select frequency"
                  />
                  <FormInput
                    label="Start Date"
                    name={`medication-start-date-${index}`}
                    type="date"
                    value={medication.startDate}
                    onChange={(e) => actions.updateMedication(index, { startDate: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Medical History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Past Medical History <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={handleAddPastCondition}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-medical-green bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-green"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Condition
          </button>
        </div>

        {pastMedicalHistory.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600">No past medical conditions</p>
            <p className="text-sm text-gray-500">Click "Add Condition" to record any past medical conditions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pastMedicalHistory.map((condition, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Condition {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => actions.removePastCondition(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Condition"
                    name={`condition-name-${index}`}
                    value={condition.condition}
                    onChange={(e) => actions.updatePastCondition(index, { condition: e.target.value })}
                    placeholder="e.g., Diabetes, Hypertension, Asthma"
                  />
                  <FormSelect
                    label="Status"
                    name={`condition-status-${index}`}
                    value={condition.status}
                    onChange={(e) => actions.updatePastCondition(index, { status: e.target.value })}
                    options={statusOptions}
                    placeholder="Select status"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Date of Diagnosis"
                    name={`condition-date-${index}`}
                    type="date"
                    value={condition.date}
                    onChange={(e) => actions.updatePastCondition(index, { date: e.target.value })}
                  />
                  <FormTextarea
                    label="Additional Notes (Optional)"
                    name={`condition-notes-${index}`}
                    value={condition.notes}
                    onChange={(e) => actions.updatePastCondition(index, { notes: e.target.value })}
                    placeholder="Any additional details about this condition..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
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
          <span className="text-gray-600">Step 2 of 4: Medical Information</span>
          <span className={`font-medium ${stepValidation.isValid ? 'text-medical-green' : 'text-gray-400'}`}>
            {stepValidation.isValid ? 'Complete' : 'In Progress'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-medical-green h-2 rounded-full transition-all duration-300"
            style={{ width: stepValidation.isValid ? '100%' : '40%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default MedicalInfoStep;