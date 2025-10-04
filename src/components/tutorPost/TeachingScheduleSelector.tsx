import React, { useState } from "react";

export interface TimeSlot {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

export interface TeachingSchedule {
  [key: string]: TimeSlot[]; // key là thứ trong tuần (MON, TUE, ...)
}

interface TeachingScheduleSelectorProps {
  value: TeachingSchedule;
  onChange: (schedule: TeachingSchedule) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

const DAYS_OF_WEEK = [
  { key: "MON", label: "Thứ 2", shortLabel: "T2" },
  { key: "TUE", label: "Thứ 3", shortLabel: "T3" },
  { key: "WED", label: "Thứ 4", shortLabel: "T4" },
  { key: "THU", label: "Thứ 5", shortLabel: "T5" },
  { key: "FRI", label: "Thứ 6", shortLabel: "T6" },
  { key: "SAT", label: "Thứ 7", shortLabel: "T7" },
  { key: "SUN", label: "Chủ nhật", shortLabel: "CN" },
];

const PRESET_TIME_SLOTS = [
  { label: "Sáng sớm", start: "06:00", end: "08:00" },
  { label: "Sáng", start: "08:00", end: "10:00" },
  { label: "Sáng muộn", start: "10:00", end: "12:00" },
  { label: "Trưa", start: "12:00", end: "14:00" },
  { label: "Chiều", start: "14:00", end: "16:00" },
  { label: "Chiều muộn", start: "16:00", end: "18:00" },
  { label: "Tối", start: "18:00", end: "20:00" },
  { label: "Tối muộn", start: "20:00", end: "22:00" },
];

const TeachingScheduleSelector: React.FC<TeachingScheduleSelectorProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  className = "",
  required = false,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>("MON");
  const [newTimeSlot, setNewTimeSlot] = useState<TimeSlot>({
    start: "08:00",
    end: "10:00",
  });
  const [showAddSlot, setShowAddSlot] = useState<string | null>(null);

  const addTimeSlot = (day: string) => {
    if (!isValidTimeSlot(newTimeSlot)) return;

    const daySchedule = value[day] || [];

    // Check for conflicts
    const hasConflict = daySchedule.some((slot) =>
      isTimeSlotConflict(newTimeSlot, slot)
    );

    if (hasConflict) {
      alert("Khoảng thời gian này bị trùng với lịch đã có!");
      return;
    }

    const newSchedule = {
      ...value,
      [day]: [...daySchedule, newTimeSlot].sort((a, b) =>
        a.start.localeCompare(b.start)
      ),
    };

    onChange(newSchedule);
    setNewTimeSlot({ start: "08:00", end: "10:00" });
    setShowAddSlot(null);
  };

  const removeTimeSlot = (day: string, index: number) => {
    const daySchedule = value[day] || [];
    const newDaySchedule = daySchedule.filter((_, i) => i !== index);

    const newSchedule = { ...value };
    if (newDaySchedule.length === 0) {
      delete newSchedule[day];
    } else {
      newSchedule[day] = newDaySchedule;
    }

    onChange(newSchedule);
  };

  const addPresetSlot = (day: string, preset: TimeSlot) => {
    const daySchedule = value[day] || [];

    // Check for conflicts
    const hasConflict = daySchedule.some((slot) =>
      isTimeSlotConflict(preset, slot)
    );

    if (hasConflict) {
      alert("Khoảng thời gian này bị trùng với lịch đã có!");
      return;
    }

    const newSchedule = {
      ...value,
      [day]: [...daySchedule, preset].sort((a, b) =>
        a.start.localeCompare(b.start)
      ),
    };

    onChange(newSchedule);
    setShowAddSlot(null);
  };

  const isValidTimeSlot = (slot: TimeSlot): boolean => {
    return slot.start < slot.end;
  };

  const isTimeSlotConflict = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
    return !(slot1.end <= slot2.start || slot1.start >= slot2.end);
  };

