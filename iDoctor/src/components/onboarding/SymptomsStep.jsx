import React, { useState } from 'react';
import { usePatientOnboarding } from '../../contexts/PatientOnboardingContext';
import FormCheckbox from '../ui/FormCheckbox';
import FormSelect from '../ui/FormSelect';
import FormTextarea from '../ui/FormTextarea';

const SymptomsStep = () => {
  const { state, actions } = usePatientOnboarding();
  const [errors, setErrors] = useState({});

  // Get current step data
  const {
    hasPain,
    painIntensity,
    painLocations,
    symptomDuration,
    associatedSymptoms,
    painTriggers,
    painRelief
  } = state;

  // Handle pain assessment
  const handlePainAssessment = (value) => {
    actions.setSymptoms({ 
      hasPain: value,
      // Reset pain-related fields if "No" is selected
      ...(value === false && { 
        painIntensity: '',
        painLocations: [] 
      })
    });
  };

  // Pain location options
  const painLocationOptions = [
    { value: 'head', label: 'Head' },
    { value: 'neck', label: 'Neck' },
    { value: 'chest', label: 'Chest' },
    { value: 'back', label: 'Back' },
    { value: 'shoulders', label: 'Shoulders' },
    { value: 'arms', label: 'Arms' },
    { value: 'hands', label: 'Hands' },
    { value: 'abdomen', label: 'Abdomen' },
    { value: 'hips', label: 'Hips' },
    { value: 'legs', label: 'Legs' },
    { value: 'knees', label: 'Knees' },
    { value: 'feet', label: 'Feet' },
    { value: 'joints', label: 'Joints' },
    { value: 'muscles', label: 'Muscles' },
    { value: 'bones', label: 'Bones' }
  ];

  // Symptom duration options
  const durationOptions = [
    { value: 'less_than_day', label: 'Less than 1 day' },
    { value: 'one_to_seven_days', label: '1-7 days' },
    { value: 'one_to_four_weeks', label: '1-4 weeks' },
    { value: 'one_to_six_months', label: '1-6 months' },
    { value: 'more_than_six_months', label: 'More than 6 months' }
  ];

  // Associated symptoms options
  const associatedSymptomsOptions = [
    { value: 'fever', label: 'Fever' },
    { value: 'chills', label: 'Chills' },
    { value: 'nausea', label: 'Nausea' },
    { value: 'vomiting', label: 'Vomiting' },
    { value: 'diarrhea', label: 'Diarrhea' },
    { value: 'constipation', label: 'Constipation' },
    { value: 'fatigue', label: 'Fatigue' },
    { value: 'weakness', label: 'Weakness' },
    { value: 'dizziness', label: 'Dizziness' },
    { value: 'headache', label: 'Headache' },
    { value: 'shortness_of_breath', label: 'Shortness of breath' },
    { value: 'cough', label: 'Cough' },
    { value: 'sore_throat', label: 'Sore throat' },
    { value: 'runny_nose', label: 'Runny nose' },
    { value: 'congestion', label: 'Congestion' },
    { value: 'loss_of_appetite', label: 'Loss of appetite' },
    { value: 'weight_loss', label: 'Weight loss' },
    { value: 'weight_gain', label: 'Weight gain' },
    { value: 'sleep_disturbances', label: 'Sleep disturbances' },
    { value: 'anxiety', label: 'Anxiety' },
    { value: 'depression', label: 'Depression' },
    { value: 'skin_rash', label: 'Skin rash' },
    { value: 'swelling', label: 'Swelling' },
    { value: 'bruising', label: 'Bruising' },
    { value: 'vision_changes', label: 'Vision changes' },
    { value: 'hearing_changes', label: 'Hearing changes' }
  ];

  // Handle checkbox group change for associated symptoms
  const handleAssociatedSymptomsChange = (event) => {
    const value = event.target.value;
    actions.toggleAssociatedSymptom(value);
  };

  // Calculate validation for the step
  const stepValidation = {
    isValid: hasPain !== null && symptomDuration !== '',
    missingFields: []
  };

  if (hasPain === null) stepValidation.missingFields.push('Pain assessment');
  if (!symptomDuration) stepValidation.missingFields.push('Symptom duration');

  // If pain is yes, additional validations
  if (hasPain === true) {
    if (!painIntensity) stepValidation.missingFields.push('Pain intensity rating');
    if (painLocations.length === 0) stepValidation.missingFields.push('Pain location');
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-medical-green rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">🔍</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Symptoms Assessment</h2>
        <p className="text-gray-600 mt-2">
          Help us understand your current symptoms and how they affect you.
        </p>
      </div>

      {/* Pain Assessment */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <FormCheckbox
          label="Are you currently experiencing pain?"
          name="hasPain"
          checked={hasPain}
          onChange={(e) => handlePainAssessment(e.target.checked)}
          error={errors.hasPain}
          required
          options={[
            { value: true, label: 'Yes, I am experiencing pain' },
            { value: false, label: 'No, I am not experiencing pain' }
          ]}
        />

        {/* Pain Intensity Scale - Conditional */}
        {hasPain === true && (
          <div className="space-y-4 bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900">Pain Intensity Scale</h4>
            <p className="text-sm text-gray-600">
              Please rate your current pain level from 1 (mild) to 10 (worst imaginable):
            </p>
            
            {/* Pain intensity slider */}
            <div className="space-y-4">
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 - Mild</span>
                <span>10 - Worst</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={painIntensity || 1}
                onChange={(e) => actions.setSymptoms({ painIntensity: e.target.value })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${((painIntensity || 1) - 1) * 11.11}%, #e5e7eb ${((painIntensity || 1) - 1) * 11.11}%, #e5e7eb 100%)`
                }}
              />
              <div className="text-center">
                <span className="text-2xl font-bold text-medical-green">{painIntensity || 1}</span>
                <span className="text-gray-600 ml-2">/10</span>
              </div>
              
              {/* Pain intensity descriptions */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div className={`p-2 rounded text-center ${painIntensity <= 3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  Mild (1-3)
                </div>
                <div className={`p-2 rounded text-center ${painIntensity >= 4 && painIntensity <= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                  Moderate (4-6)
                </div>
                <div className={`p-2 rounded text-center ${painIntensity >= 7 && painIntensity <= 8 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}`}>
                  Severe (7-8)
                </div>
                <div className={`p-2 rounded text-center ${painIntensity >= 9 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                  Extreme (9-10)
                </div>
                <div className="p-2 rounded text-center bg-gray-100 text-gray-600">
                  Current: {painIntensity || 1}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pain Location - Conditional */}
        {hasPain === true && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Where are you experiencing pain? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {painLocationOptions.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    id={`pain-location-${option.value}`}
                    type="checkbox"
                    checked={painLocations.includes(option.value)}
                    onChange={() => actions.togglePainLocation(option.value)}
                    className="w-4 h-4 text-medical-green border-gray-300 rounded focus:ring-medical-green focus:ring-2"
                  />
                  <label 
                    htmlFor={`pain-location-${option.value}`} 
                    className="ml-2 text-sm text-gray-700 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Symptom Duration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <FormSelect
          label="How long have you been experiencing these symptoms?"
          name="symptomDuration"
          value={symptomDuration}
          onChange={(e) => actions.setSymptoms({ symptomDuration: e.target.value })}
          error={errors.symptomDuration}
          required
          options={durationOptions}
          placeholder="Select duration"
          helperText="This helps us understand if your condition is acute, subacute, or chronic"
        />
      </div>

      {/* Associated Symptoms */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <FormCheckbox
          label="Are you experiencing any of these additional symptoms?"
          name="associatedSymptoms"
          checked={associatedSymptoms}
          onChange={handleAssociatedSymptomsChange}
          error={errors.associatedSymptoms}
          options={associatedSymptomsOptions}
          helperText="Select all that apply. This information helps with differential diagnosis."
        />
      </div>

      {/* Pain Triggers and Relief Factors */}
      {hasPain === true && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pain Triggers */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <FormTextarea
              label="What triggers or worsens your pain?"
              name="painTriggers"
              value={painTriggers}
              onChange={(e) => actions.setSymptoms({ painTriggers: e.target.value })}
              placeholder="e.g., Movement, certain activities, stress, weather changes..."
              rows={4}
              helperText="Describe what makes your pain worse"
            />
          </div>

          {/* Pain Relief */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <FormTextarea
              label="What provides relief or helps your pain?"
              name="painRelief"
              value={painRelief}
              onChange={(e) => actions.setSymptoms({ painRelief: e.target.value })}
              placeholder="e.g., Rest, ice/heat, medications, massage, specific positions..."
              rows={4}
              helperText="Describe what helps reduce your pain"
            />
          </div>
        </div>
      )}

      {/* Pain Visual Description */}
      {hasPain === true && painLocations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-blue-900 mb-4">Pain Summary</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Intensity:</strong> {painIntensity}/10 ({painIntensity <= 3 ? 'Mild' : painIntensity <= 6 ? 'Moderate' : painIntensity <= 8 ? 'Severe' : 'Extreme'})</p>
            <p><strong>Locations:</strong> {painLocations.map(location => {
              const option = painLocationOptions.find(opt => opt.value === location);
              return option?.label || location;
            }).join(', ')}</p>
            <p><strong>Duration:</strong> {durationOptions.find(opt => opt.value === symptomDuration)?.label || 'Not specified'}</p>
            {painTriggers && <p><strong>Triggers:</strong> {painTriggers}</p>}
            {painRelief && <p><strong>Relief:</strong> {painRelief}</p>}
          </div>
        </div>
      )}

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
          <span className="text-gray-600">Step 3 of 4: Symptoms Assessment</span>
          <span className={`font-medium ${stepValidation.isValid ? 'text-medical-green' : 'text-gray-400'}`}>
            {stepValidation.isValid ? 'Complete' : 'In Progress'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-medical-green h-2 rounded-full transition-all duration-300"
            style={{ width: stepValidation.isValid ? '100%' : '30%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default SymptomsStep;