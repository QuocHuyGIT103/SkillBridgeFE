import React from 'react';

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
}

const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  label,
  disabled = false,
  className = "",
  min = 50000,
  max = 10000000,
  step = 10000,
}) => {
  const formatNumber = (amount: number): string => {
    if (isNaN(amount)) return "0";
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/[^\d]/g, "");
    const numericValue = parseInt(cleanValue) || 0;
    onChange(numericValue);
  };

  const handleBlur = () => {
    if (value > 0 && value < min) onChange(min);
    if (value > max) onChange(max);
  };

  const incrementValue = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
  };

  const decrementValue = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-0.5">
          {label}
        </label>
      )}

      <div className="relative">
        <div
          className={`
            flex items-center border rounded-md overflow-hidden
            ${disabled ? "bg-gray-100" : "bg-white"}
            border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500
            transition-colors duration-200
          `}
        >
          <button
            type="button"
            onClick={decrementValue}
            disabled={disabled || value <= min}
            className="px-2 py-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          <input
            type="text"
            value={value === 0 ? '' : formatNumber(value)}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="0"
            disabled={disabled}
            className="flex-1 w-full px-2 py-1.5 text-xs bg-transparent focus:outline-none text-center font-semibold"
          />

          <button
            type="button"
            onClick={incrementValue}
            disabled={disabled || value >= max}
            className="px-2 py-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      
      {value > 0 && (
          <p className="text-center text-xs text-gray-500 italic">
            {formatNumber(value)} đ/buổi
          </p>
      )}
    </div>
  );
};

export default PriceInput;