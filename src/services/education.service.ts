import axiosClient from "../api/axiosClient";

export const EducationLevel = {
  HIGH_SCHOOL: "Trung học phổ thông",
  BACHELOR: "Đại học",
  MASTER: "Thạc sĩ",
  DOCTOR: "Tiến sĩ",
} as const;

export type EducationLevel =
  (typeof EducationLevel)[keyof typeof EducationLevel];

export interface CreateEducationData {
  level: EducationLevel;
  school: string;
  major?: string;
  start_year: string;
  end_year: string;
}

export interface UpdateEducationData {
  level?: EducationLevel;
  school?: string;
  major?: string;
  start_year?: string;
  end_year?: string;
}

export interface Education {
  _id: string;
  tutor_id: string;
  level: EducationLevel;
  school: string;
  major?: string;
  start_year: string;
  end_year: string;
  degree_image_url?: string;
  degree_image_public_id?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEducationFormData extends CreateEducationData {
  degree_image?: File;
}

export interface UpdateEducationFormData extends UpdateEducationData {
  degree_image?: File;
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

export const educationService = {
  // Get all education records for the logged-in tutor
  async getEducations(): Promise<ListResponse<Education>> {
    const response = await axiosClient.get("/education");
    return response;
  },

  // Get education levels enum
  async getEducationLevels(): Promise<
    ApiResponse<{ levels: Record<string, string> }>
  > {
    const response = await axiosClient.get("/education/levels");
    return response;
  },

  // Get specific education record by ID
  async getEducationById(id: string): Promise<ApiResponse<Education>> {
    const response = await axiosClient.get(`/education/${id}`);
    return response;
  },

  // Create new education record
  async createEducation(
    data: CreateEducationFormData
  ): Promise<ApiResponse<Education>> {
    const formData = new FormData();

    // Append education data
    formData.append("level", data.level);
    formData.append("school", data.school);
    if (data.major) formData.append("major", data.major);
    formData.append("start_year", data.start_year);
    formData.append("end_year", data.end_year);

    // Append degree image if provided
    if (data.degree_image) {
      formData.append("degreeImage", data.degree_image);
    }

    const response = await axiosClient.post("/education", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },

  // Update existing education record
  async updateEducation(
    id: string,
    data: UpdateEducationFormData
  ): Promise<ApiResponse<Education>> {
    const formData = new FormData();

    // Append education data if provided
    if (data.level) formData.append("level", data.level);
    if (data.school) formData.append("school", data.school);
    if (data.major !== undefined) formData.append("major", data.major);
    if (data.start_year) formData.append("start_year", data.start_year);
    if (data.end_year) formData.append("end_year", data.end_year);

    // Append degree image if provided
    if (data.degree_image) {
      formData.append("degreeImage", data.degree_image);
    }

    const response = await axiosClient.put(`/education/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },

  // Delete education record
  async deleteEducation(id: string): Promise<ApiResponse<null>> {
    const response = await axiosClient.delete(`/education/${id}`);
    return response;
  },

  // Delete degree image
  async deleteDegreeImage(id: string): Promise<ApiResponse<Education>> {
    const response = await axiosClient.delete(`/education/${id}/degree-image`);
    return response;
  },
};

export default educationService;
