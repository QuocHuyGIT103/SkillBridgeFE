import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { EducationLevel } from "../../types/qualification.types";
import type {
  CreateEducationRequest,
  Education,
} from "../../types/qualification.types";

interface EducationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEducationRequest) => void;
  initialData?: Education | null;
}

const EducationForm: React.FC<EducationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<CreateEducationRequest>({
    level: EducationLevel.UNIVERSITY,
    school: "",
    major: "",
    startYear: new Date().getFullYear() - 4,
    endYear: new Date().getFullYear(),
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        level: initialData.level,
        school: initialData.school,
        major: initialData.major,
        startYear: initialData.startYear,
        endYear: initialData.endYear,
      });
      if (initialData.imgUrl) {
        setImagePreview(initialData.imgUrl);
      }
    } else {
      setFormData({
        level: EducationLevel.UNIVERSITY,
        school: "",
        major: "",
        startYear: new Date().getFullYear() - 4,
        endYear: new Date().getFullYear(),
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      image: imageFile || undefined,
    };
    onSubmit(submitData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? "Chỉnh sửa học vấn" : "Thêm thông tin học vấn"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trình độ học vấn *
              </label>
              <select
                value={formData.level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    level: e.target.value as EducationLevel,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value={EducationLevel.HIGH_SCHOOL}>
                  Trung học phổ thông
                </option>
                <option value={EducationLevel.COLLEGE}>Cao đẳng</option>
                <option value={EducationLevel.UNIVERSITY}>Đại học</option>
                <option value={EducationLevel.MASTER}>Thạc sĩ</option>
                <option value={EducationLevel.PHD}>Tiến sĩ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên trường *
              </label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) =>
                  setFormData({ ...formData, school: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ví dụ: Đại học Bách Khoa Hà Nội"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chuyên ngành
            </label>
            <input
              type="text"
              value={formData.major}
              onChange={(e) =>
                setFormData({ ...formData, major: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ví dụ: Khoa học máy tính"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Năm bắt đầu *
              </label>
              <input
                type="number"
                value={formData.startYear}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startYear: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                min="1950"
                max={new Date().getFullYear()}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Năm kết thúc *
              </label>
              <input
                type="number"
                value={formData.endYear}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endYear: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                min={formData.startYear}
                max={new Date().getFullYear() + 10}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh bằng cấp
            </label>
            <div className="space-y-4">
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-gray-500">
                Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              {initialData ? "Cập nhật" : "Thêm học vấn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EducationForm;


