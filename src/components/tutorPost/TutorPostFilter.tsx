import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FunnelIcon,
  ChevronDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  ComputerDesktopIcon,
  CheckIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import SubjectSelector from "./SubjectSelector";
import PriceInput from "./PriceInput";
import { useTutorPostStore } from "../../store/tutorPost.store";
import { useSubjectStore } from "../../store/subject.store";
import type { TutorPostSearchQuery } from "../../services/tutorPost.service";

interface TutorPostFilterProps {
  filters: TutorPostSearchQuery;
  onFiltersChange: (filters: TutorPostSearchQuery) => void;
  onSearch: () => void;
  onReset: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  isSmartSearchMode?: boolean;
  resultCount?: number;
  className?: string;
}

const STUDENT_LEVELS = [
  {
    value: "TIEU_HOC",
    label: "Tiểu học",
    color: "bg-green-50 border-green-200 text-green-700",
  },
  {
    value: "TRUNG_HOC_CO_SO",
    label: "THCS",
    color: "bg-blue-50 border-blue-200 text-blue-700",
  },
  {
    value: "TRUNG_HOC_PHO_THONG",
    label: "THPT",
    color: "bg-purple-50 border-purple-200 text-purple-700",
  },
  {
    value: "DAI_HOC",
    label: "Đại học",
    color: "bg-indigo-50 border-indigo-200 text-indigo-700",
  },
  {
    value: "NGUOI_DI_LAM",
    label: "Người đi làm",
    color: "bg-orange-50 border-orange-200 text-orange-700",
  },
  {
    value: "KHAC",
    label: "Khác",
    color: "bg-gray-50 border-gray-200 text-gray-700",
  },
];

const TEACHING_MODES = [
  {
    value: "ONLINE",
    label: "Trực tuyến",
    icon: "💻",
    description: "Học qua video call",
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    value: "OFFLINE",
    label: "Trực tiếp",
    icon: "🏠",
    description: "Học tại nhà/trung tâm",
    color: "bg-green-50 border-green-200 hover:bg-green-100",
  },
  {
    value: "BOTH",
    label: "Cả hai",
    icon: "🔄",
    description: "Linh hoạt cả hai hình thức",
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
  },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Mới nhất", order: "desc", icon: "⏰" },
  { value: "pricePerSession", label: "Giá thấp", order: "asc", icon: "💰" },
  { value: "pricePerSession", label: "Giá cao", order: "desc", icon: "💎" },
  { value: "viewCount", label: "Phổ biến", order: "desc", icon: "👁️" },
  { value: "contactCount", label: "Hot", order: "desc", icon: "📞" },
  { value: "rating", label: "Đánh giá cao", order: "desc", icon: "⭐" },
];

const PRICE_PRESETS = [
  { label: "100K-300K", min: 100000, max: 300000 },
  { label: "300K-500K", min: 300000, max: 500000 },
  { label: "500K-1M", min: 500000, max: 1000000 },
  { label: "Trên 1M", min: 1000000, max: undefined },
];

const RATING_PRESETS = [
  { label: "⭐ 5.0", value: 5 },
  { label: "⭐ 4.8+", value: 4.8 },
  { label: "⭐ 4.5+", value: 4.5 },
  { label: "⭐ 4.0+", value: 4 },
];

