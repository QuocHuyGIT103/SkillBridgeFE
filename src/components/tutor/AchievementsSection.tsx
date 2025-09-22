import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrophyIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import useAchievementStore from "../../store/achievement.store";
import {
  AchievementType,
  AchievementLevel,
} from "../../services/achievement.service";
import type { CreateAchievementFormData } from "../../services/achievement.service";
import VerificationStatus from "./VerificationStatus";
import ImageUploader from "./ImageUploader";

const AchievementsSection: React.FC = () => {
  const {
    achievements,
    isSubmitting,
    createAchievement,
    updateAchievement,
    deleteAchievement,
  } = useAchievementStore();

  const [editingAchievement, setEditingAchievement] = useState<string | null>(
    null
  );
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [achievementForm, setAchievementForm] =
    useState<CreateAchievementFormData>({
      name: "",
      level: AchievementLevel.LOCAL,
      date_achieved: "",
      organization: "",
      type: AchievementType.OTHER,
      field: "",
      description: "",
    });

  const handleAchievementAdd = async () => {
    if (
      achievementForm.name &&
      achievementForm.level &&
      achievementForm.date_achieved &&
      achievementForm.organization &&
      achievementForm.type &&
      achievementForm.field &&
      achievementForm.description
    ) {
      try {
        await createAchievement(achievementForm);
        resetForm();
      } catch (error) {
        console.error("Error creating achievement:", error);
      }
    }
  };

  const handleAchievementEdit = (id: string) => {
    const achievement = achievements.find((a) => a._id === id);
    if (achievement) {
      setAchievementForm({
        name: achievement.name,
        level: achievement.level,
        date_achieved: achievement.date_achieved,
        organization: achievement.organization,
        type: achievement.type,
        field: achievement.field,
        description: achievement.description,
      });
      setEditingAchievement(id);
      setShowAchievementForm(true);
    }
  };

  const handleAchievementUpdate = async () => {
    if (
      editingAchievement &&
      achievementForm.name &&
      achievementForm.level &&
      achievementForm.date_achieved &&
      achievementForm.organization &&
      achievementForm.type &&
      achievementForm.field &&
      achievementForm.description
    ) {
      try {
        await updateAchievement(editingAchievement, achievementForm);
        resetForm();
      } catch (error) {
        console.error("Error updating achievement:", error);
      }
    }
  };

  const handleAchievementDelete = async (id: string) => {
    try {
      await deleteAchievement(id);
    } catch (error) {
      console.error("Error deleting achievement:", error);
    }
  };

  const handleImageUpload = (file: File) => {
    setAchievementForm((prev) => ({ ...prev, achievement_image: file }));
  };

  const resetForm = () => {
    setAchievementForm({
      name: "",
      level: AchievementLevel.LOCAL,
      date_achieved: "",
      organization: "",
      type: AchievementType.OTHER,
      field: "",
      description: "",
      achievement_image: undefined,
    });
    setEditingAchievement(null);
    setShowAchievementForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TrophyIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Thành tích ({achievements.length})
            </h2>
            <span className="text-sm text-gray-500">(Tùy chọn)</span>
          </div>
          <button
            onClick={() => setShowAchievementForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Thêm thành tích</span>
          </button>
        </div>
      </div>

      {/* Achievement List */}
      <div className="space-y-4 mb-6">
        {achievements.map((achievement) => (
          <div key={achievement._id} className="bg-accent/10 rounded-lg p-4">
            {/* Verification Status */}
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Trạng thái xác thực:
                </span>
                <VerificationStatus isVerified={achievement.is_verified} />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Information Section */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-primary">
                    {achievement.name}
                  </h3>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleAchievementEdit(achievement._id)}
                      className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAchievementDelete(achievement._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <span className="font-medium">Cấp độ/Phạm vi:</span>{" "}
                    {achievement.level}
                  </div>
                  <div>
                    <span className="font-medium">Thời gian:</span>{" "}
                    {new Date(achievement.date_achieved).toLocaleDateString(
                      "vi-VN"
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Tổ chức trao:</span>{" "}
                    {achievement.organization}
                  </div>
                  <div>
                    <span className="font-medium">Hình thức:</span>{" "}
                    {achievement.type}
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">Lĩnh vực:</span>{" "}
                    {achievement.field}
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300">
                  {achievement.description}
                </p>
              </div>

              {/* Image Section */}
              {achievement.achievement_image_url && (
                <div className="flex-shrink-0 lg:w-80">
                  <img
                    src={achievement.achievement_image_url}
                    alt={achievement.name}
                    className="w-full h-48 lg:h-64 object-cover rounded-lg border-2 border-accent/30"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Achievement Form */}
      {(showAchievementForm || editingAchievement) && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {editingAchievement
              ? "Chỉnh sửa thành tích"
              : "Thêm thành tích mới"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên thành tích <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={achievementForm.name || ""}
                onChange={(e) =>
                  setAchievementForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="VD: Giải Nhất Olympic Toán, Sinh viên xuất sắc..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cấp độ / Phạm vi <span className="text-red-500">*</span>
              </label>
              <select
                value={achievementForm.level || ""}
                onChange={(e) =>
                  setAchievementForm((prev) => ({
                    ...prev,
                    level: e.target.value as AchievementLevel,
                  }))
                }
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">-- Chọn cấp độ --</option>
                <option value={AchievementLevel.INTERNATIONAL}>Quốc tế</option>
                <option value={AchievementLevel.NATIONAL}>Quốc gia</option>
                <option value={AchievementLevel.REGIONAL}>Khu vực</option>
                <option value={AchievementLevel.LOCAL}>Địa phương</option>
                <option value={AchievementLevel.INSTITUTIONAL}>
                  Cơ quan/Trường học
                </option>
                <option value={AchievementLevel.OTHER}>Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ngày đạt được <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={achievementForm.date_achieved || ""}
                onChange={(e) =>
                  setAchievementForm((prev) => ({
                    ...prev,
                    date_achieved: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tổ chức trao tặng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={achievementForm.organization || ""}
                onChange={(e) =>
                  setAchievementForm((prev) => ({
                    ...prev,
                    organization: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="VD: Bộ Giáo dục, Đại học ABC, UBND tỉnh..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hình thức thành tích <span className="text-red-500">*</span>
              </label>
              <select
                value={achievementForm.type || ""}
                onChange={(e) =>
                  setAchievementForm((prev) => ({
                    ...prev,
                    type: e.target.value as AchievementType,
                  }))
                }
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">-- Chọn hình thức --</option>
                <option value={AchievementType.COMPETITION}>Cuộc thi</option>
                <option value={AchievementType.AWARD}>Giải thưởng</option>
                <option value={AchievementType.CERTIFICATION}>
                  Chứng nhận
                </option>
                <option value={AchievementType.PUBLICATION}>Xuất bản</option>
                <option value={AchievementType.RESEARCH}>Nghiên cứu</option>
                <option value={AchievementType.PROJECT}>Dự án</option>
                <option value={AchievementType.OTHER}>Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lĩnh vực / Môn học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={achievementForm.field || ""}
                onChange={(e) =>
                  setAchievementForm((prev) => ({
                    ...prev,
                    field: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="VD: Toán học, Văn học, Thể thao, Tin học..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ý nghĩa / Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              value={achievementForm.description || ""}
              onChange={(e) =>
                setAchievementForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Mô tả chi tiết về thành tích, ý nghĩa và tác động của nó đến việc giảng dạy..."
            />
          </div>

          {/* Image Upload */}
          <ImageUploader
            label="Ảnh thành tích"
            currentImage={achievementForm.achievement_image}
            onImageUpload={handleImageUpload}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={
                editingAchievement
                  ? handleAchievementUpdate
                  : handleAchievementAdd
              }
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
                  {editingAchievement ? "Đang cập nhật..." : "Đang thêm..."}
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4 inline mr-2" />
                  {editingAchievement ? "Cập nhật" : "Thêm"}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AchievementsSection;
