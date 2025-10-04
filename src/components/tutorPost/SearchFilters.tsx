import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface SearchFiltersProps {
  onFiltersChange: (filters: TutorPostSearchQuery) => void;
  isLoading?: boolean;
}

interface TutorPostSearchQuery {
  subjects?: string[];
  teachingMode?: "ONLINE" | "OFFLINE" | "BOTH";
  studentLevel?: string[];
  priceMin?: number;
  priceMax?: number;
  province?: string;
  district?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "pricePerSession" | "viewCount";
  sortOrder?: "asc" | "desc";
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  onFiltersChange,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<TutorPostSearchQuery>({
    search: "",
    subjects: [],
    teachingMode: undefined,
    studentLevel: [],
    priceMin: undefined,
    priceMax: undefined,
    province: "",
    district: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Mock data - trong thực tế sẽ fetch từ API
  const subjects = [
    { id: "math", name: "Toán học", category: "Khoa học tự nhiên" },
    { id: "english", name: "Tiếng Anh", category: "Ngoại ngữ" },
    { id: "physics", name: "Vật lý", category: "Khoa học tự nhiên" },
    { id: "chemistry", name: "Hóa học", category: "Khoa học tự nhiên" },
    { id: "biology", name: "Sinh học", category: "Khoa học tự nhiên" },
    { id: "literature", name: "Ngữ văn", category: "Xã hội" },
    { id: "history", name: "Lịch sử", category: "Xã hội" },
    { id: "geography", name: "Địa lý", category: "Xã hội" },
    { id: "ielts", name: "IELTS", category: "Ngoại ngữ" },
    { id: "toeic", name: "TOEIC", category: "Ngoại ngữ" },
  ];

  const studentLevels = [
    { value: "TIEU_HOC", label: "Tiểu học" },
    { value: "TRUNG_HOC_CO_SO", label: "Trung học cơ sở" },
    { value: "TRUNG_HOC_PHO_THONG", label: "Trung học phổ thông" },
    { value: "DAI_HOC", label: "Đại học" },
    { value: "NGUOI_DI_LAM", label: "Người đi làm" },
    { value: "KHAC", label: "Khác" },
  ];

  const provinces = [
    { id: "hanoi", name: "Hà Nội" },
    { id: "hcm", name: "TP. Hồ Chí Minh" },
    { id: "danang", name: "Đà Nẵng" },
    { id: "haiphong", name: "Hải Phòng" },
    { id: "cantho", name: "Cần Thơ" },
  ];

  const districts = [
    { id: "cau_giay", name: "Cầu Giấy", province_id: "hanoi" },
    { id: "dong_da", name: "Đống Đa", province_id: "hanoi" },
    { id: "hai_ba_trung", name: "Hai Bà Trưng", province_id: "hanoi" },
    { id: "quan_1", name: "Quận 1", province_id: "hcm" },
    { id: "quan_2", name: "Quận 2", province_id: "hcm" },
    { id: "quan_3", name: "Quận 3", province_id: "hcm" },
  ];

  const priceRanges = [
    { label: "Dưới 200k", min: 0, max: 200000 },
    { label: "200k - 500k", min: 200000, max: 500000 },
    { label: "500k - 1M", min: 500000, max: 1000000 },
    { label: "1M - 2M", min: 1000000, max: 2000000 },
    { label: "Trên 2M", min: 2000000, max: 10000000 },
  ];

  const handleFilterChange = (key: keyof TutorPostSearchQuery, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSubjectToggle = (subjectId: string) => {
    const currentSubjects = filters.subjects || [];
    const newSubjects = currentSubjects.includes(subjectId)
      ? currentSubjects.filter((id) => id !== subjectId)
      : [...currentSubjects, subjectId];

    handleFilterChange("subjects", newSubjects);
  };

  const handleStudentLevelToggle = (level: string) => {
    const currentLevels = filters.studentLevel || [];
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter((l) => l !== level)
      : [...currentLevels, level];

    handleFilterChange("studentLevel", newLevels);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    handleFilterChange("priceMin", min);
    handleFilterChange("priceMax", max);
  };

  const clearFilters = () => {
    const clearedFilters: TutorPostSearchQuery = {
      search: "",
      subjects: [],
      teachingMode: undefined,
      studentLevel: [],
      priceMin: undefined,
      priceMax: undefined,
      province: "",
      district: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const filteredDistricts = districts.filter(
    (district) => !filters.province || district.province_id === filters.province
  );

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Tìm kiếm
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm gia sư, môn học..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Subjects */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Môn học
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {subjects.map((subject) => (
            <label key={subject.id} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.subjects?.includes(subject.id) || false}
                onChange={() => handleSubjectToggle(subject.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">{subject.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Teaching Mode */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Hình thức dạy học
        </label>
        <div className="space-y-2">
          {[
            { value: "ONLINE", label: "Trực tuyến" },
            { value: "OFFLINE", label: "Tại nhà" },
            { value: "BOTH", label: "Cả hai hình thức" },
          ].map((mode) => (
            <label key={mode.value} className="flex items-center">
              <input
                type="radio"
                name="teachingMode"
                value={mode.value}
                checked={filters.teachingMode === mode.value}
                onChange={(e) =>
                  handleFilterChange("teachingMode", e.target.value)
                }
                className="border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">{mode.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Student Level */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Trình độ học viên
        </label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {studentLevels.map((level) => (
            <label key={level.value} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.studentLevel?.includes(level.value) || false}
                onChange={() => handleStudentLevelToggle(level.value)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">{level.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Mức giá (VND/buổi)
        </label>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label key={range.label} className="flex items-center">
              <input
                type="radio"
                name="priceRange"
                checked={
                  filters.priceMin === range.min &&
                  filters.priceMax === range.max
                }
                onChange={() => handlePriceRangeChange(range.min, range.max)}
                className="border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Tỉnh/Thành phố
        </label>
        <select
          value={filters.province || ""}
          onChange={(e) => {
            handleFilterChange("province", e.target.value);
            handleFilterChange("district", ""); // Reset district when province changes
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        >
          <option value="">Tất cả tỉnh/thành</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      {filters.province && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Quận/Huyện
          </label>
          <select
            value={filters.district || ""}
            onChange={(e) => handleFilterChange("district", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="">Tất cả quận/huyện</option>
            {filteredDistricts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sort */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Sắp xếp theo
        </label>
        <div className="space-y-2">
          {[
            { value: "createdAt", label: "Mới nhất" },
            { value: "pricePerSession", label: "Giá tiền" },
            { value: "viewCount", label: "Lượt xem" },
          ].map((sort) => (
            <label key={sort.value} className="flex items-center">
              <input
                type="radio"
                name="sortBy"
                value={sort.value}
                checked={filters.sortBy === sort.value}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">{sort.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={clearFilters}
        className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        disabled={isLoading}
      >
        Xóa bộ lọc
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          <FunnelIcon className="w-5 h-5 mr-2" />
          <span className="font-medium">Bộ lọc tìm kiếm</span>
          {showMobileFilters ? <XMarkIcon className="w-5 h-5 ml-2" /> : null}
        </button>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Bộ lọc tìm kiếm
          </h3>
          <FilterSection />
        </motion.div>
      </div>

      {/* Mobile Filters */}
      {showMobileFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden bg-white rounded-xl shadow-sm border border-gray-200 mb-6"
        >
          {/* Mobile Filter Header - Sticky */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Bộ lọc tìm kiếm
              </h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Filter Content - Scrollable */}
          <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
            <FilterSection />
          </div>

          {/* Mobile Filter Footer - Sticky */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default SearchFilters;
