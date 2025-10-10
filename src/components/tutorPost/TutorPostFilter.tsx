import React, { useState, useEffect, useCallback } from "react";
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
  CheckIcon
} from "@heroicons/react/24/outline";
import SubjectSelector from "./SubjectSelector";
import PriceInput from "./PriceInput"; // Đảm bảo import đúng
import { useTutorPostStore } from "../../store/tutorPost.store";
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

// [SỬA] Đã xóa thuộc tính 'icon' không còn sử dụng
const STUDENT_LEVELS = [
  { value: "TIEU_HOC", label: "Tiểu học", color: "bg-green-50 border-green-200 text-green-700" },
  { value: "TRUNG_HOC_CO_SO", label: "THCS", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { value: "TRUNG_HOC_PHO_THONG", label: "THPT", color: "bg-purple-50 border-purple-200 text-purple-700" },
  { value: "DAI_HOC", label: "Đại học", color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
  { value: "NGUOI_DI_LAM", label: "Người đi làm", color: "bg-orange-50 border-orange-200 text-orange-700" },
  { value: "KHAC", label: "Khác", color: "bg-gray-50 border-gray-200 text-gray-700" },
];

const TEACHING_MODES = [
  { 
    value: "ONLINE", 
    label: "Trực tuyến", 
    icon: "💻", 
    description: "Học qua video call",
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100"
  },
  { 
    value: "OFFLINE", 
    label: "Trực tiếp", 
    icon: "🏠", 
    description: "Học tại nhà/trung tâm",
    color: "bg-green-50 border-green-200 hover:bg-green-100"
  },
  { 
    value: "BOTH", 
    label: "Cả hai", 
    icon: "🔄", 
    description: "Linh hoạt cả hai hình thức",
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100"
  },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Mới nhất", order: "desc", icon: "⏰" },
  { value: "pricePerSession", label: "Giá thấp", order: "asc", icon: "💰" },
  { value: "pricePerSession", label: "Giá cao", order: "desc", icon: "💎" },
  { value: "viewCount", label: "Phổ biến", order: "desc", icon: "👁️" },
  { value: "contactCount", label: "Hot", order: "desc", icon: "📞" },
];

const PRICE_PRESETS = [
  { label: "100K-300K", min: 100000, max: 300000 },
  { label: "300K-500K", min: 300000, max: 500000 },
  { label: "500K-1M", min: 500000, max: 1000000 },
  { label: "Trên 1M", min: 1000000, max: undefined },
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
  const [isExpanded, setIsExpanded] = useState(true);
  const [localFilters, setLocalFilters] = useState<TutorPostSearchQuery>(filters);
  const [isMobile, setIsMobile] = useState(false);

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
    clearError
  } = useTutorPostStore();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [isMobile]);

  // Load filter options on mount
  useEffect(() => {
    getFilterOptions().catch(err => {
      console.error('Failed to load filter options:', err);
    });
  }, [getFilterOptions]);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Update filter function
  const updateFilter = useCallback(<K extends keyof TutorPostSearchQuery>(
    key: K,
    value: TutorPostSearchQuery[K]
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  }, [localFilters, onFiltersChange]);

  // Handle price change
  const handlePriceChange = useCallback((type: "min" | "max", value: number) => {
    if (type === "min") {
      updateFilter("priceMin", value > 0 ? value : undefined);
    } else {
      updateFilter("priceMax", value > 0 ? value : undefined);
    }
  }, [updateFilter]);

  // Handle price preset
  const handlePricePreset = useCallback((preset: typeof PRICE_PRESETS[0]) => {
    updateFilter("priceMin", preset.min);
    updateFilter("priceMax", preset.max);
  }, [updateFilter]);

  // Handle sort change
  const handleSortChange = useCallback((sortValue: string) => {
    const option = SORT_OPTIONS.find(
      (opt) => `${opt.value}_${opt.order}` === sortValue
    );
    if (option) {
      updateFilter("sortBy", option.value as any);
      updateFilter("sortOrder", option.order as any);
    }
  }, [updateFilter]);

  // Handle province change
  const handleProvinceChange = useCallback((provinceCode: string) => {
    updateFilter('province', provinceCode || undefined);
    updateFilter('district', undefined);
    
    if (provinceCode) {
      getDistrictsByProvince(provinceCode).catch(err => {
        console.error('Failed to load districts:', err);
      });
    }
  }, [updateFilter, getDistrictsByProvince]);

  // Handle district change
  const handleDistrictChange = useCallback((districtCode: string) => {
    updateFilter('district', districtCode || undefined);
    
    if (districtCode) {
      getWardsByDistrict(districtCode).catch(err => {
        console.error('Failed to load wards:', err);
      });
    }
  }, [updateFilter, getWardsByDistrict]);

  // Get current sort value
  const getCurrentSortValue = () => {
    return `${localFilters.sortBy || "createdAt"}_${localFilters.sortOrder || "desc"}`;
  };

  // Check if has active filters
  const hasActiveFilters = () => {
    return !!(
      localFilters.subjects?.length ||
      localFilters.teachingMode ||
      localFilters.studentLevel?.length ||
      localFilters.priceMin ||
      localFilters.priceMax ||
      localFilters.province ||
      localFilters.district ||
      localFilters.search
    );
  };

  // Get subject options
  const getSubjectOptions = () => {
    return filterOptions?.subjects?.all || [];
  };

  // Get province options
  const getProvinceOptions = () => {
    return provinces || [];
  };

  // Get district options
  const getDistrictOptions = () => {
    return districts || [];
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.subjects?.length) count++;
    if (localFilters.teachingMode) count++;
    if (localFilters.studentLevel?.length) count++;
    if (localFilters.priceMin || localFilters.priceMax) count++;
    if (localFilters.province) count++;
    if (localFilters.search) count++;
    return count;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className} ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {/* Header */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex flex-col gap-3">
          {/* Top row - Title and toggle button */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm flex-shrink-0">
                <FunnelIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 truncate">
                  Bộ lọc tìm kiếm 
                  {isSmartSearchMode && <span className="text-lg flex-shrink-0">🤖</span>}
                </h3>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 shadow-sm transition-all duration-200 flex-shrink-0"
              disabled={disabled}
            >
              <span className="hidden sm:inline">{isExpanded ? 'Thu gọn' : 'Mở rộng'}</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="w-4 h-4" />
              </motion.div>
            </motion.button>
          </div>

          {/* Bottom row - Badges and result count */}
          <div className="flex flex-wrap items-center gap-2">
            {isSmartSearchMode && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 flex-shrink-0">
                AI đang hoạt động
              </span>
            )}
            {getActiveFilterCount() > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex-shrink-0">
                {getActiveFilterCount()} bộ lọc
              </span>
            )}
            {resultCount !== undefined && (
              <div className="bg-white px-3 py-1 rounded-lg border border-gray-200 flex-shrink-0">
                <span className="text-sm font-semibold text-gray-900">
                  {resultCount.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 ml-1">kết quả</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 sm:px-6 border-b border-gray-100">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder={disabled ? "Tìm kiếm bị tắt trong chế độ AI" : "Tìm kiếm gia sư theo tên, môn học, khu vực..."}
            value={localFilters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value || undefined)}
            onKeyPress={(e) => e.key === 'Enter' && !disabled && onSearch()}
            className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 text-sm placeholder-gray-500"
            disabled={disabled}
          />
          {localFilters.search && (
            <button
              onClick={() => updateFilter("search", undefined)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            >
              <XMarkIcon className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      {/* KHOẢNG CÁCH CHUNG ĐÃ GIẢM */}
      <div className="px-4 py-6 sm:px-6 space-y-6">
        
        {/* Error Display */}
        {error && (
          <motion.div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start min-w-0 flex-1">
                <div className="flex-shrink-0">
                  <XMarkIcon className="w-5 h-5 text-red-400" />
                </div>
                <p className="ml-3 text-sm text-red-600 break-words">{error}</p>
              </div>
              <button onClick={clearError} className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Subjects */}
        <div>
          <div className="flex items-center mb-3 gap-2">
            <AcademicCapIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <label className="text-base font-semibold text-gray-900 truncate flex-1">
              Môn học
            </label>
            {localFilters.subjects?.length && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex-shrink-0">
                {localFilters.subjects.length}
              </span>
            )}
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <SubjectSelector
              selectedSubjects={localFilters.subjects || []}
              onChange={(subjects) => updateFilter("subjects", subjects.length > 0 ? subjects : undefined)}
              placeholder={filterLoading ? "Đang tải môn học..." : "Chọn môn học..."}
              multiple={true}
              disabled={disabled || filterLoading}
            />
          </div>
        </div>

        {/* Student Level */}
        <div>
          <div className="flex items-center mb-3 gap-2">
            <div className="w-5 h-5 text-green-600 text-lg flex-shrink-0">🎓</div>
            <label className="text-base font-semibold text-gray-900 flex-1">
              Đối tượng học viên
            </label>
            {localFilters.studentLevel?.length && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex-shrink-0">
                {localFilters.studentLevel.length}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {STUDENT_LEVELS.map((level) => {
              const isSelected = (localFilters.studentLevel || []).includes(level.value);
              return (
                <motion.label
                  key={level.value}
                  whileHover={!disabled ? { scale: 1.02 } : {}}
                  whileTap={!disabled ? { scale: 0.98 } : {}}
                    // [SỬA] Thêm justify-center để căn giữa text sau khi xóa icon
                  className={`relative flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${disabled ? 'cursor-not-allowed opacity-50' : isSelected ? `${level.color} border-current shadow-md` : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}`}
                >
                  <input type="checkbox" checked={isSelected} onChange={(e) => { if (disabled) return; const currentLevels = localFilters.studentLevel || []; const newLevels = e.target.checked ? [...currentLevels, level.value] : currentLevels.filter((l) => l !== level.value); updateFilter("studentLevel", newLevels.length > 0 ? newLevels : undefined); }} className="sr-only" disabled={disabled} />
                  <div className="flex items-center w-full gap-2">
                      {/* [XÓA] Đã xóa thẻ span hiển thị icon */}
                    <div className="flex-1 min-w-0 text-center">
                      <span className="text-sm font-semibold text-gray-900 leading-tight">{level.label}</span>
                    </div>
                    {isSelected && (<div className="absolute top-2 right-2 flex-shrink-0"><div className="w-5 h-5 bg-current rounded-full flex items-center justify-center"><CheckIcon className="w-3 h-3 text-white" /></div></div>)}
                  </div>
                </motion.label>
              );
            })}
          </div>
        </div>

        {/* Teaching Mode */}
        <div>
          <div className="flex items-center mb-3 gap-2">
            <ComputerDesktopIcon className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <label className="text-base font-semibold text-gray-900 flex-1">Hình thức dạy học</label>
            {localFilters.teachingMode && (<span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex-shrink-0">Đã chọn</span>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {TEACHING_MODES.map((mode) => {
              const isSelected = localFilters.teachingMode === mode.value;
              return (
                <motion.button key={mode.value} whileHover={!disabled ? { scale: 1.02 } : {}} whileTap={!disabled ? { scale: 0.98 } : {}} onClick={() => { if (disabled) return; updateFilter("teachingMode", isSelected ? undefined : (mode.value as any)); }} className={`p-3 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden ${isSelected ? "border-blue-500 bg-blue-50 shadow-lg" : `${mode.color} border-gray-200 hover:shadow-md`} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`} disabled={disabled}>
                  <div className="flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-2xl flex-shrink-0">{mode.icon}</div>
                      {isSelected && (<div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0"><CheckIcon className="w-4 h-4 text-white" /></div>)}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 mb-1 text-sm leading-tight">{mode.label}</div>
                      <p className="text-xs text-gray-600 leading-normal">{mode.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* --- Price Range --- */}
        <div>
          <div className="flex items-center mb-3 gap-2">
            <CurrencyDollarIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
            <label className="text-base font-semibold text-gray-900 truncate flex-1">
              Khoảng giá mong muốn
            </label>
            {(localFilters.priceMin || localFilters.priceMax) ? (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex-shrink-0">
                Đã đặt
              </span>
            ) : null}
          </div>
          
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-2">Khoảng giá phổ biến (VNĐ/buổi):</p>
            <div className="grid grid-cols-4 gap-2">
              {PRICE_PRESETS.map((preset, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePricePreset(preset)}
                  className="px-2 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-center truncate"
                >
                  {preset.label}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PriceInput
                label="Giá tối thiểu"
                value={localFilters.priceMin || 0}
                onChange={(value) => handlePriceChange("min", value)}
                min={0}
                max={10000000}
              />
              <PriceInput
                label="Giá tối đa"
                value={localFilters.priceMax || 0}
                onChange={(value) => handlePriceChange("max", value)}
                min={0}
                max={10000000}
              />
            </div>
          </div>
        </div>

              {/* Location */}
              <div>
                <div className="flex items-center mb-3 gap-2">
                  <MapPinIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <label className="text-base font-semibold text-gray-900 truncate flex-1">
                    Khu vực mong muốn
                  </label>
                  {localFilters.province && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex-shrink-0">
                      Đã chọn
                    </span>
                  )}
                </div>
                {/* [SỬA] Giảm padding, khoảng cách */}
                <div className="bg-gray-50 p-3 rounded-xl space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 truncate">
                      Tỉnh/Thành phố
                    </label>
                    <select
                      value={localFilters.province || ""}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 truncate"
                      disabled={disabled || locationLoading}
                    >
                      <option value="">Tất cả tỉnh/thành</option>
                      {getProvinceOptions().map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {localFilters.province && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2 truncate">
                        Quận/Huyện
                      </label>
                      <select
                        value={localFilters.district || ""}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 truncate"
                        disabled={disabled || locationLoading}
                      >
                        <option value="">Tất cả quận/huyện</option>
                        {getDistrictOptions().map((district) => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Sort */}
              <div>
                <div className="flex items-center mb-3 gap-2">
                  <div className="w-5 h-5 text-indigo-600 text-lg flex-shrink-0">📊</div>
                  <label className="text-base font-semibold text-gray-900 flex-1">
                    Sắp xếp kết quả
                  </label>
                </div>
                {/* [SỬA] Giảm padding */}
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {SORT_OPTIONS.map((option, index) => {
                      const isSelected = getCurrentSortValue() === `${option.value}_${option.order}`;
                      return (
                        <motion.button
                          key={index}
                          whileHover={!disabled ? { scale: 1.02 } : {}}
                          whileTap={!disabled ? { scale: 0.98 } : {}}
                          onClick={() => handleSortChange(`${option.value}_${option.order}`)}
                          // [SỬA] Giảm padding
                          className={`
                            p-2 rounded-lg border transition-all duration-200 text-center
                            ${isSelected
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                              : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                            }
                          `}
                        >
                          {/* [SỬA] Giảm khoảng cách, giảm kích thước icon, font */}
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xl">{option.icon}</span>
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-medium leading-tight text-center">
                                {option.label}
                              </span>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-6 sm:px-6 bg-gray-50 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                  onClick={onSearch}
                  disabled={isLoading || disabled}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold shadow-lg transition-all duration-200 min-h-[48px]"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3 flex-shrink-0"></div>
                      <span className="truncate">{isSmartSearchMode ? 'AI đang tìm kiếm...' : 'Đang tìm kiếm...'}</span>
                    </>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="w-2 h-5 mr-2 flex-shrink-0" />
                      <span className="truncate">{isSmartSearchMode ? 'Tìm kiếm thông minh' : 'Tìm kiếm ngay'}</span>
                    </>
                  )}
                </motion.button>

                {hasActiveFilters() && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onReset}
                    className="px-2 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all duration-200 flex items-center justify-center min-h-[48px] whitespace-nowrap"
                  >
                    <XMarkIcon className="w-3 h-5 mr-2 flex-shrink-0" />
                    <span>Xóa bộ lọc</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TutorPostFilter;