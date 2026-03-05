import React from 'react';

const FormTextarea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  onBlur,
  error, 
  required = false, 
  placeholder,
  rows = 4,
  className = '',
  disabled = false,
  helperText,
  maxLength,
  showCharCount = false
}) => {
  const textareaClasses = `
    w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
    focus:outline-none focus:ring-2 focus:ring-medical-green focus:border-medical-green
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    ${className}
  `;

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        className={textareaClasses}
        disabled={disabled}
        maxLength={maxLength}
        autoComplete="off"
      />
      <div className="flex justify-between items-start">
        <div>
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
        {showCharCount && (
          <span className={`text-sm ${value?.length > maxLength ? 'text-red-500' : 'text-gray-400'}`}>
            {value?.length || 0}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

export default FormTextarea;