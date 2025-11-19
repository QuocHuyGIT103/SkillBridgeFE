export type MaterialVisibility = 'STUDENTS' | 'PRIVATE';

export interface ClassMaterial {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  visibility: MaterialVisibility;
  uploadedBy: {
    userId: string;
    role: 'TUTOR' | 'STUDENT';
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentAttachment {
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface AssignmentSubmission {
  _id: string;
  studentId: string;
  studentName: string;
  note?: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface ClassAssignment {
  _id: string;
  title: string;
  instructions?: string;
  attachment?: AssignmentAttachment;
  dueDate?: string;
  createdBy: {
    userId: string;
    fullName: string;
  };
  submissions: AssignmentSubmission[];
  createdAt: string;
  updatedAt: string;
  source?: 'CLASS' | 'SESSION';
  sessionNumber?: number;
  readOnly?: boolean;
}

