import axiosClient from "../api/axiosClient";

export const AchievementType = {
  COMPETITION: "Cuộc thi",
  AWARD: "Giải thưởng",
  CERTIFICATION: "Chứng nhận",
  PUBLICATION: "Xuất bản",
  RESEARCH: "Nghiên cứu",
  PROJECT: "Dự án",
  OTHER: "Khác",
} as const;

export type AchievementType =
  (typeof AchievementType)[keyof typeof AchievementType];

export const AchievementLevel = {
  INTERNATIONAL: "Quốc tế",
  NATIONAL: "Quốc gia",
  REGIONAL: "Khu vực",
  LOCAL: "Địa phương",
  INSTITUTIONAL: "Cơ quan/Trường học",
  OTHER: "Khác",
} as const;

export type AchievementLevel =
  (typeof AchievementLevel)[keyof typeof AchievementLevel];

export interface CreateAchievementData {
  name: string;
  level: AchievementLevel;
  date_achieved: string; // ISO date string
  organization: string;
  type: AchievementType;
  field: string;
  description: string;
}

export interface UpdateAchievementData {
  name?: string;
  level?: AchievementLevel;
  date_achieved?: string; // ISO date string
  organization?: string;
  type?: AchievementType;
  field?: string;
  description?: string;
}

export interface Achievement {
  _id: string;
  tutor_id: string;
  name: string;
  level: AchievementLevel;
  date_achieved: string;
  organization: string;
  type: AchievementType;
  field: string;
  description: string;
  achievement_image_url?: string;
  achievement_image_public_id?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAchievementFormData extends CreateAchievementData {
  achievement_image?: File;
}

export interface UpdateAchievementFormData extends UpdateAchievementData {
  achievement_image?: File;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export const achievementService = {
  // Get all achievements for the logged-in tutor
  async getAchievements(): Promise<ListResponse<Achievement>> {
    const response = await axiosClient.get("/achievements");
    return response;
  },

  // Get achievement types enum
  async getAchievementTypes(): Promise<
    ApiResponse<{ types: Record<string, string> }>
  > {
    const response = await axiosClient.get("/achievements/types");
    return response;
  },

  // Get achievement levels enum
  async getAchievementLevels(): Promise<
    ApiResponse<{ levels: Record<string, string> }>
  > {
    const response = await axiosClient.get("/achievements/levels");
    return response;
  },

  // Get specific achievement by ID
  async getAchievementById(id: string): Promise<ApiResponse<Achievement>> {
    const response = await axiosClient.get(`/achievements/${id}`);
    return response;
  },

  // Create new achievement
  async createAchievement(
    data: CreateAchievementFormData
  ): Promise<ApiResponse<Achievement>> {
    const formData = new FormData();

    // Append achievement data
    formData.append("name", data.name);
    formData.append("level", data.level);
    formData.append("date_achieved", data.date_achieved);
    formData.append("organization", data.organization);
    formData.append("type", data.type);
    formData.append("field", data.field);
    formData.append("description", data.description);

    // Append achievement image if provided
    if (data.achievement_image) {
      formData.append("achievement_image", data.achievement_image);
    }

    const response = await axiosClient.post("/achievements", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },

  // Update existing achievement
  async updateAchievement(
    id: string,
    data: UpdateAchievementFormData
  ): Promise<ApiResponse<Achievement>> {
    const formData = new FormData();

    // Append achievement data if provided
    if (data.name) formData.append("name", data.name);
    if (data.level) formData.append("level", data.level);
    if (data.date_achieved)
      formData.append("date_achieved", data.date_achieved);
    if (data.organization) formData.append("organization", data.organization);
    if (data.type) formData.append("type", data.type);
    if (data.field) formData.append("field", data.field);
    if (data.description) formData.append("description", data.description);

    // Append achievement image if provided
    if (data.achievement_image) {
      formData.append("achievement_image", data.achievement_image);
    }

    const response = await axiosClient.put(`/achievements/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },

  // Delete achievement
  async deleteAchievement(id: string): Promise<ApiResponse<null>> {
    const response = await axiosClient.delete(`/achievements/${id}`);
    return response;
  },

  // Delete achievement image
  async deleteAchievementImage(id: string): Promise<ApiResponse<Achievement>> {
    const response = await axiosClient.delete(
      `/achievements/${id}/achievement-image`
    );
    return response;
  },
};

export default achievementService;
