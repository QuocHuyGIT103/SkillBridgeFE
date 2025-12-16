import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useStudentStore } from "../../store/student.store";

interface CreateStudentModalProps {
  show: boolean;
  onClose: () => void;
}

const CreateStudentModal: React.FC<CreateStudentModalProps> = ({
  show,
  onClose,
}) => {
  const { createStudent, loading } = useStudentStore();
  const [showPassword, setShowPassword] = useState(false);
  const [createdStudent, setCreatedStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    phone_number: "",
    address: "",
    grade: "",
    school: "",
    subjects: [] as string[],
    learning_goals: "",
    preferred_schedule: "",
    special_requirements: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subjects = [
    "Toán học",
    "Tiếng Anh",
    "Vật lý",
    "Hóa học",
    "Sinh học",
    "Lịch sử",
    "Địa lý",
    "Ngữ văn",
    "Tin học",
    "IELTS",
    "TOEIC",
  ];

  const grades = [
    "Lớp 1",
    "Lớp 2",
    "Lớp 3",
    "Lớp 4",
    "Lớp 5",
    "Lớp 6",
    "Lớp 7",
    "Lớp 8",
    "Lớp 9",
    "Lớp 10",
    "Lớp 11",
    "Lớp 12",
  ];

  // ✅ Prevent event bubbling
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // ✅ Prevent modal content click from closing modal
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // ✅ Sửa handleInputChange để clear errors
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // ✅ Clear error khi user thay đổi input
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) return true; // Optional field

    // Remove all spaces and special characters
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

    const backendPattern = /^(\+84|0)[3|5|7|8|9][0-9]{8}$/;

    return backendPattern.test(cleanPhone);
  };

  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return "";

    // Remove all non-digits
    let cleanPhone = phone.replace(/\D/g, "");

    // If starts with 84, convert to 0
    if (cleanPhone.startsWith("84")) {
      cleanPhone = "0" + cleanPhone.slice(2);
    }

    // Ensure starts with 0
    if (!cleanPhone.startsWith("0")) {
      cleanPhone = "0" + cleanPhone;
    }

    return cleanPhone;
  };

  // ✅ Thêm helper function để check valid first digits
  const isValidPhonePrefix = (phone: string): boolean => {
    if (phone.length < 2) return true; // Allow partial typing

    const prefix = phone.substring(1, 2); // Get second digit
    return ["3", "5", "7", "8", "9"].includes(prefix);
  };

  // ✅ Enhanced phone input handler
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let formattedValue = formatPhoneNumber(value);

    // Limit length to 10 digits (0xxxxxxxxx)
    if (formattedValue.length <= 10) {
      setFormData((prev) => ({ ...prev, phone_number: formattedValue }));

      // Clear error if valid
      if (validatePhoneNumber(formattedValue)) {
        setErrors((prev) => ({ ...prev, phone_number: "" }));
      } else if (
        formattedValue.length >= 2 &&
        !isValidPhonePrefix(formattedValue)
      ) {
        setErrors((prev) => ({
          ...prev,
          phone_number:
            "Số điện thoại phải bắt đầu bằng 03, 05, 07, 08, hoặc 09",
        }));
      }
    }
  };

  // ✅ Thay thế validateForm function hiện tại
  const validateForm = (): boolean => {
    // Validation will be handled by backend
    return true;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Validate form
      if (!validateForm()) {
        return;
      }

      // ✅ Clean and prepare data - ONLY send fields with actual values
      const cleanData: any = {
        full_name: formData.full_name.trim(),
      };

      // ✅ Only add optional fields if they have meaningful values
      if (formData.date_of_birth && formData.date_of_birth.trim()) {
        cleanData.date_of_birth = formData.date_of_birth.trim();
      }

      if (formData.gender && formData.gender.trim()) {
        cleanData.gender = formData.gender.trim();
      }

      if (formData.phone_number && formData.phone_number.trim()) {
        const cleanPhone = formatPhoneNumber(formData.phone_number.trim());
        if (validatePhoneNumber(cleanPhone)) {
          cleanData.phone_number = cleanPhone;
        } else {
          setErrors({ phone_number: "Số điện thoại không hợp lệ" });
          return;
        }
      }

      if (formData.address && formData.address.trim()) {
        cleanData.address = formData.address.trim();
      }

      if (formData.grade && formData.grade.trim()) {
        cleanData.grade = formData.grade.trim();
      }

      if (formData.school && formData.school.trim()) {
        cleanData.school = formData.school.trim();
      }

      if (formData.subjects && formData.subjects.length > 0) {
        cleanData.subjects = formData.subjects;
      }

      if (formData.learning_goals && formData.learning_goals.trim()) {
        cleanData.learning_goals = formData.learning_goals.trim();
      }

      if (formData.preferred_schedule && formData.preferred_schedule.trim()) {
        cleanData.preferred_schedule = formData.preferred_schedule.trim();
      }

      // ✅ IMPORTANT: Don't send empty special_requirements
      if (
        formData.special_requirements &&
        formData.special_requirements.trim()
      ) {
        cleanData.special_requirements = formData.special_requirements.trim();
      }

      const result = await createStudent(cleanData);

      if (result && result.success !== false) {
        setCreatedStudent(result);
        setShowPassword(true);
        // Reset form
        setFormData({
          full_name: "",
          date_of_birth: "",
          gender: "",
          phone_number: "",
          address: "",
          grade: "",
          school: "",
          subjects: [],
          learning_goals: "",
          preferred_schedule: "",
          special_requirements: "",
        });
        setErrors({});
      } else {
        throw new Error(result?.error || "Tạo học viên thất bại");
      }
    } catch (error: any) {
      // Handle specific API errors
      if (error?.response?.data?.message) {
        alert(`Lỗi: ${error.response.data.message}`);
      } else if (error?.message?.includes("điện thoại")) {
        setErrors({ phone_number: error.message });
      } else {
        alert(`Có lỗi xảy ra: ${error?.message || "Vui lòng thử lại"}`);
      }
    }
  };

  const handleClose = () => {
    try {
      setCreatedStudent(null);
      setShowPassword(false);
      // Reset form when closing
      setFormData({
        full_name: "",
        date_of_birth: "",
        gender: "",
        phone_number: "",
        address: "",
        grade: "",
        school: "",
        subjects: [],
        learning_goals: "",
        preferred_schedule: "",
        special_requirements: "",
      });
      onClose();
    } catch (error) {
      console.error("Error closing modal:", error);
      onClose(); // Force close anyway
    }
  };

  // ✅ Safe access to nested properties
  const studentEmail =
    createdStudent?.student?.email || createdStudent?.email || "N/A";
  const tempPassword = createdStudent?.temp_password || "N/A";

  if (!show) return null; // ✅ Early return if not showing

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={handleBackdropClick}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={handleModalClick}
            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-10"
          >
            {showPassword && createdStudent ? (
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                    Tạo hồ sơ học viên thành công!
                  </h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-yellow-800 mb-2">
                      Thông tin đăng nhập:
                    </h4>
                    <p className="text-sm text-yellow-700 mb-1">
                      <strong>Email:</strong> {studentEmail}
                    </p>
                    <p className="text-sm text-yellow-700 mb-1">
                      <strong>Mật khẩu tạm thời:</strong>
                      <span className="font-mono bg-yellow-100 px-2 py-1 rounded ml-2">
                        {tempPassword}
                      </span>
                    </p>
                    <p className="text-xs text-yellow-600 mt-2">
                      Vui lòng lưu lại thông tin này và chuyển cho học viên.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleClose}
                      className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Tạo hồ sơ học viên mới
                    </h3>
                    <button
                      onClick={handleClose}
                      className="rounded-md text-gray-400 hover:text-gray-500 p-1"
                      type="button"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full name với error display */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.full_name
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.full_name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.full_name}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Date of birth với error display */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ngày sinh
                        </label>
                        <input
                          type="date"
                          name="date_of_birth"
                          value={formData.date_of_birth}
                          onChange={handleInputChange}
                          max={new Date().toISOString().split("T")[0]}
                          min="1990-01-01"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.date_of_birth
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.date_of_birth && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.date_of_birth}
                          </p>
                        )}
                      </div>

                      {/* Gender với error display */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Giới tính
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.gender ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                        {errors.gender && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.gender}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handlePhoneInput}
                        placeholder="0901234567"
                        maxLength={10}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.phone_number
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.phone_number && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.phone_number}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        Định dạng hợp lệ: 03x, 05x, 07x, 08x, 09x (VD:
                        0901234567)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        maxLength={500}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.address ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.address}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        {formData.address.length}/500 ký tự
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Grade field với error display */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Lớp
                        </label>
                        <select
                          name="grade"
                          value={formData.grade}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.grade ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <option value="">Chọn lớp</option>
                          {grades.map((grade) => (
                            <option key={grade} value={grade}>
                              {grade}
                            </option>
                          ))}
                        </select>
                        {errors.grade && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.grade}
                          </p>
                        )}
                      </div>

                      {/* School field giữ nguyên vì đã có error handling */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Trường học
                        </label>
                        <input
                          type="text"
                          name="school"
                          value={formData.school}
                          onChange={handleInputChange}
                          maxLength={200}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.school ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errors.school && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.school}
                          </p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">
                          {formData.school.length}/200 ký tự
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Môn học quan tâm
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {subjects.map((subject) => (
                          <label key={subject} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.subjects.includes(subject)}
                              onChange={() => handleSubjectChange(subject)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {subject}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mục tiêu học tập
                      </label>
                      <textarea
                        name="learning_goals"
                        value={formData.learning_goals}
                        onChange={handleInputChange}
                        rows={3}
                        maxLength={1000}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.learning_goals
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Ví dụ: Cải thiện điểm số Toán, luyện thi IELTS..."
                      />
                      {errors.learning_goals && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.learning_goals}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        {formData.learning_goals.length}/1000 ký tự
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lịch học ưa thích
                      </label>
                      <input
                        type="text"
                        name="preferred_schedule"
                        value={formData.preferred_schedule}
                        onChange={handleInputChange}
                        maxLength={500}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.preferred_schedule
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Ví dụ: Thứ 2, 4, 6 - 19:00-21:00"
                      />
                      {errors.preferred_schedule && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.preferred_schedule}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        {formData.preferred_schedule.length}/500 ký tự
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Yêu cầu đặc biệt
                      </label>
                      <textarea
                        name="special_requirements"
                        value={formData.special_requirements}
                        onChange={handleInputChange}
                        rows={2}
                        maxLength={1000}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.special_requirements
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Ghi chú thêm về nhu cầu đặc biệt..."
                      />
                      {errors.special_requirements && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.special_requirements}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        {formData.special_requirements.length}/1000 ký tự
                      </p>
                    </div>

                    {/* ✅ Form buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !formData.full_name}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Đang tạo..." : "Tạo hồ sơ"}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default CreateStudentModal;
