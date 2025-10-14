import  axiosClient  from '../api/axiosClient';
import type {
  ContactRequest,
  CreateContactRequestInput,
  TutorResponseInput,
  CreateLearningClassInput,
  ContactRequestFilters,
  LearningClass
} from '../types/contactRequest.types';

export interface ContactRequestListResponse {
  success: boolean;
  data: {
    requests: ContactRequest[];
    pagination: {
      current: number;
      total: number;
      count: number;
    };
  };
}

export interface ContactRequestResponse {
  success: boolean;
  message: string;
  data?: ContactRequest;
}

export interface LearningClassResponse {
  success: boolean;
  message: string;
  data?: LearningClass;
}

class ContactRequestService {
  /**
   * Student creates contact request
   */
  async createContactRequest(data: CreateContactRequestInput): Promise<ContactRequestResponse> {
    const response = await axiosClient.post('/contact-requests', data);
    return response;
  }

  /**
   * Get student's contact requests
   */
  async getStudentRequests(filters: ContactRequestFilters = {}): Promise<ContactRequestListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await axiosClient.get(`/contact-requests/student/my-requests?${params}`);
    return {
      success: true,
      data: response.data 
    };
  }

  /**
   * Get tutor's incoming requests
   */
  async getTutorRequests(filters: ContactRequestFilters = {}): Promise<ContactRequestListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await axiosClient.get(`/contact-requests/tutor/incoming-requests?${params}`);
    return {
      success: true,
      data: response.data 
    };
  }

  /**
   * Tutor responds to contact request
   */
  async respondToRequest(requestId: string, data: TutorResponseInput): Promise<ContactRequestResponse> {
    debugger;
    const response = await axiosClient.put(`/contact-requests/${requestId}/respond`, data);
    return response;
  }

  /**
   * Create learning class from accepted request
   */
  async createLearningClass(data: CreateLearningClassInput): Promise<LearningClassResponse> {
    const response = await axiosClient.post('/contact-requests/create-class', data);
    return response;
  }

  /**
   * Cancel contact request (by student)
   */
  async cancelRequest(requestId: string): Promise<ContactRequestResponse> {
    debugger;
    const response = await axiosClient.put(`/contact-requests/${requestId}/cancel`);
    return response;
  }

  /**
   * Get contact request detail
   */
  async getRequestDetail(requestId: string): Promise<ContactRequestResponse> {
    const response = await axiosClient.get(`/contact-requests/${requestId}`);
    return response;
  }
}

export const contactRequestService = new ContactRequestService();