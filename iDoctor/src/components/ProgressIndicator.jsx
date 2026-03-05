import React from 'react';

/**
 * Progress Indicator Component
 * Shows current step progress with visual indicators
 */
const ProgressIndicator = ({ 
  currentStep, 
  totalSteps, 
  completedSteps = [], 
  onStepClick,
  steps = []
}) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const stepTitles = steps.length > 0 
    ? steps.map(step => step.title)
    : [
        'Personal Info',
        'Medical Info', 
        'Symptoms',
        'Additional Context'
      ];

  const handleStepClick = (stepNumber) => {
    if (onStepClick) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress</h3>
        <div className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
          <div 
            className="bg-medical-green h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = stepNumber === currentStep;
          const isAccessible = stepNumber <= currentStep || isCompleted;

          return (
            <div
              key={stepNumber}
              className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                isCurrent 
                  ? 'bg-medical-green text-white' 
                  : isCompleted
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : isAccessible
                      ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 cursor-pointer'
                      : 'bg-gray-25 text-gray-400 cursor-not-allowed'
              }`}
              onClick={() => isAccessible && handleStepClick(stepNumber)}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isCurrent 
                  ? 'bg-white text-medical-green' 
                  : isCompleted
                    ? 'bg-medical-green text-white'
                    : isAccessible
                      ? 'bg-gray-200 text-gray-600'
                      : 'bg-gray-100 text-gray-400'
              }`}>
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium">{stepTitles[index] || `Step ${stepNumber}`}</div>
                {isCurrent && (
                  <div className="text-xs opacity-90">Currently filling</div>
                )}
                {isCompleted && !isCurrent && (
                  <div className="text-xs">✓ Completed</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Completion Progress</div>
          <div className="text-lg font-semibold text-medical-green">
            {Math.round(progressPercentage)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;