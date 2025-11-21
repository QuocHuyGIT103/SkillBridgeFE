import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { ScheduleConflictResult } from "../../types/scheduleConflict.types";

interface ScheduleConflictAlertProps {
  conflict: ScheduleConflictResult;
  isChecking: boolean;
  hasChecked: boolean;
}

const ScheduleConflictAlert: React.FC<ScheduleConflictAlertProps> = ({
  conflict,
  isChecking,
  hasChecked,
}) => {
  // Show loading state
  if (isChecking) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-blue-700">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-sm">Đang kiểm tra trùng lịch...</span>
        </div>
      </div>
    );
  }

  // Show conflict warning
  if (hasChecked && conflict.hasConflict) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-red-900 mb-2">
              ⚠️ Phát hiện trùng lịch học
            </h4>

            {conflict.tutorConflicts.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-red-800 mb-2">
                  Gia sư đã có lớp học vào:
                </p>
                {conflict.tutorConflicts.map((c, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-red-700 bg-red-100 rounded p-2 mb-2"
                  >
                    <div className="text-xs">
                      • {c.conflictingDays.join(", ")} lúc {c.existingTime}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {conflict.studentConflicts.length > 0 && (
              <div>
                <p className="text-sm text-red-800 mb-2">
                  Học viên đã có lớp học vào:
                </p>
                {conflict.studentConflicts.map((c, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-red-700 bg-red-100 rounded p-2 mb-2"
                  >
                    <div className="text-xs">
                      • {c.conflictingDays.join(", ")} lúc {c.existingTime}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-red-600 mt-3">
              Vui lòng chọn lịch học khác hoặc điều chỉnh giờ học để tránh xung
              đột.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (hasChecked && !conflict.hasConflict) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-green-700">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm font-medium">✓ Lịch học không bị trùng</span>
        </div>
      </div>
    );
  }

  return null;
};

export default ScheduleConflictAlert;
