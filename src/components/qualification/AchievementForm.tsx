import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  AchievementLevel,
  AchievementType,
} from "../../types/qualification.types";
import type {
  CreateAchievementRequest,
  Achievement,
} from "../../types/qualification.types";

interface AchievementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAchievementRequest) => void;
  initialData?: Achievement | null;
}

const AchievementForm: React.FC<AchievementFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<CreateAchievementRequest>({
    name: "",
    level: AchievementLevel.NATIONAL,
    achievedDate: "",
    awardingOrganization: "",
    type: AchievementType.COMPETITION,
    field: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        level: initialData.level,
        achievedDate: initialData.achievedDate.split("T")[0], // Convert to YYYY-MM-DD format
        awardingOrganization: initialData.awardingOrganization,
        type: initialData.type,
        field: initialData.field,
        description: initialData.description || "",
      });
      if (initialData.imgUrl) {
        setImagePreview(initialData.imgUrl);
      }
    } else {
      setFormData({
        name: "",
        level: AchievementLevel.NATIONAL,
        achievedDate: "",
        awardingOrganization: "",
        type: AchievementType.COMPETITION,
        field: "",
        description: "",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay backdrop - click to close */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="relative bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? "Chỉnh sửa thành tích" : "Thêm thành tích mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên thành tích *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ví dụ: Giải nhất Olympic Tin học"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cấp độ *
              </label>
              <select
                value={formData.level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    level: e.target.value as AchievementLevel,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value={AchievementLevel.INTERNATIONAL}>Quốc tế</option>
                <option value={AchievementLevel.NATIONAL}>Quốc gia</option>
                <option value={AchievementLevel.REGIONAL}>Khu vực</option>
                <option value={AchievementLevel.LOCAL}>Địa phương</option>
                <option value={AchievementLevel.INSTITUTIONAL}>
                  Trường học
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại thành tích *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as AchievementType,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value={AchievementType.COMPETITION}>Cuộc thi</option>
                <option value={AchievementType.SCHOLARSHIP}>Học bổng</option>
                <option value={AchievementType.RESEARCH}>Nghiên cứu</option>
                <option value={AchievementType.PUBLICATION}>Công bố</option>
                <option value={AchievementType.OTHER}>Khác</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lĩnh vực *
              </label>
              <input
                type="text"
                value={formData.field}
                onChange={(e) =>
                  setFormData({ ...formData, field: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ví dụ: Tin học, Toán học"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày đạt được *
              </label>
              <input
                type="date"
                value={formData.achievedDate}
                onChange={(e) =>
                  setFormData({ ...formData, achievedDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tổ chức trao tặng *
            </label>
            <input
              type="text"
              value={formData.awardingOrganization}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  awardingOrganization: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ví dụ: Bộ GD&ĐT, Trường Đại học..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              placeholder="Mô tả chi tiết về thành tích..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh thành tích
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
              {initialData ? "Cập nhật" : "Thêm thành tích"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AchievementForm;
