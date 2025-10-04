import React, { useState, useEffect } from "react";
import { useTutorPostStore } from "../../store/tutorPost.store";
import SubjectSelector from "./SubjectSelector";
import PriceInput from "./PriceInput";
import AddressSelector from "../AddressSelector";
import type {
  CreateTutorPostRequest,
  TutorPost,
} from "../../services/tutorPost.service";
import toast from "react-hot-toast";

interface TutorPostFormProps {
  tutorPost?: TutorPost;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
  className?: string;
}

interface TeachingTimeSlot {
  dayOfWeek: number; // 0-6 (0=Sunday)
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
}

const DAYS_OF_WEEK = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];

// Student levels mapping: Frontend display -> Backend values
const STUDENT_LEVELS = [
  { label: "Tiểu học", value: "TIEU_HOC" },
  { label: "THCS", value: "TRUNG_HOC_CO_SO" },
  { label: "THPT", value: "TRUNG_HOC_PHO_THONG" },
  { label: "Đại học", value: "DAI_HOC" },
  { label: "Người đi làm", value: "NGUOI_DI_LAM" },
];

const TutorPostForm: React.FC<TutorPostFormProps> = ({
  tutorPost,
  onSuccess,
  onCancel,
  mode = "create",
  className = "",
}) => {
  const { createTutorPost, updateTutorPost, isLoading } = useTutorPostStore();

  const [formData, setFormData] = useState<CreateTutorPostRequest>({
    title: "",
    description: "",
    subjects: [],
    pricePerSession: 200000,
    sessionDuration: 60,
    teachingMode: "BOTH",
    studentLevel: [],
    teachingSchedule: [],
    address: {
      province: "",
      district: "",
      ward: "",
      specificAddress: "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState<TeachingTimeSlot>({
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "10:00",
  });

  // Load existing data for edit mode
  useEffect(() => {
    if (mode === "edit" && tutorPost) {
      setFormData({
        title: tutorPost.title,
        description: tutorPost.description,
        subjects: tutorPost.subjects.map((s) =>
          typeof s === "string" ? s : s._id
        ),
        pricePerSession: tutorPost.pricePerSession,
        sessionDuration: tutorPost.sessionDuration,
        teachingMode: tutorPost.teachingMode,
        studentLevel: tutorPost.studentLevel,
        teachingSchedule: tutorPost.teachingSchedule,
        address: tutorPost.address || {
          province: "",
          district: "",
          ward: "",
          specificAddress: "",
        },
      });
    }
  }, [mode, tutorPost]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề bài đăng là bắt buộc";
    } else if (formData.title.length < 10) {
      newErrors.title = "Tiêu đề phải có ít nhất 10 ký tự";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Mô tả là bắt buộc";
    }

    if (formData.subjects.length === 0) {
      newErrors.subjects = "Phải chọn ít nhất một môn học";
    }

    if (formData.studentLevel.length === 0) {
      newErrors.studentLevel = "Phải chọn ít nhất một đối tượng học viên";
    }

    if (formData.teachingSchedule.length === 0) {
      newErrors.teachingSchedule = "Phải có ít nhất một khung giờ dạy";
    }

    if (
      formData.pricePerSession < 100000 ||
      formData.pricePerSession > 10000000
    ) {
      newErrors.pricePerSession = "Học phí phải từ 100,000đ đến 10,000,000đ";
    }

    // Address validation for offline teaching
    if (
      formData.teachingMode === "OFFLINE" ||
      formData.teachingMode === "BOTH"
    ) {
      if (!formData.address?.province) {
        newErrors.province = "Phải chọn tỉnh/thành phố";
      }
      if (!formData.address?.district) {
        newErrors.district = "Phải chọn quận/huyện";
      }
      if (!formData.address?.ward) {
        newErrors.ward = "Phải chọn phường/xã";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin đã nhập");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await createTutorPost(formData);
        toast.success("Tạo bài đăng thành công!");
      } else {
        await updateTutorPost(tutorPost!.id, formData);
        toast.success("Cập nhật bài đăng thành công!");
      }

      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = <K extends keyof CreateTutorPostRequest>(
    key: K,
    value: CreateTutorPostRequest[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    // Clear error for this field
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const addTimeSlot = () => {
    if (newTimeSlot.startTime >= newTimeSlot.endTime) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    // Check for conflicts
    const hasConflict = formData.teachingSchedule.some(
      (slot) =>
        slot.dayOfWeek === newTimeSlot.dayOfWeek &&
        !(
          newTimeSlot.endTime <= slot.startTime ||
          newTimeSlot.startTime >= slot.endTime
        )
    );

    if (hasConflict) {
      toast.error("Khoảng thời gian này bị trùng với lịch đã có!");
      return;
    }

    const newSchedule = [...formData.teachingSchedule, newTimeSlot].sort(
      (a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
        return a.startTime.localeCompare(b.startTime);
      }
    );

    updateFormData("teachingSchedule", newSchedule);
    setNewTimeSlot({ dayOfWeek: 1, startTime: "08:00", endTime: "10:00" });
  };

  const removeTimeSlot = (index: number) => {
    const newSchedule = formData.teachingSchedule.filter((_, i) => i !== index);
    updateFormData("teachingSchedule", newSchedule);
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === "create" ? "Tạo bài đăng mới" : "Chỉnh sửa bài đăng"}
          </h2>
          <p className="text-gray-600">
            Tạo một bài đăng hấp dẫn để thu hút học viên phù hợp với khả năng
            của bạn.
          </p>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin cơ bản
          </h3>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề bài đăng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateFormData("title", e.target.value)}
              placeholder="VD: Dạy toán lớp 12 - Phương pháp hiệu quả, cam kết điểm cao"
              maxLength={200}
              className={`
                w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.title ? "border-red-500" : "border-gray-300"}
              `}
            />
            {errors.title && (
              <span className="text-sm text-red-600">{errors.title}</span>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              placeholder="Mô tả chi tiết về khóa học, phương pháp giảng dạy, kinh nghiệm của bạn..."
              rows={6}
              className={`
                w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.description ? "border-red-500" : "border-gray-300"}
              `}
            />
            {errors.description && (
              <span className="text-sm text-red-600">{errors.description}</span>
            )}
          </div>

          {/* Subjects */}
          <div className="mb-4">
            <SubjectSelector
              selectedSubjects={formData.subjects}
              onChange={(subjects) => updateFormData("subjects", subjects)}
              error={errors.subjects}
              required
            />
          </div>

          {/* Student Level */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đối tượng học viên <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STUDENT_LEVELS.map((level) => (
                <label
                  key={level.value}
                  className={`
                    flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                    ${
                      formData.studentLevel.includes(level.value)
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={formData.studentLevel.includes(level.value)}
                    onChange={(e) => {
                      const newLevels = e.target.checked
                        ? [...formData.studentLevel, level.value]
                        : formData.studentLevel.filter(
                            (l) => l !== level.value
                          );
                      updateFormData("studentLevel", newLevels);
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{level.label}</span>
                </label>
              ))}
            </div>
            {errors.studentLevel && (
              <span className="text-sm text-red-600">
                {errors.studentLevel}
              </span>
            )}
          </div>
        </div>

        {/* Schedule and Price */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Lịch dạy và học phí
          </h3>

          {/* Teaching Schedule */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lịch dạy trong tuần <span className="text-red-500">*</span>
            </label>

            {/* Add new time slot */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="text-sm font-medium mb-3">Thêm khung giờ dạy</h4>
              <div className="grid grid-cols-4 gap-3">
                <select
                  value={newTimeSlot.dayOfWeek}
                  onChange={(e) =>
                    setNewTimeSlot({
                      ...newTimeSlot,
                      dayOfWeek: Number(e.target.value),
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS_OF_WEEK.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  value={newTimeSlot.startTime}
                  onChange={(e) =>
                    setNewTimeSlot({
                      ...newTimeSlot,
                      startTime: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="time"
                  value={newTimeSlot.endTime}
                  onChange={(e) =>
                    setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Thêm
                </button>
              </div>
            </div>

            {/* Current schedule */}
            {formData.teachingSchedule.length > 0 && (
              <div className="space-y-2">
                {formData.teachingSchedule.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-3 border rounded"
                  >
                    <span className="text-sm">
                      {DAYS_OF_WEEK[slot.dayOfWeek]}: {slot.startTime} -{" "}
                      {slot.endTime}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.teachingSchedule && (
              <span className="text-sm text-red-600">
                {errors.teachingSchedule}
              </span>
            )}
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <PriceInput
                value={formData.pricePerSession}
                onChange={(price) => updateFormData("pricePerSession", price)}
                label="Học phí mỗi buổi (VNĐ)"
                error={errors.pricePerSession}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời lượng mỗi buổi (phút){" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sessionDuration}
                onChange={(e) =>
                  updateFormData("sessionDuration", Number(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={30}>30 phút</option>
                <option value={45}>45 phút</option>
                <option value={60}>60 phút</option>
                <option value={90}>90 phút</option>
                <option value={120}>120 phút</option>
              </select>
            </div>
          </div>
        </div>

        {/* Teaching Mode and Location */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Hình thức và địa điểm dạy
          </h3>

          {/* Teaching Mode */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình thức dạy <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  value: "ONLINE",
                  label: "Trực tuyến",
                  desc: "Dạy qua video call",
                },
                {
                  value: "OFFLINE",
                  label: "Trực tiếp",
                  desc: "Gặp mặt tại địa điểm",
                },
                {
                  value: "BOTH",
                  label: "Cả hai",
                  desc: "Linh hoạt theo nhu cầu",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`
                    block p-4 border rounded-lg cursor-pointer transition-colors
                    ${
                      formData.teachingMode === option.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="teachingMode"
                    value={option.value}
                    checked={formData.teachingMode === option.value}
                    onChange={(e) =>
                      updateFormData("teachingMode", e.target.value as any)
                    }
                    className="sr-only"
                  />
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {option.desc}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Address - only show for offline/both */}
          {(formData.teachingMode === "OFFLINE" ||
            formData.teachingMode === "BOTH") && (
            <div className="space-y-4 mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm text-gray-700">
                Thông tin địa chỉ dạy học
              </h4>

              <AddressSelector
                selectedProvince={formData.address?.province || ""}
                selectedDistrict={formData.address?.district || ""}
                selectedWard={formData.address?.ward || ""}
                detailAddress={formData.address?.specificAddress || ""}
                onProvinceChange={(provinceCode) => {
                  updateFormData("address", {
                    province: provinceCode,
                    district: "",
                    ward: "",
                    specificAddress: formData.address?.specificAddress || "",
                  });
                }}
                onDistrictChange={(districtCode) => {
                  updateFormData("address", {
                    ...formData.address!,
                    district: districtCode,
                    ward: "",
                  });
                }}
                onWardChange={(wardCode) => {
                  updateFormData("address", {
                    ...formData.address!,
                    ward: wardCode,
                  });
                }}
                onDetailAddressChange={(detailAddress) => {
                  updateFormData("address", {
                    ...formData.address!,
                    specificAddress: detailAddress,
                  });
                }}
                isEditing={true}
                className="space-y-4"
              />

              {/* Display validation errors */}
              {(errors.province || errors.district || errors.ward) && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <div className="text-sm text-red-600 space-y-1">
                    {errors.province && <div>• {errors.province}</div>}
                    {errors.district && <div>• {errors.district}</div>}
                    {errors.ward && <div>• {errors.ward}</div>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Bài đăng sẽ được xem xét và phê duyệt trước khi hiển thị công
              khai.
            </p>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>
                  {mode === "create" ? "Tạo bài đăng" : "Cập nhật bài đăng"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TutorPostForm;
