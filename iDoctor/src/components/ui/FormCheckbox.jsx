import React from 'react';

const FormCheckbox = ({ 
  label, 
  name, 
  checked, 
  onChange, 
  error, 
  required = false, 
  options = [],
  className = '',
  disabled = false,
  helperText
}) => {
  // If multiple options, render as checkbox group
  if (options.length > 0) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className={`space-y-2 ${className}`}>
          {options.map((option) => (
            <div key={option.value || option} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id={`${name}-${option.value || option}`}
                  name={name}
                  type="checkbox"
                  checked={Array.isArray(checked) ? checked.includes(option.value || option) : checked}
                  onChange={onChange}
                  value={option.value || option}
                  disabled={disabled}
                  className="w-4 h-4 text-medical-green border-gray-300 rounded focus:ring-medical-green focus:ring-2"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor={`${name}-${option.value || option}`} className="font-medium text-gray-700">
                  {option.label || option}
                </label>
                {option.description && (
                  <p className="text-gray-500">{option.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        {error && (
          <p className="text-red-600 text-sm flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-gray-500 text-sm">{helperText}</p>
        )}
      </div>
    );
  }

  // Single checkbox
  return (
    <div className="space-y-2">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="w-4 h-4 text-medical-green border-gray-300 rounded focus:ring-medical-green focus:ring-2"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={name} className="font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      </div>
      {error && (
        <p className="text-red-600 text-sm flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-gray-500 text-sm">{helperText}</p>
      )}
    </div>
  );
};

export default FormCheckbox;