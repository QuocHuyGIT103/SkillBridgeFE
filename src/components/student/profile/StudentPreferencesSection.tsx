import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-hot-toast";
import {
  AcademicCapIcon,
  HeartIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  PencilIcon,
  CheckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import { useStudentProfileStore } from "../../../store/studentProfile.store";
import { useSubjectStore } from "../../../store/subject.store";
import { LEARNING_STYLE_OPTIONS } from "../../../types/student.types";
import type {
  StudentPreferencesUpdate,
  StudentProfile,
} from "../../../types/student.types";
import RangeSlider from "../../RangeSlider";

interface StudentPreferencesSectionProps {
  profile: StudentProfile | null;
}

const StudentPreferencesSection: React.FC<StudentPreferencesSectionProps> = ({
  profile,
}) => {
  const { updatePreferences, isUpdatingPreferences } = useStudentProfileStore();
  const { activeSubjects, getActiveSubjects } = useSubjectStore();
  const [budgetRange, setBudgetRange] = useState([0, 1000000]);
  const [isEditing, setIsEditing] = useState(false); // ✅ Thêm state editing mode

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm<StudentPreferencesUpdate>({
    defaultValues: {
      learning_goals: profile?.learning_goals || "",
      preferred_subjects: profile?.preferred_subjects || [],
      learning_style: profile?.learning_style || undefined,
      availability_schedule: profile?.availability_schedule || "",
      budget_range: profile?.budget_range || { min: 0, max: 1000000 },
      interests: profile?.interests || "",
      special_needs: profile?.special_needs || "",
      parent_contact: profile?.parent_contact || {
        name: "",
        phone: "",
        relationship: "",
      },
    },
  });

  // Fetch active subjects on mount
  useEffect(() => {
    getActiveSubjects();
  }, [getActiveSubjects]);

  // Update form when profile data changes
  useEffect(() => {
    if (profile) {
      const formData = {
        learning_goals: profile.learning_goals || "",
        preferred_subjects: profile.preferred_subjects || [],
        learning_style: profile.learning_style,
        availability_schedule: profile.availability_schedule || "",
        budget_range: profile.budget_range || { min: 0, max: 1000000 },
        interests: profile.interests || "",
        special_needs: profile.special_needs || "",
        parent_contact: profile.parent_contact || {},
      };

      reset(formData);

      // Update budget range slider
      if (profile.budget_range) {
        setBudgetRange([
          profile.budget_range.min || 0,
          profile.budget_range.max || 1000000,
        ]);
      }
    }
  }, [profile, reset]);

  // ✅ Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditing && isDirty) {
      const confirmDiscard = window.confirm(
        "Bạn có thay đổi chưa được lưu. Bạn có muốn hủy bỏ các thay đổi?"
      );
      if (!confirmDiscard) return;

      // Reset form to original values
      if (profile) {
        reset({
          learning_goals: profile.learning_goals || "",
          preferred_subjects: profile.preferred_subjects || [],
          learning_style: profile.learning_style,
          availability_schedule: profile.availability_schedule || "",
          budget_range: profile.budget_range || { min: 0, max: 1000000 },
          interests: profile.interests || "",
          special_needs: profile.special_needs || "",
          parent_contact: profile.parent_contact || {},
        });

        if (profile.budget_range) {
          setBudgetRange([
            profile.budget_range.min || 0,
            profile.budget_range.max || 1000000,
          ]);
        }
      }
    }

    setIsEditing(!isEditing);
  };

  // Handle budget range change
  const handleBudgetRangeChange = (minValue: number, maxValue: number) => {
    setBudgetRange([minValue, maxValue]);
    setValue("budget_range", {
      min: minValue,
      max: maxValue,
    });
  };

  // Handle form submission
  const onSubmit = async (data: StudentPreferencesUpdate) => {
    try {
      await updatePreferences(data);
      toast.success("Cập nhật sở thích học tập thành công!");
      setIsEditing(false); // ✅ Exit edit mode after successful save
    } catch (error: any) {
      toast.error(error.message || "Cập nhật sở thích thất bại");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // ✅ Format display values
  const formatLearningStyle = () => {
    const style = LEARNING_STYLE_OPTIONS.find(
      (opt) => opt.value === profile?.learning_style
    );
    return style ? style.label : "Chưa cập nhật";
  };

  const formatPreferredSubjects = () => {
    if (
      !profile?.preferred_subjects ||
      profile.preferred_subjects.length === 0
    ) {
      return "Chưa cập nhật";
    }

    const selectedSubjects = activeSubjects.filter((subject) =>
      profile.preferred_subjects?.includes(subject._id)
    );

    return selectedSubjects.length > 0
      ? selectedSubjects.map((s) => s.name).join(", ")
      : "Chưa cập nhật";
  };

  const formatBudgetRange = () => {
    if (!profile?.budget_range) return "Chưa cập nhật";

    const { min = 0, max = 1000000 } = profile.budget_range;
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      {/* ✅ Header with edit toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <AcademicCapIcon className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">
            Sở thích học tập
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {isEditing ? (
            <button
              type="button"
              onClick={handleEditToggle}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <XCircleIcon className="w-5 h-5" />
              <span>Hủy</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEditToggle}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PencilIcon className="w-5 h-5" />
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        /* ✅ EDIT MODE - Form */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Learning Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <HeartIcon className="w-4 h-4 inline mr-2" />
              Mục tiêu học tập
            </label>
            <textarea
              {...register("learning_goals")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Tôi muốn cải thiện kỹ năng toán học để chuẩn bị cho kỳ thi đại học..."
            />
          </div>

          {/* Preferred Subjects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Môn học yêu thích
            </label>
            <Controller
              name="preferred_subjects"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {activeSubjects.map((subject) => (
                    <label
                      key={subject._id}
                      className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={subject._id}
                        checked={field.value?.includes(subject._id) || false}
                        onChange={(e) => {
                          const currentValue = field.value || [];
                          if (e.target.checked) {
                            field.onChange([...currentValue, subject._id]);
                          } else {
                            field.onChange(
                              currentValue.filter((id) => id !== subject._id)
                            );
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {subject.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Learning Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phong cách học tập
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LEARNING_STYLE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <input
                    {...register("learning_style")}
                    type="radio"
                    value={option.value}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Availability Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="w-4 h-4 inline mr-2" />
              Lịch học phù hợp
            </label>
            <textarea
              {...register("availability_schedule")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Thứ 2, 4, 6 từ 19:00 - 21:00. Cuối tuần từ 8:00 - 12:00..."
            />
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
              Ngân sách mong muốn (VNĐ/giờ)
            </label>
            <div className="px-4 py-4 bg-gray-50 rounded-lg">
              <RangeSlider
                min={0}
                max={2000000}
                step={50000}
                minValue={budgetRange[0]}
                maxValue={budgetRange[1]}
                onChange={handleBudgetRangeChange}
              />
              <div className="flex justify-between mt-3 text-sm text-gray-600">
                <span>{formatCurrency(budgetRange[0])}</span>
                <span>{formatCurrency(budgetRange[1])}</span>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sở thích và hoạt động ngoại khóa
            </label>
            <textarea
              {...register("interests")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Thích đọc sách, chơi thể thao, học piano..."
            />
          </div>

          {/* Special Needs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhu cầu đặc biệt
            </label>
            <textarea
              {...register("special_needs")}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nếu có nhu cầu học tập đặc biệt, vui lòng mô tả..."
            />
          </div>

          {/* Parent Contact */}
          <div className="space-y-4">
            <h3 className="flex items-center text-lg font-medium text-gray-900">
              <UserGroupIcon className="w-5 h-5 mr-2" />
              Thông tin phụ huynh
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                <input
                  {...register("parent_contact.name")}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tên phụ huynh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  {...register("parent_contact.phone")}
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mối quan hệ
                </label>
                <select
                  {...register("parent_contact.relationship")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn mối quan hệ</option>
                  <option value="father">Bố</option>
                  <option value="mother">Mẹ</option>
                  <option value="guardian">Người giám hộ</option>
                  <option value="relative">Người thân</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleEditToggle}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!isDirty || isUpdatingPreferences}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckIcon className="w-5 h-5" />
              <span>
                {isUpdatingPreferences ? "Đang lưu..." : "Lưu thay đổi"}
              </span>
            </button>
          </div>
        </form>
      ) : (
        /* ✅ VIEW MODE - Display Information */
        <div className="space-y-6">
          {/* Learning Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <HeartIcon className="w-4 h-4 inline mr-2" />
              Mục tiêu học tập
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 min-h-[80px]">
              {profile?.learning_goals || "Chưa cập nhật"}
            </div>
          </div>

          {/* Preferred Subjects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Môn học yêu thích
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
              {formatPreferredSubjects()}
            </div>
          </div>

          {/* Learning Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phong cách học tập
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
              {formatLearningStyle()}
            </div>
          </div>

          {/* Availability Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="w-4 h-4 inline mr-2" />
              Lịch học phù hợp
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 min-h-[80px]">
              {profile?.availability_schedule || "Chưa cập nhật"}
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
              Ngân sách mong muốn (VNĐ/giờ)
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
              {formatBudgetRange()}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sở thích và hoạt động ngoại khóa
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 min-h-[80px]">
              {profile?.interests || "Chưa cập nhật"}
            </div>
          </div>

          {/* Special Needs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhu cầu đặc biệt
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
              {profile?.special_needs || "Chưa cập nhật"}
            </div>
          </div>

          {/* Parent Contact */}
          <div className="space-y-4">
            <h3 className="flex items-center text-lg font-medium text-gray-900">
              <UserGroupIcon className="w-5 h-5 mr-2" />
              Thông tin phụ huynh
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {profile?.parent_contact?.name || "Chưa cập nhật"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {profile?.parent_contact?.phone || "Chưa cập nhật"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mối quan hệ
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {profile?.parent_contact?.relationship || "Chưa cập nhật"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StudentPreferencesSection;
