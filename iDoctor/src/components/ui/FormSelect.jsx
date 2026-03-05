import React from 'react';

const FormSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  onBlur,
  error, 
  required = false, 
  options = [],
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  multiple = false,
  helperText
}) => {
  const selectClasses = `
    w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-medical-green focus:border-medical-green
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
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={selectClasses}
        disabled={disabled}
        multiple={multiple}
      >
        {!multiple && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option 
            key={option.value || option} 
            value={option.value || option}
            disabled={option.disabled}
          >
            {option.label || option}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-600 text-sm mt-1 flex items-center">
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

export default FormSelect;