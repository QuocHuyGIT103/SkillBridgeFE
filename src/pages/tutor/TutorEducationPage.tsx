import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  CameraIcon,
  DocumentTextIcon,
  TrophyIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

// Education Level Types
interface Education {
  id: string;
  level: "Trung học phổ thông" | "Đại học" | "Thạc sĩ" | "Tiến sĩ";
  school: string;
  major?: string;
  startYear: string;
  endYear: string;
  degreeImage: File | null;
}

// Certificate Types
interface Certificate {
  id: string;
  name: string;
  description: string;
  issuedBy: string;
  certificateImage: File | null;
}

// Achievement Types
interface Achievement {
  id: string;
  name: string;
  level: string;
  dateAchieved: string;
  organization: string;
  type: string;
  field: string;
  description: string;
  achievementImage: File | null;
}

const TutorEducationPage: React.FC = () => {
  // State for education
  const [education, setEducation] = useState<Education | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Edit modes
  const [editingEducation, setEditingEducation] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<string | null>(
    null
  );
  const [editingAchievement, setEditingAchievement] = useState<string | null>(
    null
  );

  // Form states
  const [educationForm, setEducationForm] = useState<Partial<Education>>({});
  const [certificateForm, setCertificateForm] = useState<Partial<Certificate>>(
    {}
  );
  const [achievementForm, setAchievementForm] = useState<Partial<Achievement>>(
    {}
  );

  // Show forms
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [showAchievementForm, setShowAchievementForm] = useState(false);

  // File refs
  const degreeInputRef = useRef<HTMLInputElement>(null);
  const certificateInputRef = useRef<HTMLInputElement>(null);
  const achievementInputRef = useRef<HTMLInputElement>(null);

  // Helper functions
  const generateId = () => Math.random().toString(36).substr(2, 9);
  const getImageUrl = (file: File | null) =>
    file ? URL.createObjectURL(file) : null;

  // Check if verification button should be shown
  const canRequestVerification = () => {
    return education && certificates.length > 0;
  };

  // Education handlers
  const handleEducationSave = () => {
    if (
      educationForm.level &&
      educationForm.school &&
      educationForm.startYear &&
      educationForm.endYear
    ) {
      const newEducation: Education = {
        id: education?.id || generateId(),
        level: educationForm.level!,
        school: educationForm.school!,
        major: educationForm.major || "",
        startYear: educationForm.startYear!,
        endYear: educationForm.endYear!,
        degreeImage: educationForm.degreeImage || null,
      };
      setEducation(newEducation);
      setEducationForm({});
      setEditingEducation(false);
      setShowEducationForm(false);
    }
  };

  const handleEducationEdit = () => {
    if (education) {
      setEducationForm({ ...education });
      setEditingEducation(true);
      setShowEducationForm(true);
    }
  };

  // Certificate handlers
  const handleCertificateAdd = () => {
    if (
      certificateForm.name &&
      certificateForm.description &&
      certificateForm.issuedBy
    ) {
      const newCertificate: Certificate = {
        id: generateId(),
        name: certificateForm.name!,
        description: certificateForm.description!,
        issuedBy: certificateForm.issuedBy!,
        certificateImage: certificateForm.certificateImage || null,
      };
      setCertificates([...certificates, newCertificate]);
      setCertificateForm({});
      setShowCertificateForm(false);
    }
  };

  const handleCertificateEdit = (id: string) => {
    const certificate = certificates.find((c) => c.id === id);
    if (certificate) {
      setCertificateForm({ ...certificate });
      setEditingCertificate(id);
    }
  };

  const handleCertificateUpdate = () => {
    if (
      editingCertificate &&
      certificateForm.name &&
      certificateForm.description &&
      certificateForm.issuedBy
    ) {
      setCertificates(
        certificates.map((c) =>
          c.id === editingCertificate
            ? ({ ...c, ...certificateForm } as Certificate)
            : c
        )
      );
      setCertificateForm({});
      setEditingCertificate(null);
    }
  };

  const handleCertificateDelete = (id: string) => {
    setCertificates(certificates.filter((c) => c.id !== id));
  };

  // Achievement handlers
  const handleAchievementAdd = () => {
    if (
      achievementForm.name &&
      achievementForm.level &&
      achievementForm.dateAchieved &&
      achievementForm.organization &&
      achievementForm.type &&
      achievementForm.field &&
      achievementForm.description
    ) {
      const newAchievement: Achievement = {
        id: generateId(),
        name: achievementForm.name!,
        level: achievementForm.level!,
        dateAchieved: achievementForm.dateAchieved!,
        organization: achievementForm.organization!,
        type: achievementForm.type!,
        field: achievementForm.field!,
        description: achievementForm.description!,
        achievementImage: achievementForm.achievementImage || null,
      };
      setAchievements([...achievements, newAchievement]);
      setAchievementForm({});
      setShowAchievementForm(false);
    }
  };

  const handleAchievementEdit = (id: string) => {
    const achievement = achievements.find((a) => a.id === id);
    if (achievement) {
      setAchievementForm({ ...achievement });
      setEditingAchievement(id);
    }
  };

  const handleAchievementUpdate = () => {
    if (
      editingAchievement &&
      achievementForm.name &&
      achievementForm.level &&
      achievementForm.dateAchieved &&
      achievementForm.organization &&
      achievementForm.type &&
      achievementForm.field &&
      achievementForm.description
    ) {
      setAchievements(
        achievements.map((a) =>
          a.id === editingAchievement
            ? ({ ...a, ...achievementForm } as Achievement)
            : a
        )
      );
      setAchievementForm({});
      setEditingAchievement(null);
    }
  };

  const handleAchievementDelete = (id: string) => {
    setAchievements(achievements.filter((a) => a.id !== id));
  };

  // File upload handlers
  const handleDegreeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEducationForm((prev) => ({ ...prev, degreeImage: file }));
    }
  };

  const handleCertificateUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setCertificateForm((prev) => ({ ...prev, certificateImage: file }));
    }
  };

  const handleAchievementUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setAchievementForm((prev) => ({ ...prev, achievementImage: file }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Học vấn & Chứng chỉ
            </h1>
            <p className="text-secondary mt-2">
              Quản lý thông tin học vấn, chứng chỉ và thành tích của bạn
            </p>
          </div>
          {canRequestVerification() && (
            <button className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <ShieldCheckIcon className="w-5 h-5" />
              <span>Yêu cầu xác thực</span>
            </button>
          )}
        </motion.div>

        {/* Education Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-6"
        >
          {/* Header với border frame */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AcademicCapIcon className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Trình độ học vấn
                </h2>
              </div>
              {!education && !showEducationForm && (
                <button
                  onClick={() => setShowEducationForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Thêm học vấn</span>
                </button>
              )}
              {education && !editingEducation && (
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

          {/* Education Display */}
          {education && !editingEducation && (
            <div className="bg-accent/10 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Trình độ
                  </label>
                  <p className="text-lg font-semibold text-primary">
                    {education.level}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Trường
                  </label>
                  <p className="text-lg text-gray-900 dark:text-gray-100">
                    {education.school}
                  </p>
                </div>
                {education.major && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Chuyên ngành
                    </label>
                    <p className="text-lg text-gray-900 dark:text-gray-100">
                      {education.major}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Thời gian học
                  </label>
                  <p className="text-lg text-gray-900 dark:text-gray-100">
                    {education.startYear} - {education.endYear}
                  </p>
                </div>
              </div>

              {education.degreeImage && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Ảnh bằng cấp
                  </label>
                  <img
                    src={getImageUrl(education.degreeImage)!}
                    alt="Degree"
                    className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-accent/30"
                  />
                </div>
              )}
            </div>
          )}

          {/* Education Form */}
          {(showEducationForm || editingEducation) && (
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
                        level: e.target.value as Education["level"],
                      }))
                    }
                    className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Chọn trình độ</option>
                    <option value="Trung học phổ thông">
                      Trung học phổ thông
                    </option>
                    <option value="Đại học">Đại học</option>
                    <option value="Thạc sĩ">Thạc sĩ</option>
                    <option value="Tiến sĩ">Tiến sĩ</option>
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
                      value={educationForm.startYear || ""}
                      onChange={(e) =>
                        setEducationForm((prev) => ({
                          ...prev,
                          startYear: e.target.value,
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
                      value={educationForm.endYear || ""}
                      onChange={(e) =>
                        setEducationForm((prev) => ({
                          ...prev,
                          endYear: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="2024"
                    />
                  </div>
                </div>
              </div>

              {/* Degree Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ảnh bằng cấp
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => degreeInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 bg-accent text-primary rounded-lg hover:bg-accent/80 transition-colors"
                  >
                    <CameraIcon className="w-4 h-4" />
                    <span>Chọn ảnh</span>
                  </button>
                  {educationForm.degreeImage && (
                    <span className="text-sm text-green-600">Đã chọn ảnh</span>
                  )}
                </div>
                <input
                  ref={degreeInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleDegreeUpload}
                  className="hidden"
                />
                {educationForm.degreeImage && (
                  <img
                    src={getImageUrl(educationForm.degreeImage)!}
                    alt="Degree preview"
                    className="mt-2 w-64 h-32 object-cover rounded-lg border-2 border-accent/30"
                  />
                )}
              </div>

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
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <CheckIcon className="w-4 h-4 inline mr-2" />
                  Lưu
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Certificates Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-6"
        >
          {/* Header với border frame */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Chứng chỉ ({certificates.length})
                </h2>
              </div>
              <button
                onClick={() => setShowCertificateForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Thêm chứng chỉ</span>
              </button>
            </div>
          </div>

          {/* Certificate List */}
          <div className="space-y-4 mb-6">
            {certificates.map((certificate) => (
              <div key={certificate.id} className="bg-accent/10 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-primary">
                    {certificate.name}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCertificateEdit(certificate.id)}
                      className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCertificateDelete(certificate.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {certificate.description}
                </p>
                <p className="text-sm text-secondary">
                  Được cấp bởi: {certificate.issuedBy}
                </p>
                {certificate.certificateImage && (
                  <img
                    src={getImageUrl(certificate.certificateImage)!}
                    alt={certificate.name}
                    className="mt-3 w-64 h-32 object-cover rounded-lg border-2 border-accent/30"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Certificate Form */}
          {(showCertificateForm || editingCertificate) && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingCertificate
                  ? "Chỉnh sửa chứng chỉ"
                  : "Thêm chứng chỉ mới"}
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên chứng chỉ *
                </label>
                <input
                  type="text"
                  value={certificateForm.name || ""}
                  onChange={(e) =>
                    setCertificateForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nhập tên chứng chỉ..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mô tả *
                </label>
                <textarea
                  value={certificateForm.description || ""}
                  onChange={(e) =>
                    setCertificateForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Mô tả về chứng chỉ..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Được cấp bởi *
                </label>
                <input
                  type="text"
                  value={certificateForm.issuedBy || ""}
                  onChange={(e) =>
                    setCertificateForm((prev) => ({
                      ...prev,
                      issuedBy: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Tổ chức cấp chứng chỉ..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ảnh chứng chỉ
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => certificateInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 bg-accent text-primary rounded-lg hover:bg-accent/80 transition-colors"
                  >
                    <CameraIcon className="w-4 h-4" />
                    <span>Chọn ảnh</span>
                  </button>
                  {certificateForm.certificateImage && (
                    <span className="text-sm text-green-600">Đã chọn ảnh</span>
                  )}
                </div>
                <input
                  ref={certificateInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCertificateUpload}
                  className="hidden"
                />
                {certificateForm.certificateImage && (
                  <img
                    src={getImageUrl(certificateForm.certificateImage)!}
                    alt="Certificate preview"
                    className="mt-2 w-64 h-32 object-cover rounded-lg border-2 border-accent/30"
                  />
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setCertificateForm({});
                    setEditingCertificate(null);
                    setShowCertificateForm(false);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={
                    editingCertificate
                      ? handleCertificateUpdate
                      : handleCertificateAdd
                  }
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <CheckIcon className="w-4 h-4 inline mr-2" />
                  {editingCertificate ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
        >
          {/* Header với border frame */}
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
              <div key={achievement.id} className="bg-accent/10 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-primary">
                    {achievement.name}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAchievementEdit(achievement.id)}
                      className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAchievementDelete(achievement.id)}
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
                    {new Date(achievement.dateAchieved).toLocaleDateString(
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

                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {achievement.description}
                </p>

                {achievement.achievementImage && (
                  <img
                    src={getImageUrl(achievement.achievementImage)!}
                    alt={achievement.name}
                    className="w-64 h-32 object-cover rounded-lg border-2 border-accent/30"
                  />
                )}
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
                    Tên thành tích *
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
                    placeholder="Nhập tên thành tích..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cấp độ / Phạm vi *
                  </label>
                  <input
                    type="text"
                    value={achievementForm.level || ""}
                    onChange={(e) =>
                      setAchievementForm((prev) => ({
                        ...prev,
                        level: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="VD: Quốc gia, Khu vực, Địa phương..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ngày đạt được *
                  </label>
                  <input
                    type="date"
                    value={achievementForm.dateAchieved || ""}
                    onChange={(e) =>
                      setAchievementForm((prev) => ({
                        ...prev,
                        dateAchieved: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tổ chức trao tặng *
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
                    placeholder="Tên tổ chức, đơn vị..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hình thức thành tích *
                  </label>
                  <input
                    type="text"
                    value={achievementForm.type || ""}
                    onChange={(e) =>
                      setAchievementForm((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="VD: Giải thưởng, Bằng khen, Chứng nhận..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nội dung / Lĩnh vực *
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
                    placeholder="VD: Toán học, Văn học, Thể thao..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ý nghĩa / Mô tả ngắn gọn *
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
                  placeholder="Mô tả ngắn gọn về thành tích và ý nghĩa của nó..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ảnh thành tích
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => achievementInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 bg-accent text-primary rounded-lg hover:bg-accent/80 transition-colors"
                  >
                    <CameraIcon className="w-4 h-4" />
                    <span>Chọn ảnh</span>
                  </button>
                  {achievementForm.achievementImage && (
                    <span className="text-sm text-green-600">Đã chọn ảnh</span>
                  )}
                </div>
                <input
                  ref={achievementInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAchievementUpload}
                  className="hidden"
                />
                {achievementForm.achievementImage && (
                  <img
                    src={getImageUrl(achievementForm.achievementImage)!}
                    alt="Achievement preview"
                    className="mt-2 w-64 h-32 object-cover rounded-lg border-2 border-accent/30"
                  />
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setAchievementForm({});
                    setEditingAchievement(null);
                    setShowAchievementForm(false);
                  }}
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
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <CheckIcon className="w-4 h-4 inline mr-2" />
                  {editingAchievement ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Verification Notice */}
        {!canRequestVerification() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-6"
          >
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  Chưa đủ điều kiện xác thực
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  Để yêu cầu xác thực, bạn cần hoàn thành ít nhất:
                </p>
                <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                  <li>Một trình độ học vấn</li>
                  <li>Ít nhất một chứng chỉ</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TutorEducationPage;
