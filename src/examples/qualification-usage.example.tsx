/**
 * EXAMPLE: Cách sử dụng Qualification và Verification Services/Stores
 *
 * File này minh họa cách sử dụng các service và store đã tạo
 * để quản lý thông tin trình độ và yêu cầu xác thực
 */

import React, { useEffect, useState } from "react";
import { useQualificationStore } from "../store/qualification.store";
import { useVerificationStore } from "../store/verification.store";
import type {
  EducationLevel,
  AchievementLevel,
  AchievementType,
  CreateEducationRequest,
  CreateCertificateRequest,
  CreateAchievementRequest,
  CreateVerificationRequest,
} from "../types/qualification.types";

// ==================== EXAMPLE COMPONENT ====================

const QualificationManagementExample: React.FC = () => {
  // Stores
  const {
    qualifications,
    qualificationInfo,
    isLoading,
    fetchQualifications,
    createEducation,
    createCertificate,
    createAchievement,
    canSubmitVerification,
    getQualificationSuggestion,
  } = useQualificationStore();

  const {
    createVerificationRequest,
    tutorRequests,
    fetchTutorVerificationRequests,
  } = useVerificationStore();

  // Local state for forms
  const [educationForm, setEducationForm] = useState<CreateEducationRequest>({
    level: EducationLevel.UNIVERSITY,
    school: "",
    major: "",
    startYear: new Date().getFullYear() - 4,
    endYear: new Date().getFullYear(),
  });

  const [certificateForm, setCertificateForm] =
    useState<CreateCertificateRequest>({
      name: "",
      issuingOrganization: "",
      issueDate: "",
      description: "",
    });

  const [achievementForm, setAchievementForm] =
    useState<CreateAchievementRequest>({
      name: "",
      level: AchievementLevel.NATIONAL,
      achievedDate: "",
      awardingOrganization: "",
      type: AchievementType.COMPETITION,
      field: "",
      description: "",
    });

  // Load qualifications on component mount
  useEffect(() => {
    fetchQualifications();
    fetchTutorVerificationRequests();
  }, [fetchQualifications, fetchTutorVerificationRequests]);

  // ==================== HANDLERS ====================

  const handleCreateEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEducation(educationForm);
      setEducationForm({
        level: EducationLevel.UNIVERSITY,
        school: "",
        major: "",
        startYear: new Date().getFullYear() - 4,
        endYear: new Date().getFullYear(),
      });
    } catch (error) {
      console.error("Error creating education:", error);
    }
  };

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCertificate(certificateForm);
      setCertificateForm({
        name: "",
        issuingOrganization: "",
        issueDate: "",
        description: "",
      });
    } catch (error) {
      console.error("Error creating certificate:", error);
    }
  };

  const handleCreateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAchievement(achievementForm);
      setAchievementForm({
        name: "",
        level: AchievementLevel.NATIONAL,
        achievedDate: "",
        awardingOrganization: "",
        type: AchievementType.COMPETITION,
        field: "",
        description: "",
      });
    } catch (error) {
      console.error("Error creating achievement:", error);
    }
  };

  const handleSubmitVerification = async () => {
    if (!canSubmitVerification()) return;

    try {
      const requestData: CreateVerificationRequest = {};

      // Add education if exists and needs verification
      if (
        qualifications?.education &&
        qualifications.education.status !== "VERIFIED"
      ) {
        requestData.educationId = qualifications.education.id;
      }

      // Add certificates that need verification
      const pendingCertificates =
        qualifications?.certificates
          .filter((cert) => cert.status !== "VERIFIED")
          .map((cert) => cert.id) || [];
      if (pendingCertificates.length > 0) {
        requestData.certificateIds = pendingCertificates;
      }

      // Add achievements that need verification
      const pendingAchievements =
        qualifications?.achievements
          .filter((achievement) => achievement.status !== "VERIFIED")
          .map((achievement) => achievement.id) || [];
      if (pendingAchievements.length > 0) {
        requestData.achievementIds = pendingAchievements;
      }

      await createVerificationRequest(requestData);
    } catch (error) {
      console.error("Error submitting verification request:", error);
    }
  };

  // ==================== RENDER ====================

  if (isLoading) {
    return <div>Đang tải thông tin trình độ...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quản lý Thông tin Trình độ</h1>

      {/* Qualification Status */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Trạng thái Trình độ</h2>
        {qualificationInfo && (
          <div>
            <p className="text-sm text-gray-600 mb-2">
              {qualificationInfo.suggestion}
            </p>
            <div className="flex gap-4 text-sm">
              <span>
                Đủ điều kiện: {qualificationInfo.isQualified ? "Có" : "Chưa"}
              </span>
              <span>
                Có thể gửi yêu cầu:{" "}
                {qualificationInfo.canSubmitVerification ? "Có" : "Không"}
              </span>
              <span>
                Đang chờ xác thực: {qualificationInfo.pendingVerificationCount}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Current Qualifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Education */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Học vấn</h3>
          {qualifications?.education ? (
            <div>
              <p>{qualifications.education.school}</p>
              <p className="text-sm text-gray-600">
                {qualifications.education.major}
              </p>
              <span
                className={`inline-block px-2 py-1 rounded text-xs ${
                  qualifications.education.status === "VERIFIED"
                    ? "bg-green-100 text-green-800"
                    : qualifications.education.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {qualifications.education.status}
              </span>
            </div>
          ) : (
            <p className="text-gray-500">Chưa có thông tin học vấn</p>
          )}
        </div>

        {/* Certificates */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">
            Chứng chỉ ({qualifications?.certificates.length || 0})
          </h3>
          {qualifications?.certificates.length ? (
            <div className="space-y-2">
              {qualifications.certificates.slice(0, 3).map((cert) => (
                <div key={cert.id} className="text-sm">
                  <p>{cert.name}</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${
                      cert.status === "VERIFIED"
                        ? "bg-green-100 text-green-800"
                        : cert.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : cert.status === "DRAFT"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {cert.status === "DRAFT" ? "Bản nháp" : cert.status}
                  </span>
                </div>
              ))}
              {qualifications.certificates.length > 3 && (
                <p className="text-xs text-gray-500">
                  +{qualifications.certificates.length - 3} khác
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Chưa có chứng chỉ</p>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">
            Thành tích ({qualifications?.achievements.length || 0})
          </h3>
          {qualifications?.achievements.length ? (
            <div className="space-y-2">
              {qualifications.achievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="text-sm">
                  <p>{achievement.name}</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${
                      achievement.status === "VERIFIED"
                        ? "bg-green-100 text-green-800"
                        : achievement.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {achievement.status}
                  </span>
                </div>
              ))}
              {qualifications.achievements.length > 3 && (
                <p className="text-xs text-gray-500">
                  +{qualifications.achievements.length - 3} khác
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Chưa có thành tích</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={handleSubmitVerification}
          disabled={!canSubmitVerification()}
          className={`px-4 py-2 rounded ${
            canSubmitVerification()
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Gửi Yêu cầu Xác thực
        </button>
        <button
          onClick={() => fetchQualifications()}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Làm mới
        </button>
      </div>

      {/* Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Education Form */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-4">Thêm Học vấn</h3>
          <form onSubmit={handleCreateEducation} className="space-y-3">
            <select
              value={educationForm.level}
              onChange={(e) =>
                setEducationForm({
                  ...educationForm,
                  level: e.target.value as EducationLevel,
                })
              }
              className="w-full p-2 border rounded"
            >
              <option value={EducationLevel.HIGH_SCHOOL}>
                Trung học phổ thông
              </option>
              <option value={EducationLevel.COLLEGE}>Cao đẳng</option>
              <option value={EducationLevel.UNIVERSITY}>Đại học</option>
              <option value={EducationLevel.MASTER}>Thạc sĩ</option>
              <option value={EducationLevel.PHD}>Tiến sĩ</option>
            </select>
            <input
              type="text"
              placeholder="Tên trường"
              value={educationForm.school}
              onChange={(e) =>
                setEducationForm({ ...educationForm, school: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Chuyên ngành"
              value={educationForm.major}
              onChange={(e) =>
                setEducationForm({ ...educationForm, major: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Năm bắt đầu"
                value={educationForm.startYear}
                onChange={(e) =>
                  setEducationForm({
                    ...educationForm,
                    startYear: parseInt(e.target.value),
                  })
                }
                className="p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Năm kết thúc"
                value={educationForm.endYear}
                onChange={(e) =>
                  setEducationForm({
                    ...educationForm,
                    endYear: parseInt(e.target.value),
                  })
                }
                className="p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Thêm Học vấn
            </button>
          </form>
        </div>

        {/* Certificate Form */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-4">Thêm Chứng chỉ</h3>
          <form onSubmit={handleCreateCertificate} className="space-y-3">
            <input
              type="text"
              placeholder="Tên chứng chỉ"
              value={certificateForm.name}
              onChange={(e) =>
                setCertificateForm({ ...certificateForm, name: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Tổ chức cấp"
              value={certificateForm.issuingOrganization}
              onChange={(e) =>
                setCertificateForm({
                  ...certificateForm,
                  issuingOrganization: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="date"
              placeholder="Ngày cấp"
              value={certificateForm.issueDate}
              onChange={(e) =>
                setCertificateForm({
                  ...certificateForm,
                  issueDate: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
            <textarea
              placeholder="Mô tả"
              value={certificateForm.description}
              onChange={(e) =>
                setCertificateForm({
                  ...certificateForm,
                  description: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              rows={3}
            />
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              Thêm Chứng chỉ
            </button>
          </form>
        </div>

        {/* Achievement Form */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-4">Thêm Thành tích</h3>
          <form onSubmit={handleCreateAchievement} className="space-y-3">
            <input
              type="text"
              placeholder="Tên thành tích"
              value={achievementForm.name}
              onChange={(e) =>
                setAchievementForm({ ...achievementForm, name: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
            <select
              value={achievementForm.level}
              onChange={(e) =>
                setAchievementForm({
                  ...achievementForm,
                  level: e.target.value as AchievementLevel,
                })
              }
              className="w-full p-2 border rounded"
            >
              <option value={AchievementLevel.INTERNATIONAL}>Quốc tế</option>
              <option value={AchievementLevel.NATIONAL}>Quốc gia</option>
              <option value={AchievementLevel.REGIONAL}>Khu vực</option>
              <option value={AchievementLevel.LOCAL}>Địa phương</option>
              <option value={AchievementLevel.INSTITUTIONAL}>Trường học</option>
            </select>
            <select
              value={achievementForm.type}
              onChange={(e) =>
                setAchievementForm({
                  ...achievementForm,
                  type: e.target.value as AchievementType,
                })
              }
              className="w-full p-2 border rounded"
            >
              <option value={AchievementType.COMPETITION}>Cuộc thi</option>
              <option value={AchievementType.SCHOLARSHIP}>Học bổng</option>
              <option value={AchievementType.RESEARCH}>Nghiên cứu</option>
              <option value={AchievementType.PUBLICATION}>Công bố</option>
              <option value={AchievementType.OTHER}>Khác</option>
            </select>
            <input
              type="text"
              placeholder="Lĩnh vực"
              value={achievementForm.field}
              onChange={(e) =>
                setAchievementForm({
                  ...achievementForm,
                  field: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="date"
              placeholder="Ngày đạt được"
              value={achievementForm.achievedDate}
              onChange={(e) =>
                setAchievementForm({
                  ...achievementForm,
                  achievedDate: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Tổ chức trao tặng"
              value={achievementForm.awardingOrganization}
              onChange={(e) =>
                setAchievementForm({
                  ...achievementForm,
                  awardingOrganization: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
            >
              Thêm Thành tích
            </button>
          </form>
        </div>
      </div>

      {/* Verification Requests History */}
      <div className="mt-8 bg-white p-4 rounded-lg border">
        <h3 className="font-semibold mb-4">Lịch sử Yêu cầu Xác thực</h3>
        {tutorRequests.length > 0 ? (
          <div className="space-y-3">
            {tutorRequests.map((request) => (
              <div key={request.id} className="p-3 border rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      Yêu cầu #{request.id.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Gửi lúc: {new Date(request.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      request.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : request.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : request.status === "PARTIALLY_APPROVED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
                {request.adminNote && (
                  <p className="text-sm text-gray-600 mt-2">
                    Ghi chú: {request.adminNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Chưa có yêu cầu xác thực nào</p>
        )}
      </div>
    </div>
  );
};

export default QualificationManagementExample;
