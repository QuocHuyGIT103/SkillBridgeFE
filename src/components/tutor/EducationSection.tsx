import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  PlusIcon,
  PencilIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import useEducationStore from "../../store/education.store";
import { EducationLevel } from "../../services/education.service";
import type { CreateEducationFormData } from "../../services/education.service";
import VerificationStatus from "./VerificationStatus";
import ImageUploader from "./ImageUploader";

interface EducationFormState {
  level?: EducationLevel;
  school?: string;
  major?: string;
  start_year?: string;
  end_year?: string;
  degree_image?: File;
}

const EducationSection: React.FC = () => {
  const {
    educations,
    educationLevels,
    isLoading,
    isSubmitting,
    createEducation,
    updateEducation,
  } = useEducationStore();

  const currentEducation = educations.length > 0 ? educations[0] : null;
  const [editingEducation, setEditingEducation] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [educationForm, setEducationForm] = useState<EducationFormState>({});

  const handleEducationSave = async () => {
    if (
      educationForm.level &&
      educationForm.school &&
      educationForm.start_year &&
      educationForm.end_year
    ) {
      try {
        const educationData: CreateEducationFormData = {
          level: educationForm.level!,
          school: educationForm.school!,
          major: educationForm.major || "",
          start_year: educationForm.start_year!,
          end_year: educationForm.end_year!,
          degree_image: educationForm.degree_image,
        };

        if (currentEducation) {
          await updateEducation(currentEducation._id, educationData);
        } else {
          await createEducation(educationData);
        }

        setEducationForm({});
        setEditingEducation(false);
        setShowEducationForm(false);
      } catch (error) {
        console.error("Error saving education:", error);
      }
    }
  };

  const handleEducationEdit = () => {
    if (currentEducation) {
      setEducationForm({
        level: currentEducation.level,
        school: currentEducation.school,
        major: currentEducation.major || "",
        start_year: currentEducation.start_year,
        end_year: currentEducation.end_year,
      });
      setEditingEducation(true);
      setShowEducationForm(true);
    }
  };

  const handleImageUpload = (file: File) => {
    setEducationForm((prev) => ({ ...prev, degree_image: file }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-6"
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AcademicCapIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Trình độ học vấn
            </h2>
          </div>
          {!isLoading && !currentEducation && !showEducationForm && (
            <button
              onClick={() => setShowEducationForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Thêm học vấn</span>
            </button>
          )}
          {!isLoading && currentEducation && !editingEducation && (
            <button
              onClick={handleEducationEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-secondary">
            Đang tải dữ liệu học vấn...
          </span>
        </div>
      )}

      {/* Education Display */}
      {!isLoading && currentEducation && !editingEducation && (
        <div className="bg-accent/10 rounded-lg p-4">
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Trạng thái xác thực:
              </span>
              <VerificationStatus isVerified={currentEducation.is_verified} />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Information Section */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Trình độ
                  </label>
                  <p className="text-lg font-semibold text-primary">
                    {currentEducation.level}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Trường
                  </label>
                  <p className="text-lg text-gray-900 dark:text-gray-100">
                    {currentEducation.school}
                  </p>
                </div>
                {currentEducation.major && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Chuyên ngành
                    </label>
                    <p className="text-lg text-gray-900 dark:text-gray-100">
                      {currentEducation.major}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Thời gian học
                  </label>
                  <p className="text-lg text-gray-900 dark:text-gray-100">
                    {currentEducation.start_year} - {currentEducation.end_year}
                  </p>
                </div>
              </div>
            </div>

            {/* Image Section */}
            {currentEducation.degree_image_url && (
              <div className="flex-shrink-0 lg:w-80">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Ảnh bằng cấp
                </label>
                <img
                  src={currentEducation.degree_image_url}
                  alt="Degree"
                  className="w-full h-48 lg:h-64 object-cover rounded-lg border-2 border-accent/30"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Education Form */}
      {!isLoading && (showEducationForm || editingEducation) && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trình độ học vấn *
              </label>
              <select
                value={educationForm.level || ""}
                onChange={(e) =>
                  setEducationForm((prev) => ({
                    ...prev,
                    level: e.target.value as EducationLevel,
                  }))
                }
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Chọn trình độ</option>
                {educationLevels ? (
                  Object.entries(educationLevels).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Trung học phổ thông">
                      Trung học phổ thông
                    </option>
                    <option value="Đại học">Đại học</option>
                    <option value="Thạc sĩ">Thạc sĩ</option>
                    <option value="Tiến sĩ">Tiến sĩ</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên trường *
              </label>
              <input
                type="text"
                value={educationForm.school || ""}
                onChange={(e) =>
                  setEducationForm((prev) => ({
                    ...prev,
                    school: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nhập tên trường..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chuyên ngành
              </label>
              <input
                type="text"
                value={educationForm.major || ""}
                onChange={(e) =>
                  setEducationForm((prev) => ({
                    ...prev,
                    major: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nhập chuyên ngành (nếu có)..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Năm bắt đầu *
                </label>
                <input
                  type="number"
                  value={educationForm.start_year || ""}
                  onChange={(e) =>
                    setEducationForm((prev) => ({
                      ...prev,
                      start_year: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="2020"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Năm kết thúc *
                </label>
                <input
                  type="number"
                  value={educationForm.end_year || ""}
                  onChange={(e) =>
                    setEducationForm((prev) => ({
                      ...prev,
                      end_year: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="2024"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <ImageUploader
            label="Ảnh bằng cấp"
            currentImage={educationForm.degree_image}
            onImageUpload={handleImageUpload}
            previewClassName="w-64 h-32 object-cover rounded-lg border-2 border-accent/30"
          />

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setEducationForm({});
                setEditingEducation(false);
                setShowEducationForm(false);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleEducationSave}
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4 inline mr-2" />
                  {editingEducation ? "Cập nhật" : "Lưu"}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EducationSection;
