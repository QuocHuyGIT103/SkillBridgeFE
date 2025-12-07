import React, { useEffect, useState } from "react";
import { useSubjectStore } from "../../store/subject.store";
import type { Subject } from "../../services/subject.service";

interface SubjectSelectorProps {
  selectedSubjects: string[];
  onChange: (subjects: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  selectedSubjects,
  onChange,
  multiple = true,
  placeholder = "Chọn môn học...",
  error,
  disabled = false,
  className = "",
  required = false,
}) => {
  const { activeSubjects, getActiveSubjects, isLoading } = useSubjectStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (activeSubjects.length === 0) {
      getActiveSubjects();
    }
  }, [activeSubjects.length, getActiveSubjects]);

  const filteredSubjects = activeSubjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubjectToggle = (subjectId: string) => {
    if (multiple) {
      if (selectedSubjects.includes(subjectId)) {
        onChange(selectedSubjects.filter((id) => id !== subjectId));
      } else {
        onChange([...selectedSubjects, subjectId]);
      }
    } else {
      onChange(selectedSubjects.includes(subjectId) ? [] : [subjectId]);
      setIsOpen(false);
    }
  };

  const getSelectedSubjectNames = () => {
    if (selectedSubjects.length === 0) return placeholder;

    const selectedNames = activeSubjects
      .filter((subject) => selectedSubjects.includes(subject._id))
      .map((subject) => subject.name);

    if (multiple && selectedNames.length > 2) {
      return `${selectedNames.slice(0, 2).join(", ")} và ${
        selectedNames.length - 2
      } môn khác`;
    }

    return selectedNames.join(", ");
  };

  const groupedSubjects = filteredSubjects.reduce((acc, subject) => {
    if (!acc[subject.category]) {
      acc[subject.category] = [];
    }
    acc[subject.category].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);

  const categoryNames: Record<string, string> = {
    TOAN_HOC: "Toán học",
    KHOA_HOC_TU_NHIEN: "Khoa học tự nhiên",
    VAN_HOC_XA_HOI: "Văn học và xã hội",
    NGOAI_NGU: "Ngoại ngữ",
    KHAC: "Khác",
  };

  return (
    <div className={`relative ${className}`}>
      <div className="mb-1">
        {required && <span className="text-red-500">*</span>}
      </div>

      <div
        className={`
          relative w-full min-h-[42px] px-3 py-2 border rounded-lg cursor-pointer
          ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white hover:border-blue-400"
          }
          ${error ? "border-red-500" : "border-gray-300"}
          ${isOpen ? "border-blue-500 ring-1 ring-blue-500" : ""}
          transition-colors duration-200
        `}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className={`
            ${selectedSubjects.length === 0 ? "text-gray-500" : "text-gray-900"}
            text-sm
          `}
          >
            {getSelectedSubjectNames()}
          </span>

          <div className="flex items-center space-x-2">
            {selectedSubjects.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {selectedSubjects.length}
              </span>
            )}
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? "transform rotate-180" : ""
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
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div 
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Tìm kiếm môn học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Options */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <span className="mt-2 block text-sm">Đang tải...</span>
              </div>
            ) : Object.keys(groupedSubjects).length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <span className="text-sm">Không tìm thấy môn học nào</span>
              </div>
            ) : (
              Object.entries(groupedSubjects).map(([category, subjects]) => (
                <div
                  key={category}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <div className="px-3 py-2 bg-gray-50 text-xs font-medium text-gray-600 uppercase tracking-wide">
                    {categoryNames[category] || category}
                  </div>

                  {subjects.map((subject) => (
                    <div
                      key={subject._id}
                      className={`
                        px-3 py-2 cursor-pointer hover:bg-blue-50 flex items-center justify-between
                        ${
                          selectedSubjects.includes(subject._id)
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-700"
                        }
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubjectToggle(subject._id);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type={multiple ? "checkbox" : "radio"}
                          checked={selectedSubjects.includes(subject._id)}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-medium text-sm">
                            {subject.name}
                          </div>
                          {subject.description && (
                            <div className="text-xs text-gray-500 mt-1">
                              {subject.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Selected count */}
          {multiple && selectedSubjects.length > 0 && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
              Đã chọn {selectedSubjects.length} môn học
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default SubjectSelector;
