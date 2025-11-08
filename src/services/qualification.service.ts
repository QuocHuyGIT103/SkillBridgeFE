import axiosClient from "../api/axiosClient";
import type {
  Education,
  Certificate,
  Achievement,
  QualificationsData,
  QualificationInfo,
  CreateEducationRequest,
  UpdateEducationRequest,
  CreateCertificateRequest,
  UpdateCertificateRequest,
  CreateAchievementRequest,
  UpdateAchievementRequest,
} from "../types/qualification.types";

const QualificationService = {
  // ==================== QUALIFICATIONS OVERVIEW ====================

  /**
   * Lấy toàn bộ thông tin trình độ của gia sư kèm gợi ý hành động
   */
  getQualifications: async () => {
    try {
      const response = await axiosClient.get<{
        success: boolean;
        message: string;
        data: QualificationsData;
        qualification: QualificationInfo;
      }>("/tutor/qualifications");
      console.log("Response service:", response);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ==================== EDUCATION MANAGEMENT ====================

  /**
   * Tạo thông tin học vấn mới (có thể kèm ảnh)
   */
  createEducation: async (data: CreateEducationRequest) => {
    try {
      const formData = new FormData();
      formData.append("level", data.level);
      formData.append("school", data.school);
      if (data.major) formData.append("major", data.major);
      formData.append("startYear", data.startYear.toString());
      formData.append("endYear", data.endYear.toString());
      if (data.image) formData.append("image", data.image);

      const response = await axiosClient.post<{
        success: boolean;
        message: string;
        data: Education;
        qualification: QualificationInfo;
      }>("/tutor/education", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật thông tin học vấn (có thể kèm ảnh mới)
   */
  updateEducation: async (data: UpdateEducationRequest) => {
    try {
      const formData = new FormData();
      if (data.level) formData.append("level", data.level);
      if (data.school) formData.append("school", data.school);
      if (data.major) formData.append("major", data.major);
      if (data.startYear)
        formData.append("startYear", data.startYear.toString());
      if (data.endYear) formData.append("endYear", data.endYear.toString());
      if (data.image) formData.append("image", data.image);

      const response = await axiosClient.put<{
        success: boolean;
        message: string;
        data: Education;
        qualification: QualificationInfo;
      }>("/tutor/education", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ==================== CERTIFICATE MANAGEMENT ====================

  /**
   * Tạo chứng chỉ mới (có thể kèm ảnh)
   */
  createCertificate: async (data: CreateCertificateRequest) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("issuingOrganization", data.issuingOrganization);
      formData.append("issueDate", data.issueDate);
      if (data.expiryDate) formData.append("expiryDate", data.expiryDate);
      if (data.description) formData.append("description", data.description);
      if (data.image) formData.append("image", data.image);

      const response = await axiosClient.post<{
        success: boolean;
        message: string;
        data: Certificate;
        qualification: QualificationInfo;
      }>("/tutor/certificates", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật chứng chỉ (có thể kèm ảnh mới)
   */
  updateCertificate: async (id: string, data: UpdateCertificateRequest) => {
    try {
      const formData = new FormData();
      if (data.name) formData.append("name", data.name);
      if (data.issuingOrganization)
        formData.append("issuingOrganization", data.issuingOrganization);
      if (data.issueDate) formData.append("issueDate", data.issueDate);
      if (data.expiryDate) formData.append("expiryDate", data.expiryDate);
      if (data.description) formData.append("description", data.description);
      if (data.image) formData.append("image", data.image);

      const response = await axiosClient.put<{
        success: boolean;
        message: string;
        data: Certificate;
        qualification: QualificationInfo;
      }>(`/tutor/certificates/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa chứng chỉ
   */
  deleteCertificate: async (id: string): Promise<void> => {
    try {
      await axiosClient.delete(`/tutor/certificates/${id}`);
    } catch (error) {
      throw error;
    }
  },

  // ==================== ACHIEVEMENT MANAGEMENT ====================

  /**
   * Tạo thành tích mới (có thể kèm ảnh)
   */
  createAchievement: async (data: CreateAchievementRequest) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("level", data.level);
      formData.append("achievedDate", data.achievedDate);
      formData.append("awardingOrganization", data.awardingOrganization);
      formData.append("type", data.type);
      formData.append("field", data.field);
      if (data.description) formData.append("description", data.description);
      if (data.image) formData.append("image", data.image);

      const response = await axiosClient.post<{
        success: boolean;
        message: string;
        data: Achievement;
        qualification: QualificationInfo;
      }>("/tutor/achievements", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật thành tích (có thể kèm ảnh mới)
   */
  updateAchievement: async (id: string, data: UpdateAchievementRequest) => {
    try {
      const formData = new FormData();
      if (data.name) formData.append("name", data.name);
      if (data.level) formData.append("level", data.level);
      if (data.achievedDate) formData.append("achievedDate", data.achievedDate);
      if (data.awardingOrganization)
        formData.append("awardingOrganization", data.awardingOrganization);
      if (data.type) formData.append("type", data.type);
      if (data.field) formData.append("field", data.field);
      if (data.description) formData.append("description", data.description);
      if (data.image) formData.append("image", data.image);

      const response = await axiosClient.put<{
        success: boolean;
        message: string;
        data: Achievement;
        qualification: QualificationInfo;
      }>(`/tutor/achievements/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa thành tích
   */
  deleteAchievement: async (id: string): Promise<void> => {
    try {
      await axiosClient.delete(`/tutor/achievements/${id}`);
    } catch (error) {
      throw error;
    }
  },
};

export default QualificationService;
