import React, { useState, useEffect } from "react";
import SubjectSelector from "./SubjectSelector";
import PriceInput from "./PriceInput";
import type { TutorPostSearchQuery } from "../../services/tutorPost.service";

interface TutorPostFilterProps {
  filters: TutorPostSearchQuery;
  onFiltersChange: (filters: TutorPostSearchQuery) => void;
  onSearch: () => void;
  onReset: () => void;
  isLoading?: boolean;
  resultCount?: number;
  className?: string;
}

const STUDENT_LEVELS = [
  { value: "TIEU_HOC", label: "Tiểu học" },
  { value: "TRUNG_HOC_CO_SO", label: "THCS" },
  { value: "TRUNG_HOC_PHO_THONG", label: "THPT" },
  { value: "DAI_HOC", label: "Đại học" },
  { value: "NGUOI_DI_LAM", label: "Người đi làm" },
  { value: "KHAC", label: "Khác" },
];

const TEACHING_MODES = [
  { value: "ONLINE", label: "Trực tuyến", icon: "💻" },
  { value: "OFFLINE", label: "Trực tiếp", icon: "🏠" },
  { value: "BOTH", label: "Cả hai", icon: "🔄" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Mới nhất", order: "desc" },
  { value: "pricePerSession", label: "Giá thấp nhất", order: "asc" },
  { value: "pricePerSession", label: "Giá cao nhất", order: "desc" },
  { value: "viewCount", label: "Xem nhiều nhất", order: "desc" },
];

const TutorPostFilter: React.FC<TutorPostFilterProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  isLoading = false,
  resultCount,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] =
    useState<TutorPostSearchQuery>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = <K extends keyof TutorPostSearchQuery>(
    key: K,
    value: TutorPostSearchQuery[K]
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceChange = (type: "min" | "max", value: number) => {
    if (type === "min") {
      updateFilter("priceMin", value || undefined);
    } else {
      updateFilter("priceMax", value || undefined);
    }
  };

  const handleSortChange = (sortValue: string) => {
    const option = SORT_OPTIONS.find(
      (opt) => `${opt.value}_${opt.order}` === sortValue
    );
    if (option) {
      updateFilter("sortBy", option.value as any);
      updateFilter("sortOrder", option.order as any);
    }
  };

  const getCurrentSortValue = () => {
    return `${localFilters.sortBy || "createdAt"}_${
      localFilters.sortOrder || "desc"
    }`;
  };

  const hasActiveFilters = () => {
    return !!(
      localFilters.subjects?.length ||
      localFilters.teachingMode ||
      localFilters.studentLevel?.length ||
      localFilters.priceMin ||
      localFilters.priceMax ||
      localFilters.province ||
      localFilters.search
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="font-semibold text-gray-900">Bộ lọc tìm kiếm</h3>
            {resultCount !== undefined && (
              <span className="text-sm text-gray-600">
                {resultCount} kết quả
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {hasActiveFilters() && (
              <button
                onClick={onReset}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Xóa bộ lọc
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-600 hover:text-gray-800 lg:hidden"
            >
              <svg
                className={`w-5 h-5 transition-transform ${
                  isExpanded ? "rotate-180" : ""
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
          </div>
        </div>
      </div>

      {/* Filters Content */}
      <div className={`${isExpanded ? "block" : "hidden"} lg:block`}>
        <div className="p-4 space-y-6">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <input
                type="text"
                value={localFilters.search || ""}
                onChange={(e) =>
                  updateFilter("search", e.target.value || undefined)
                }
                placeholder="Tìm theo tên, mô tả..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div>
            <SubjectSelector
              selectedSubjects={localFilters.subjects || []}
              onChange={(subjects) =>
                updateFilter(
                  "subjects",
                  subjects.length > 0 ? subjects : undefined
                )
              }
              placeholder="Chọn môn học..."
              multiple={true}
            />
          </div>

          {/* Teaching Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình thức dạy
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TEACHING_MODES.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() =>
                    updateFilter(
                      "teachingMode",
                      localFilters.teachingMode === mode.value
                        ? undefined
                        : (mode.value as any)
                    )
                  }
                  className={`
                    p-3 text-sm rounded-lg border transition-colors text-center
                    ${
                      localFilters.teachingMode === mode.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }
                  `}
                >
                  <div className="mb-1">{mode.icon}</div>
                  <div className="font-medium">{mode.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Student Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đối tượng học viên
            </label>
            <div className="space-y-2">
              {STUDENT_LEVELS.map((level) => (
                <label key={level.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(localFilters.studentLevel || []).includes(
                      level.value
                    )}
                    onChange={(e) => {
                      const currentLevels = localFilters.studentLevel || [];
                      const newLevels = e.target.checked
                        ? [...currentLevels, level.value]
                        : currentLevels.filter((l) => l !== level.value);
                      updateFilter(
                        "studentLevel",
                        newLevels.length > 0 ? newLevels : undefined
                      );
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {level.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khoảng giá (VNĐ/buổi)
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Từ:</label>
                <PriceInput
                  value={localFilters.priceMin || 0}
                  onChange={(value) => handlePriceChange("min", value)}
                  placeholder="Giá tối thiểu"
                  showPresets={false}
                  min={0}
                  max={10000000}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Đến:</label>
                <PriceInput
                  value={localFilters.priceMax || 0}
                  onChange={(value) => handlePriceChange("max", value)}
                  placeholder="Giá tối đa"
                  showPresets={false}
                  min={0}
                  max={10000000}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa điểm
            </label>
            <div className="space-y-2">
              <select
                value={localFilters.province || ""}
                onChange={(e) => {
                  updateFilter("province", e.target.value || undefined);
                  if (!e.target.value) {
                    updateFilter("district", undefined);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả tỉnh/thành</option>
                <option value="79">TP. Hồ Chí Minh</option>
                <option value="01">Hà Nội</option>
                <option value="48">Đà Nẵng</option>
                {/* Add more provinces as needed */}
              </select>

              {localFilters.province && (
                <select
                  value={localFilters.district || ""}
                  onChange={(e) =>
                    updateFilter("district", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả quận/huyện</option>
                  {/* Add districts based on selected province */}
                  {localFilters.province === "79" && (
                    <>
                      <option value="760">Quận 1</option>
                      <option value="769">Quận 2</option>
                      <option value="770">Quận 3</option>
                    </>
                  )}
                </select>
              )}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sắp xếp theo
            </label>
            <select
              value={getCurrentSortValue()}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map((option, index) => (
                <option key={index} value={`${option.value}_${option.order}`}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex space-x-3">
          <button
            onClick={onSearch}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang tìm...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Tìm kiếm
              </>
            )}
          </button>

          {hasActiveFilters() && (
            <button
              onClick={onReset}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Đặt lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorPostFilter;
