import axiosClient from '../api/axiosClient';

export interface ExerciseTemplate {
  id: string;
  ownerId: string;
  subjectId: string;
  title: string;
  description?: string;
  type: 'WRITING' | 'SPEAKING' | 'QUIZ' | 'FILE_UPLOAD';
  gradeLevels: string[];
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  rubricId?: string;
  content: {
    prompt: string;
    sampleAnswer?: string;
    attachmentUrl?: string;
    resources?: string[];
  };
  isPublic: boolean;
  usageCount: number;
}

export interface RubricCriterion {
  _id: string;
  label: string;
  description?: string;
  weight: number;
  maxScore: number;
}

export interface Rubric {
  id: string;
  ownerId: string;
  subjectId?: string;
  name: string;
  description?: string;
  criteria: RubricCriterion[];
  isPublic: boolean;
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

  async listRubrics(subjectId?: string) {
    const params: any = {};
    if (subjectId) params.subjectId = subjectId;
    const response = await axiosClient.get('/assignments/rubrics', { params });
    return response;
  },

  async createRubric(payload: Partial<Rubric>) {
    const response = await axiosClient.post('/assignments/rubrics', payload);
    return response;
  },

  async updateRubric(rubricId: string, payload: Partial<Rubric>) {
    const response = await axiosClient.put(
      `/assignments/rubrics/${rubricId}`,
      payload
    );
    return response;
  },

  async deleteRubric(rubricId: string) {
    const response = await axiosClient.delete(`/assignments/rubrics/${rubricId}`);
    return response;
  },
};

export default ExerciseLibraryService;


