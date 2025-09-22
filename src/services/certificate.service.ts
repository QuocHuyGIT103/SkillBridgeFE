import axiosClient from "../api/axiosClient";

export interface CreateCertificateData {
  name: string;
  description: string;
  issued_by: string;
  issue_date?: string; // ISO date string
  expiry_date?: string; // ISO date string
}

export interface UpdateCertificateData {
  name?: string;
  description?: string;
  issued_by?: string;
  issue_date?: string; // ISO date string
  expiry_date?: string; // ISO date string
}

export interface Certificate {
  _id: string;
  tutor_id: string;
  name: string;
  description: string;
  issued_by: string;
  issue_date?: string;
  expiry_date?: string;
  certificate_image_url?: string;
  certificate_image_public_id?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCertificateFormData extends CreateCertificateData {
  certificate_image?: File;
}

export interface UpdateCertificateFormData extends UpdateCertificateData {
  certificate_image?: File;
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

export const certificateService = {
  // Get all certificates for the logged-in tutor
  async getCertificates(): Promise<ListResponse<Certificate>> {
    const response = await axiosClient.get("/certificates");
    return response;
  },

  // Get specific certificate by ID
  async getCertificateById(id: string): Promise<ApiResponse<Certificate>> {
    const response = await axiosClient.get(`/certificates/${id}`);
    return response;
  },

  // Create new certificate
  async createCertificate(
    data: CreateCertificateFormData
  ): Promise<ApiResponse<Certificate>> {
    const formData = new FormData();

    // Append certificate data
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("issued_by", data.issued_by);

    if (data.issue_date) {
      formData.append("issue_date", data.issue_date);
    }
    if (data.expiry_date) {
      formData.append("expiry_date", data.expiry_date);
    }

    // Append certificate image if provided
    if (data.certificate_image) {
      formData.append("certificate_image", data.certificate_image);
    }

    const response = await axiosClient.post("/certificates", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },

  // Update existing certificate
  async updateCertificate(
    id: string,
    data: UpdateCertificateFormData
  ): Promise<ApiResponse<Certificate>> {
    const formData = new FormData();

    // Append certificate data if provided
    if (data.name) formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (data.issued_by) formData.append("issued_by", data.issued_by);
    if (data.issue_date !== undefined) {
      formData.append("issue_date", data.issue_date || "");
    }
    if (data.expiry_date !== undefined) {
      formData.append("expiry_date", data.expiry_date || "");
    }

    // Append certificate image if provided
    if (data.certificate_image) {
      formData.append("certificate_image", data.certificate_image);
    }

    const response = await axiosClient.put(`/certificates/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },

  // Delete certificate
  async deleteCertificate(id: string): Promise<ApiResponse<null>> {
    const response = await axiosClient.delete(`/certificates/${id}`);
    return response;
  },

  // Delete certificate image
  async deleteCertificateImage(id: string): Promise<ApiResponse<Certificate>> {
    const response = await axiosClient.delete(
      `/certificates/${id}/certificate-image`
    );
    return response;
  },
};

export default certificateService;
