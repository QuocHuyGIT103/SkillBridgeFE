import axiosClient from '../api/axiosClient';

export const uploadService = {
  /**
   * Upload file (homework, assignments, etc.)
   */
  uploadFile: async (formData: FormData) => {
    const response = await axiosClient.post('/messages/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },
};
