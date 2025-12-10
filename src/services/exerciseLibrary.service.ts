import axiosClient from '../api/axiosClient';

export interface ExerciseTemplate {
  _id: string;
  id?: string; // alias for _id
  ownerId: string;
  subjectId: string;
  title: string;
  description?: string;
  type: 'WRITING' | 'SPEAKING' | 'QUIZ' | 'FILE_UPLOAD';
  gradeLevels: string[];
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  content: {
    prompt: string;
    sampleAnswer?: string;
    attachmentUrl?: string;
    resources?: string[];
  };
  isPublic: boolean;
  usageCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExerciseTemplateFilters {
  subjectId?: string;
  gradeLevel?: string;
  type?: string;
  search?: string;
  mineOnly?: boolean;
}

const ExerciseLibraryService = {
  async listTemplates(filters: ExerciseTemplateFilters = {}) {
    const params: any = { ...filters };
    const response = await axiosClient.get('/assignments/templates', { params });
    return response;
  },

  async getTemplate(templateId: string) {
    const response = await axiosClient.get(`/assignments/templates/${templateId}`);
    return response;
  },

  async createTemplate(payload: Partial<ExerciseTemplate>) {
    const response = await axiosClient.post('/assignments/templates', payload);
    return response;
  },

  async updateTemplate(templateId: string, payload: Partial<ExerciseTemplate>) {
    const response = await axiosClient.put(
      `/assignments/templates/${templateId}`,
      payload
    );
    return response;
  },

  async deleteTemplate(templateId: string) {
    const response = await axiosClient.delete(
      `/assignments/templates/${templateId}`
    );
    return response;
  },
};

export default ExerciseLibraryService;