const TutorPostFilter: React.FC<TutorPostFilterProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  isLoading = false,
  disabled = false,
  isSmartSearchMode = false,
  resultCount,
  className = "",
}) => {
  // Local state
  const [localFilters, setLocalFilters] =
    useState<TutorPostSearchQuery>(filters);
  const [isMobile, setIsMobile] = useState(false);

  // DROPDOWN STATES
  const [openDropdowns, setOpenDropdowns] = useState<{
    subjects: boolean;
    studentLevel: boolean;
    teachingMode: boolean;
    price: boolean;
    location: boolean;
    sort: boolean;
    quality: boolean;
  }>({
    subjects: false,
    studentLevel: false,
    teachingMode: false,
    price: false,
    location: false,
    sort: false,
    quality: false,
  });

  // Store hooks
  const {
    filterOptions,
    filterLoading,
    provinces,
    districts,
    wards,
    locationLoading,
    getFilterOptions,
    getDistrictsByProvince,
    getWardsByDistrict,
    resetFilters,
    error,
    clearError,
  } = useTutorPostStore();

  // Subject store
  const { activeSubjects, getActiveSubjects, isLoading: subjectsLoading } = useSubjectStore();

  // Ref for click outside detection
  const filterContainerRef = useRef<HTMLDivElement>(null);

  // Click outside handler to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(event.target as Node)) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (localFilters.search && localFilters.search.trim() !== "") {
      const timer = setTimeout(() => {
        onFiltersChange(localFilters);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [localFilters.search, onFiltersChange, localFilters]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    getFilterOptions().catch((err) => {
      console.error("Failed to load filter options:", err);
    });
  }, [getFilterOptions]);

  useEffect(() => {
    if (activeSubjects.length === 0) {
      getActiveSubjects();
    }
  }, [activeSubjects.length, getActiveSubjects]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const toggleDropdown = (dropdownName: keyof typeof openDropdowns) => {
    setOpenDropdowns((prev) => ({
      ...Object.keys(prev).reduce(
        (acc, key) => ({ ...acc, [key]: false }),
        {} as typeof prev
      ),
      [dropdownName]: !prev[dropdownName],
    }));
  };

  const closeAllDropdowns = () => {
    setOpenDropdowns({
      subjects: false,
      studentLevel: false,
      teachingMode: false,
      price: false,
      location: false,
      sort: false,
      quality: false,
    });
  };

  const updateFilter = useCallback(
    <K extends keyof TutorPostSearchQuery>(
      key: K,
      value: TutorPostSearchQuery[K]
    ) => {
      const newFilters = { ...localFilters, [key]: value };
      setLocalFilters(newFilters);

      if (key !== "search") {
        onFiltersChange(newFilters);
      }
    },
    [localFilters, onFiltersChange]
  );

  const handleSearchChange = useCallback(
    (searchValue: string) => {
      const trimmedValue = searchValue.trim();
      const newFilters = {
        ...localFilters,
        search: trimmedValue || undefined,
      };
      setLocalFilters(newFilters);
    },
    [localFilters]
  );

  const handlePriceChange = useCallback(
    (type: "min" | "max", value: number) => {
      if (type === "min") {
        updateFilter("priceMin", value > 0 ? value : undefined);
      } else {
        updateFilter("priceMax", value > 0 ? value : undefined);
      }
    },
    [updateFilter]
  );

  const handlePricePreset = useCallback(
    (preset: (typeof PRICE_PRESETS)[0]) => {
      updateFilter("priceMin", preset.min);
      updateFilter("priceMax", preset.max);
      closeAllDropdowns();
    },
    [updateFilter]
  );

  const handleSortChange = useCallback(
    (sortValue: string) => {
      const option = SORT_OPTIONS.find(
        (opt) => `${opt.value}_${opt.order}` === sortValue
      );
      if (option) {
        updateFilter("sortBy", option.value as any);
        updateFilter("sortOrder", option.order as any);
        closeAllDropdowns();
      }
    },
    [updateFilter]
  );

  const handleProvinceChange = useCallback(
    (provinceCode: string) => {
      updateFilter("province", provinceCode || undefined);
      updateFilter("district", undefined);

      if (provinceCode) {
        getDistrictsByProvince(provinceCode).catch((err) => {
          console.error("Failed to load districts:", err);
        });
      }
    },
    [updateFilter, getDistrictsByProvince]
  );

  const handleDistrictChange = useCallback(
    (districtCode: string) => {
      updateFilter("district", districtCode || undefined);

      if (districtCode) {
        getWardsByDistrict(districtCode).catch((err) => {
          console.error("Failed to load wards:", err);
        });
      }
    },
    [updateFilter, getWardsByDistrict]
  );

  const getCurrentSortValue = () => {
    return `${localFilters.sortBy || "createdAt"}_${localFilters.sortOrder || "desc"
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
      localFilters.district ||
      localFilters.search ||
      localFilters.minRating ||
      localFilters.minReviews
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.subjects?.length) count++;
    if (localFilters.teachingMode) count++;
    if (localFilters.studentLevel?.length) count++;
    if (localFilters.priceMin || localFilters.priceMax) count++;
    if (localFilters.province) count++;
    if (localFilters.search) count++;
    if (localFilters.minRating || localFilters.minReviews) count++;
    return count;
  };

  const getFilterDisplayText = (filterType: string) => {
    switch (filterType) {
      case "subjects":
        return localFilters.subjects?.length
          ? `${localFilters.subjects.length} môn học`
          : "Chọn môn học";

      case "studentLevel":
        return localFilters.studentLevel?.length
          ? `${localFilters.studentLevel.length} đối tượng`
          : "Đối tượng học viên";

      case "teachingMode":
        const mode = TEACHING_MODES.find(
          (m) => m.value === localFilters.teachingMode
        );
        return mode ? `${mode.icon} ${mode.label}` : "Hình thức dạy";

      case "price":
        if (localFilters.priceMin || localFilters.priceMax) {
          const min = localFilters.priceMin
            ? `${Math.round(localFilters.priceMin / 1000)}K`
            : "0";
          const max = localFilters.priceMax
            ? `${Math.round(localFilters.priceMax / 1000)}K`
            : "∞";
          return `${min} - ${max}`;
        }
        return "Khoảng giá";

      case "location":
        if (localFilters.province) {
          const province = provinces.find(
            (p) => p.code === localFilters.province
          );
          return province?.name || "Đã chọn tỉnh";
        }
        return "Khu vực";

      case "quality": {
        const parts: string[] = [];
        if (localFilters.minRating) {
          parts.push(`${localFilters.minRating.toFixed(1)}★+`);
        }
        if (localFilters.minReviews) {
          parts.push(`${localFilters.minReviews}+ đánh giá`);
        }
        return parts.length ? parts.join(" • ") : "Chất lượng";
      }

      case "sort":
        const currentSort = SORT_OPTIONS.find(
          (opt) => `${opt.value}_${opt.order}` === getCurrentSortValue()
        );
        return currentSort
          ? `${currentSort.icon} ${currentSort.label}`
          : "Sắp xếp";

      default:
        return "Chọn";
    }
  };

  return (
    <motion.div
      ref={filterContainerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-visible relative ${className} ${disabled ? "opacity-50 pointer-events-none" : ""
        }`}
      style={{ zIndex: 20 }}
    >
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm flex-shrink-0">
              <FunnelIcon className="w-5 h-5 text-blue-600" />
            </div>
            {/* ✅ TĂNG CỠ CHỮ */}
            <h3 className="text-base font-bold text-gray-900 truncate">
              Bộ lọc {isSmartSearchMode && "🤖"}
            </h3>
            {getActiveFilterCount() > 0 && (
              // ✅ TĂNG CỠ CHỮ
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-sm rounded-full flex-shrink-0">
                {getActiveFilterCount()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {resultCount !== undefined && (
              <div className="bg-white px-3 py-1.5 rounded-md border border-gray-200">
                {/* ✅ TĂNG CỠ CHỮ */}
                <span className="text-base font-semibold text-gray-900">
                  {resultCount.toLocaleString()}
                </span>
              </div>
            )}
            {hasActiveFilters() && (
              <button
                onClick={onReset}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Xóa bộ lọc"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={
              disabled
                ? "Tìm kiếm bị tắt trong chế độ AI"
                : "Tìm kiếm gia sư..."
            }
            value={localFilters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !disabled) {
                onSearch();
              }
            }}
            // ✅ TĂNG CỠ CHỮ VÀ PADDING
            className="w-full pl-12 pr-28 py-2.5 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
            disabled={disabled}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {localFilters.search && (
              <button
                onClick={() => handleSearchChange("")}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <button
              onClick={onSearch}
              disabled={isLoading || disabled}
              // ✅ TĂNG CỠ CHỮ VÀ PADDING
              className="px-4 py-1.5 bg-blue-600 text-white text-base rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "⏳" : "🔍"}
            </button>
          </div>
        </div>
      </div>

      {/* FILTER DROPDOWNS */}
      <div className="px-4 py-3 relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Subjects Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("subjects")}
              className={`w-full px-3 py-2.5 text-sm font-medium border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between ${localFilters.subjects?.length
                  ? "border-blue-400 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-700"
                }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <AcademicCapIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-left">
                  {getFilterDisplayText("subjects")}
                </span>
              </div>
              <ChevronDownIcon
                className={`w-4 h-4 flex-shrink-0 transition-transform ${openDropdowns.subjects ? "rotate-180" : ""
                  }`}
              />
            </button>

            <AnimatePresence>
              {openDropdowns.subjects && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl"
                  style={{ zIndex: 50, minWidth: '300px', maxHeight: '400px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div 
                    className="p-3 max-h-96 overflow-y-auto"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    <div className="space-y-2">
                      {activeSubjects && activeSubjects.length > 0 ? (
                        activeSubjects.map((subject: any) => {
                          const isSelected = (localFilters.subjects || []).includes(subject._id);
                          return (
                            <label
                              key={subject._id}
                              className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-blue-50 border border-blue-200"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const currentSubjects = localFilters.subjects || [];
                                  const newSubjects = e.target.checked
                                    ? [...currentSubjects, subject._id]
                                    : currentSubjects.filter((id) => id !== subject._id);
                                  updateFilter(
                                    "subjects",
                                    newSubjects.length > 0 ? newSubjects : undefined
                                  );
                                }}
                                className="mr-2 h-4 w-4"
                              />
                              <span className="text-sm">{subject.name}</span>
                            </label>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-2">Không có môn học</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Student Level Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("studentLevel")}
              className={`w-full px-3 py-2.5 text-sm font-medium border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between ${localFilters.studentLevel?.length
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-gray-200 text-gray-700"
                }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-sm flex-shrink-0">🎓</span>
                <span className="truncate text-left">
                  {getFilterDisplayText("studentLevel")}
                </span>
              </div>
              <ChevronDownIcon
                className={`w-4 h-4 flex-shrink-0 transition-transform ${openDropdowns.studentLevel ? "rotate-180" : ""
                  }`}
              />
            </button>

            <AnimatePresence>
              {openDropdowns.studentLevel && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-3"
                  style={{ zIndex: 50, minWidth: '250px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-1 gap-2">
                    {STUDENT_LEVELS.map((level) => {
                      const isSelected = (
                        localFilters.studentLevel || []
                      ).includes(level.value);
                      return (
                        <label
                          key={level.value}
                          className={`flex items-center p-2 rounded cursor-pointer transition-colors ${isSelected
                              ? "bg-green-50 border border-green-200"
                              : "hover:bg-gray-50"
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const currentLevels =
                                localFilters.studentLevel || [];
                              const newLevels = e.target.checked
                                ? [...currentLevels, level.value]
                                : currentLevels.filter(
                                  (l) => l !== level.value
                                );
                              updateFilter(
                                "studentLevel",
                                newLevels.length > 0 ? newLevels : undefined
                              );
                            }}
                            className="mr-2 h-4 w-4"
                          />
                          {/* ✅ TĂNG CỠ CHỮ */}
                          <span className="text-base">{level.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Teaching Mode Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("teachingMode")}
              className={`w-full px-3 py-2.5 text-sm font-medium border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between ${localFilters.teachingMode
                  ? "border-purple-400 bg-purple-50 text-purple-700"
                  : "border-gray-200 text-gray-700"
                }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <ComputerDesktopIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-left">
                  {getFilterDisplayText("teachingMode")}
                </span>
              </div>
              <ChevronDownIcon
                className={`w-4 h-4 flex-shrink-0 transition-transform ${openDropdowns.teachingMode ? "rotate-180" : ""
                  }`}
              />
            </button>

            <AnimatePresence>
              {openDropdowns.teachingMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-3"
                  style={{ zIndex: 50, minWidth: '280px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-2">
                    {TEACHING_MODES.map((mode) => {
                      const isSelected =
                        localFilters.teachingMode === mode.value;
                      return (
                        <button
                          key={mode.value}
                          onClick={() => {
                            updateFilter(
                              "teachingMode",
                              isSelected ? undefined : (mode.value as any)
                            );
                          }}
                          className={`w-full p-2.5 rounded text-left transition-colors flex items-center gap-3 ${isSelected
                              ? "bg-purple-50 border border-purple-200 text-purple-700"
                              : "hover:bg-gray-50"
                            }`}
                        >
                          <span className="text-xl">{mode.icon}</span>
                          <div>
                            {/* ✅ TĂNG CỠ CHỮ */}
                            <div className="text-base font-medium">
                              {mode.label}
                            </div>
                            <div className="text-sm text-gray-500">
                              {mode.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Price Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("price")}
              className={`w-full px-3 py-2.5 text-sm font-medium border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between ${localFilters.priceMin || localFilters.priceMax
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-gray-200 text-gray-700"
                }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <CurrencyDollarIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-left">
                  {getFilterDisplayText("price")}
                </span>
              </div>
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform ${openDropdowns.price ? "rotate-180" : ""
                  }`}
              />
            </button>

            <AnimatePresence>
              {openDropdowns.price && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-4"
                  style={{ zIndex: 50, minWidth: '320px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Price Presets */}
                  <div className="mb-3">
                    {/* ✅ TĂNG CỠ CHỮ */}
                    <p className="text-base text-gray-600 mb-2">
                      Khoảng giá phổ biến:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {PRICE_PRESETS.map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => handlePricePreset(preset)}
                          // ✅ TĂNG CỠ CHỮ VÀ PADDING
                          className="px-2 py-1.5 text-base bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Price */}
                  <div className="grid grid-cols-2 gap-3">
                    <PriceInput
                      label="Tối thiểu"
                      value={localFilters.priceMin || 0}
                      onChange={(value) => handlePriceChange("min", value)}
                      min={0}
                      max={10000000}
                    />
                    <PriceInput
                      label="Tối đa"
                      value={localFilters.priceMax || 0}
                      onChange={(value) => handlePriceChange("max", value)}
                      min={0}
                      max={10000000}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quality Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("quality")}
              className={`w-full px-3 py-2.5 text-sm font-medium border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between ${localFilters.minRating || localFilters.minReviews
                  ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                  : "border-gray-200 text-gray-700"
                }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-sm flex-shrink-0">⭐</span>
                <span className="truncate text-left">
                  {getFilterDisplayText("quality")}
                </span>
              </div>
              <ChevronDownIcon
                className={`w-4 h-4 flex-shrink-0 transition-transform ${openDropdowns.quality ? "rotate-180" : ""
                  }`}
              />
            </button>

            <AnimatePresence>
              {openDropdowns.quality && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-4"
                  style={{ zIndex: 50, minWidth: '320px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-4">
                    <div>
                      <p className="text-base text-gray-600 mb-2">
                        Ưu tiên gia sư được đánh giá cao:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {RATING_PRESETS.map((preset) => {
                          const isSelected =
                            Number(localFilters.minRating?.toFixed(1)) === preset.value;
                          return (
                            <button
                              key={preset.value}
                              onClick={() => {
                                updateFilter(
                                  "minRating",
                                  isSelected ? undefined : preset.value
                                );
                              }}
                              className={`px-3 py-2 rounded-lg text-base border transition-colors ${isSelected
                                  ? "border-yellow-500 bg-yellow-50 text-yellow-800"
                                  : "border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => updateFilter("minRating", undefined)}
                        className="mt-2 text-sm text-gray-500 underline"
                      >
                        Xóa lọc số sao
                      </button>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-1">
                        Số lượt đánh giá tối thiểu
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={0}
                          value={
                            localFilters.minReviews !== undefined
                              ? localFilters.minReviews
                              : ""
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            updateFilter(
                              "minReviews",
                              value === "" ? undefined : Math.max(0, Number(value))
                            );
                          }}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-base focus:ring-1 focus:ring-blue-500"
                          placeholder="Ví dụ 5"
                        />
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          lượt
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          updateFilter("minRating", undefined);
                          updateFilter("minReviews", undefined);
                        }}
                        className="text-sm text-gray-500 underline"
                      >
                        Xóa tất cả
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Location Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("location")}
              className={`w-full px-3 py-2.5 text-sm font-medium border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between ${localFilters.province
                  ? "border-red-400 bg-red-50 text-red-700"
                  : "border-gray-200 text-gray-700"
                }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-left">
                  {getFilterDisplayText("location")}
                </span>
              </div>
              <ChevronDownIcon
                className={`w-4 h-4 flex-shrink-0 transition-transform ${openDropdowns.location ? "rotate-180" : ""
                  }`}
              />
            </button>

            <AnimatePresence>
              {openDropdowns.location && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-3 max-h-96 overflow-y-auto"
                  style={{ zIndex: 50, minWidth: '280px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tỉnh/Thành phố
                      </label>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        <button
                          onClick={() => {
                            updateFilter("province", undefined);
                            updateFilter("district", undefined);
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            !localFilters.province
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          Tất cả tỉnh/thành
                        </button>
                        {provinces.map((province) => (
                          <button
                            key={province.code}
                            onClick={() => handleProvinceChange(province.code)}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              localFilters.province === province.code
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {province.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {localFilters.province && districts.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quận/Huyện
                        </label>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          <button
                            onClick={() => updateFilter("district", undefined)}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              !localFilters.district
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            Tất cả quận/huyện
                          </button>
                          {districts.map((district) => (
                            <button
                              key={district.code}
                              onClick={() => handleDistrictChange(district.code)}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                localFilters.district === district.code
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              {district.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("sort")}
              // ✅ TĂNG CỠ CHỮ VÀ PADDING
              className="w-full px-3 py-2.5 text-base border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-base">📊</span>
                <span className="truncate">{getFilterDisplayText("sort")}</span>
              </div>
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform ${openDropdowns.sort ? "rotate-180" : ""
                  }`}
              />
            </button>

            <AnimatePresence>
              {openDropdowns.sort && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-2"
                  style={{ zIndex: 50, minWidth: '200px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-1">
                    {SORT_OPTIONS.map((option, index) => {
                      const isSelected =
                        getCurrentSortValue() ===
                        `${option.value}_${option.order}`;
                      return (
                        <button
                          key={index}
                          onClick={() =>
                            handleSortChange(`${option.value}_${option.order}`)
                          }
                          className={`w-full p-2.5 rounded text-left transition-colors flex items-center gap-3 ${isSelected
                              ? "bg-indigo-50 text-indigo-700"
                              : "hover:bg-gray-50"
                            }`}
                        >
                          {/* ✅ TĂNG CỠ CHỮ */}
                          <span className="text-base">{option.icon}</span>
                          <span className="text-base">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center min-w-0 flex-1">
              <XMarkIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="ml-2 text-base text-red-600 truncate">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CLICK OUTSIDE TO CLOSE DROPDOWNS */}
      {Object.values(openDropdowns).some(Boolean) && (
        <div
          className="fixed inset-0"
          style={{ zIndex: 9998 }}
          onClick={closeAllDropdowns}
        />
      )}
    </motion.div>
  );
};

export default TutorPostFilter;
