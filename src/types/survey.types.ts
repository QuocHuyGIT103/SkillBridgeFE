/**
 * AI Survey Types
 */

export interface SurveyData {
  gradeLevel: string;
  subjects: string[];
  goals: string[];
  teachingMode: 'ONLINE' | 'OFFLINE' | 'BOTH';
  preferredTeachingStyle: string[];
  availableTime: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  learningPace: string;
  priorities: {
    experience: number;
    communication: number;
    qualification: number;
    price: number;
    location: number;
  };
}

export interface AIAnalysis {
  learningProfile: string;
  recommendedTutorTypes: string[];
  studyPlanSuggestion: string;
}

export interface StudentSurvey {
  id: string;
  studentId: string;
  gradeLevel: string;
  subjects: string[];
  goals: string[];
  teachingMode: 'ONLINE' | 'OFFLINE' | 'BOTH';
  preferredTeachingStyle: string[];
  availableTime: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  learningPace: string;
  priorities: {
    experience: number;
    communication: number;
    qualification: number;
    price: number;
    location: number;
  };
  aiAnalysis?: AIAnalysis;
  completedAt: Date;
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveySubmitResponse {
  survey: StudentSurvey;
  recommendations: any[];
  aiAnalysis: AIAnalysis;
}

export interface SurveyStatusResponse {
  hasCompletedSurvey: boolean;
  completedAt?: Date;
  canRetake: boolean;
}

// Form options
export const GRADE_LEVELS = [
  { value: 'Lớp 6', label: 'Lớp 6' },
  { value: 'Lớp 7', label: 'Lớp 7' },
  { value: 'Lớp 8', label: 'Lớp 8' },
  { value: 'Lớp 9', label: 'Lớp 9' },
  { value: 'Lớp 10', label: 'Lớp 10' },
  { value: 'Lớp 11', label: 'Lớp 11' },
  { value: 'Lớp 12', label: 'Lớp 12' },
  { value: 'Đại học', label: 'Đại học' },
  { value: 'Người đi làm', label: 'Người đi làm' },
];

export const LEARNING_GOALS = [
  { value: 'improve_grades', label: 'Cải thiện điểm số', icon: '📈', description: 'Nâng cao kết quả học tập' },
  { value: 'exam_prep', label: 'Ôn thi đại học', icon: '🎓', description: 'Chuẩn bị cho kỳ thi quan trọng' },
  { value: 'advanced_learning', label: 'Học thêm nâng cao', icon: '🚀', description: 'Mở rộng kiến thức chuyên sâu' },
  { value: 'foundation', label: 'Bù kiến thức cơ bản', icon: '📚', description: 'Củng cố nền tảng' },
  { value: 'certification', label: 'Thi chứng chỉ', icon: '📜', description: 'IELTS, TOEIC, SAT...' },
];

export const TEACHING_MODES = [
  { value: 'ONLINE', label: 'Trực tuyến', icon: '💻', description: 'Học qua Zoom, Google Meet' },
  { value: 'OFFLINE', label: 'Tại nhà', icon: '🏠', description: 'Gia sư đến tận nơi' },
  { value: 'BOTH', label: 'Linh hoạt', icon: '🌐', description: 'Cả online và offline' },
];

export const TEACHING_STYLES = [
  { value: 'traditional', label: 'Truyền thống', icon: '📚', description: 'Giảng bài, làm bài tập' },
  { value: 'interactive', label: 'Tương tác', icon: '🎮', description: 'Games, thảo luận, dự án' },
  { value: 'practice', label: 'Thực hành', icon: '🎯', description: 'Làm nhiều đề, luyện thi' },
  { value: 'creative', label: 'Sáng tạo', icon: '💡', description: 'Tư duy phản biện, ứng dụng' },
];

export const AVAILABLE_TIMES = [
  { value: 'morning', label: 'Buổi sáng', icon: '☀️', time: '7h-12h' },
  { value: 'afternoon', label: 'Buổi chiều', icon: '🌤️', time: '13h-17h' },
  { value: 'evening', label: 'Buổi tối', icon: '🌙', time: '18h-21h' },
  { value: 'weekend', label: 'Cuối tuần', icon: '🌃', time: 'Thứ 7, CN' },
];

export const LEARNING_PACES = [
  { 
    value: 'self_learner', 
    label: 'Tự học tốt', 
    icon: '🚀', 
    description: 'Tôi tự học tốt, chỉ cần hướng dẫn khi gặp khó khăn' 
  },
  { 
    value: 'need_guidance', 
    label: 'Cần hướng dẫn', 
    icon: '🤔', 
    description: 'Tôi cần được giải thích kỹ từng bước' 
  },
  { 
    value: 'fast_learner', 
    label: 'Tiếp thu nhanh', 
    icon: '⚡', 
    description: 'Tôi học nhanh và thích thử thách' 
  },
  { 
    value: 'steady_learner', 
    label: 'Học chậm nhưng chắc', 
    icon: '🐌', 
    description: 'Tôi cần thời gian nhưng nắm vững kiến thức' 
  },
];

export const PRIORITIES = [
  { key: 'experience', label: 'Kinh nghiệm dạy lâu năm', icon: '⭐', description: 'Gia sư có nhiều năm kinh nghiệm' },
  { key: 'communication', label: 'Giao tiếp tốt, nhiệt tình', icon: '💬', description: 'Gia sư dễ tiếp cận, tận tâm' },
  { key: 'qualification', label: 'Bằng cấp cao', icon: '🎓', description: 'Thạc sĩ, Tiến sĩ hoặc chuyên môn cao' },
  { key: 'price', label: 'Giá cả hợp lý', icon: '💰', description: 'Học phí phù hợp với ngân sách' },
  { key: 'location', label: 'Vị trí linh hoạt', icon: '📍', description: 'Gần nhà hoặc dạy online' },
];