  const formatTimeSlot = (slot: TimeSlot): string => {
    return `${slot.start} - ${slot.end}`;
  };

  const getTotalHoursPerWeek = (): number => {
    let total = 0;
    Object.values(value).forEach((daySlots) => {
      daySlots.forEach((slot) => {
        const start = new Date(`2000-01-01 ${slot.start}`);
        const end = new Date(`2000-01-01 ${slot.end}`);
        total += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      });
    });
    return total;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Lịch dạy trong tuần
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <span className="text-sm text-gray-500">
          Tổng: {getTotalHoursPerWeek().toFixed(1)} giờ/tuần
        </span>
      </div>

      {/* Schedule Grid */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day.key}
            className={`
              border-b border-gray-200 last:border-b-0
              ${selectedDay === day.key ? "bg-blue-50" : "bg-white"}
            `}
          >
            {/* Day Header */}
            <div
              className={`
                p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between
                ${selectedDay === day.key ? "bg-blue-100" : ""}
                ${disabled ? "cursor-not-allowed opacity-50" : ""}
              `}
              onClick={() => !disabled && setSelectedDay(day.key)}
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium text-sm">{day.label}</span>
                {value[day.key] && value[day.key].length > 0 && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {value[day.key].length} khung giờ
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {!disabled && (
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddSlot(showAddSlot === day.key ? null : day.key);
                    }}
                  >
                    + Thêm khung giờ
                  </button>
                )}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    selectedDay === day.key ? "transform rotate-180" : ""
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
              </div>
            </div>

            {/* Day Schedule */}
            {selectedDay === day.key && (
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                {/* Existing time slots */}
                {value[day.key] && value[day.key].length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {value[day.key].map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white p-2 rounded border"
                      >
                        <span className="text-sm font-mono">
                          {formatTimeSlot(slot)}
                        </span>
                        {!disabled && (
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(day.key, index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-3">
                    Chưa có khung giờ nào
                  </p>
                )}

                {/* Add new time slot */}
                {showAddSlot === day.key && !disabled && (
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <h4 className="text-sm font-medium mb-3">
                      Thêm khung giờ mới
                    </h4>

                    {/* Preset time slots */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-2">
                        Khung giờ có sẵn:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {PRESET_TIME_SLOTS.map((preset, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => addPresetSlot(day.key, preset)}
                            className="text-left text-xs p-2 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300"
                          >
                            <div className="font-medium">{preset.label}</div>
                            <div className="text-gray-500">
                              {formatTimeSlot(preset)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom time slot */}
                    <div className="border-t pt-3">
                      <p className="text-xs text-gray-600 mb-2">Tùy chỉnh:</p>
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={newTimeSlot.start}
                          onChange={(e) =>
                            setNewTimeSlot({
                              ...newTimeSlot,
                              start: e.target.value,
                            })
                          }
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        />
                        <span className="text-xs text-gray-500">đến</span>
                        <input
                          type="time"
                          value={newTimeSlot.end}
                          onChange={(e) =>
                            setNewTimeSlot({
                              ...newTimeSlot,
                              end: e.target.value,
                            })
                          }
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        />
                      </div>

                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          type="button"
                          onClick={() => addTimeSlot(day.key)}
                          disabled={!isValidTimeSlot(newTimeSlot)}
                          className="text-xs px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          Thêm
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddSlot(null)}
                          className="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Tóm tắt lịch dạy:</h4>
        {Object.keys(value).length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có lịch dạy nào</p>
        ) : (
          <div className="space-y-1">
            {Object.entries(value).map(([dayKey, slots]) => {
              const dayLabel =
                DAYS_OF_WEEK.find((d) => d.key === dayKey)?.shortLabel ||
                dayKey;
              return (
                <div key={dayKey} className="text-sm">
                  <span className="font-medium">{dayLabel}:</span>{" "}
                  <span className="text-gray-600">
                    {slots.map((slot) => formatTimeSlot(slot)).join(", ")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default TeachingScheduleSelector;
