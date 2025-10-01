import React, { useState, useEffect } from "react";

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  showPresets?: boolean;
}

const PRICE_PRESETS = [
  { label: "100k/giờ", value: 100000 },
  { label: "150k/giờ", value: 150000 },
  { label: "200k/giờ", value: 200000 },
  { label: "250k/giờ", value: 250000 },
  { label: "300k/giờ", value: 300000 },
  { label: "400k/giờ", value: 400000 },
  { label: "500k/giờ", value: 500000 },
  { label: "1M/giờ", value: 1000000 },
];

const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  label = "Học phí (VNĐ/giờ)",
  placeholder = "Nhập học phí...",
  error,
  disabled = false,
  className = "",
  required = false,
  min = 100000,
  max = 10000000,
  step = 50000,
  showPresets = true,
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);

  // Format number to VND currency
  const formatVND = (amount: number): string => {
    if (isNaN(amount) || amount === 0) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format number with thousands separator
  const formatNumber = (amount: number): string => {
    if (isNaN(amount) || amount === 0) return "";
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  // Update input value when prop value changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value ? formatNumber(value) : "");
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Allow only digits and common separators during typing
    const cleanValue = rawValue.replace(/[^\d]/g, "");
    const numericValue = parseInt(cleanValue) || 0;

    setInputValue(cleanValue ? formatNumber(numericValue) : "");

    // Validate range
    if (numericValue >= min && numericValue <= max) {
      onChange(numericValue);
    } else if (numericValue > max) {
      onChange(max);
    } else if (numericValue < min && numericValue > 0) {
      onChange(min);
    } else if (numericValue === 0) {
      onChange(0);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);

    // Ensure value is within range when losing focus
    if (value < min && value > 0) {
      onChange(min);
    } else if (value > max) {
      onChange(max);
    }
  };

  const handlePresetClick = (presetValue: number) => {
    onChange(presetValue);
    setInputValue(formatNumber(presetValue));
  };

  const incrementValue = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
  };

  const decrementValue = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
  };

  const getValidationMessage = (): string | null => {
    if (value === 0) return null;

    if (value < min) {
      return `Học phí tối thiểu là ${formatVND(min)}`;
    }

    if (value > max) {
      return `Học phí tối đa là ${formatVND(max)}`;
    }

    return null;
  };

  const validationMessage = getValidationMessage();

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input with controls */}
      <div className="relative">
        <div
          className={`
          flex items-center border rounded-lg overflow-hidden
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
          ${
            error || validationMessage
              ? "border-red-500 ring-1 ring-red-500"
              : isFocused
              ? "border-blue-500 ring-1 ring-blue-500"
              : "border-gray-300"
          }
          transition-colors duration-200
        `}
        >
          {/* Decrease button */}
          <button
            type="button"
            onClick={decrementValue}
            disabled={disabled || value <= min}
            className={`
              px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
              transition-colors duration-200
            `}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>

          {/* Input field */}
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none
              ${disabled ? "cursor-not-allowed" : ""}
              text-right font-mono
            `}
          />

          {/* Currency indicator */}
          <span className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border-l border-gray-200">
            VNĐ
          </span>

          {/* Increase button */}
          <button
            type="button"
            onClick={incrementValue}
            disabled={disabled || value >= max}
            className={`
              px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
              transition-colors duration-200
            `}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        {/* Current value display */}
        {value > 0 && (
          <div className="mt-1 text-xs text-gray-600 text-right">
            {formatVND(value)} / giờ học
          </div>
        )}
      </div>

      {/* Preset buttons */}
      {showPresets && !disabled && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">Mức học phí phổ biến:</p>
          <div className="grid grid-cols-4 gap-2">
            {PRICE_PRESETS.map((preset, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handlePresetClick(preset.value)}
                className={`
                  px-2 py-1 text-xs rounded border transition-colors duration-200
                  ${
                    value === preset.value
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                  }
                `}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Range info */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>Tối thiểu: {formatVND(min)}</span>
        <span>Tối đa: {formatVND(max)}</span>
      </div>

      {/* Error messages */}
      {(error || validationMessage) && (
        <p className="text-sm text-red-600">{error || validationMessage}</p>
      )}

      {/* Helper text */}
      {!error && !validationMessage && (
        <p className="text-xs text-gray-500">
          Học phí sẽ được tính theo giờ. Bạn có thể thương lượng với học viên
          khi nhận lớp.
        </p>
      )}
    </div>
  );
};

export default PriceInput;
