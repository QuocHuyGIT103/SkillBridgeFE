import React, { useState, useEffect, useRef } from "react";

interface TimePicker24hProps {
  value: string; // Format: "HH:mm"
  onChange: (time: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  // Smart features
  sessionDuration?: number; // Duration in minutes
  startTimeValue?: string; // Start time for calculating end time suggestions
  isEndTime?: boolean; // Whether this is an end time picker
  onEndTimeSuggestions?: (suggestions: string[]) => void; // Callback for end time suggestions
}

const TimePicker24h: React.FC<TimePicker24hProps> = ({
  value,
  onChange,
  className = "",
  placeholder = "Chọn giờ",
  disabled = false,
  sessionDuration = 60,
  startTimeValue,
  isEndTime = false,
  onEndTimeSuggestions: _onEndTimeSuggestions,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState("00");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(":");
      setSelectedHour(hour || "00");
      setSelectedMinute(minute || "00");
    }
  }, [value]);

  // Reset end time when start time changes (for end time picker)
  useEffect(() => {
    if (isEndTime && startTimeValue) {
      // Reset to first calculated option when start time changes
      const endTimeOptions = calculateEndTimeOptions(
        startTimeValue,
        sessionDuration
      );
      if (
        endTimeOptions.length > 0 &&
        !endTimeOptions.find((opt) => opt.value === value)
      ) {
        onChange(endTimeOptions[0].value);
      }
    }
  }, [startTimeValue, sessionDuration, isEndTime, value, onChange]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Calculate end time options for combo box (multiple sessions)
  const calculateEndTimeOptions = (startTime: string, duration: number) => {
    if (!startTime) return [];

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;

    const options: Array<{ value: string; label: string }> = [];

    // Generate multiple sessions until 23:00
    for (let session = 1; session <= 20; session++) {
      const endTotalMinutes = startTotalMinutes + duration * session;
      const endHour = Math.floor(endTotalMinutes / 60);
      const endMinute = endTotalMinutes % 60;

      // Stop if it goes beyond 23:00
      if (endHour >= 23) break;

      const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
        .toString()
        .padStart(2, "0")}`;

      options.push({
        value: endTime,
        label: `${endTime} (${duration * session} phút)`,
      });
    }

    return options;
  };

  // Generate hour options (00-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return {
      value: hour,
      label: `${hour}`,
    };
  });

  // Generate minute options (00-59) for normal time picker
  const minuteOptions = Array.from({ length: 60 }, (_, i) => {
    const minute = i.toString().padStart(2, "0");
    return {
      value: minute,
      label: minute,
    };
  });

  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour);
    onChange(`${hour}:${selectedMinute}`);
  };

  const handleMinuteSelect = (minute: string) => {
    setSelectedMinute(minute);
    onChange(`${selectedHour}:${minute}`);
  };

  const formatDisplayTime = (hour: string, minute: string) => {
    return `${hour}:${minute}`;
  };

  const getTimePeriod = (hour: string) => {
    const hourNum = parseInt(hour);
    if (hourNum < 3) return "Đêm";
    if (hourNum < 12) return "Sáng";
    if (hourNum < 18) return "Chiều";
    return "Tối";
  };

  // For end time picker, use a simple select instead of time picker
  if (isEndTime && startTimeValue) {
    const endTimeOptions = calculateEndTimeOptions(
      startTimeValue,
      sessionDuration
    );

    return (
      <div className={`relative ${className}`}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
            ${
              disabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                : "bg-white hover:border-gray-400"
            }
          `}
        >
          <option value="">{placeholder}</option>
          {endTimeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {value && (
          <div className="mt-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block">
            {getTimePeriod(value.split(":")[0])}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input Display */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
          text-left flex items-center justify-between
          ${
            disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
              : "bg-white hover:border-gray-400 cursor-pointer"
          }
        `}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value
            ? formatDisplayTime(selectedHour, selectedMinute)
            : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {value && (
        <div className="mt-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block">
          {getTimePeriod(selectedHour)}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">
              Chọn thời gian
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Hour Selection */}
              <div>
                <div className="text-xs font-medium text-gray-600 mb-2">
                  Giờ
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded">
                  {hourOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleHourSelect(option.value)}
                      className={`
                        w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors
                        ${
                          selectedHour === option.value
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700"
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minute Selection */}
              <div>
                <div className="text-xs font-medium text-gray-600 mb-2">
                  Phút
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded">
                  {minuteOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleMinuteSelect(option.value)}
                      className={`
                        w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors
                        ${
                          selectedMinute === option.value
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700"
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Time Display */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900">
                Thời gian đã chọn:{" "}
                {formatDisplayTime(selectedHour, selectedMinute)}
              </div>
              <div className="text-xs text-blue-700 mt-1">
                {getTimePeriod(selectedHour)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onChange(formatDisplayTime(selectedHour, selectedMinute));
                }}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker24h;
