import React, { useState } from 'react';
import {
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  TrashIcon,
  PaperClipIcon,
  PlusIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { uploadService } from '../../services/upload.service';
import { useClassStore } from '../../store/class.store';
import type { LearningClass } from '../../types/LearningClass';
import type {
  ClassMaterial,
  ClassAssignment,
  MaterialVisibility,
  AssignmentAttachment,
  AssignmentSubmission,
} from '../../types/classResources';

interface ClassResourcesSectionProps {
  classId: string;
  userRole: 'TUTOR' | 'STUDENT';
  classData: LearningClass;
  materials?: ClassMaterial[];
  assignments?: ClassAssignment[];
  onOpenSessionHomework?: (sessionNumber: number) => void;
}

const visibilityOptions: { value: MaterialVisibility; label: string }[] = [
  { value: 'STUDENTS', label: 'Học viên' },
  { value: 'PRIVATE', label: 'Riêng tư (chỉ gia sư)' },
];

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '---';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDateTime = (value?: string) => {
  if (!value) return '---';
  try {
    return format(new Date(value), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi });
  } catch {
    return value;
  }
};

const toInputDateValue = (value?: string) => {
  if (!value) return '';
  try {
    return format(new Date(value), "yyyy-MM-dd'T'HH:mm");
  } catch {
    return '';
  }
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-500 text-sm">
    {message}
  </div>
);

const ClassResourcesSection = ({
  classId,
  userRole,
  classData,
  materials = [],
  assignments = [],
  onOpenSessionHomework,
}: ClassResourcesSectionProps): React.ReactElement => {
  const {
    createClassMaterial,
    updateClassMaterial,
    deleteClassMaterial,
    createClassAssignment,
    updateClassAssignment,
    deleteClassAssignment,
    submitAssignmentWork,
  } = useClassStore();

  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);

  const [editingMaterial, setEditingMaterial] = useState<ClassMaterial | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<ClassAssignment | null>(null);
  const [submittingAssignment, setSubmittingAssignment] = useState<ClassAssignment | null>(null);

  const [uploading, setUploading] = useState(false);
  const [materialFormLoading, setMaterialFormLoading] = useState(false);
  const [assignmentFormLoading, setAssignmentFormLoading] = useState(false);
  const [submissionLoading, setSubmissionLoading] = useState(false);

  const [materialForm, setMaterialForm] = useState<{
    title: string;
    description: string;
    fileUrl: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    visibility: MaterialVisibility;
  }>({
    title: '',
    description: '',
    fileUrl: '',
    fileName: '',
    fileSize: undefined,
    mimeType: undefined,
    visibility: 'STUDENTS',
  });

  const [assignmentForm, setAssignmentForm] = useState<{
    title: string;
    instructions: string;
    dueDate: string;
    attachment: AssignmentAttachment | null;
  }>({
    title: '',
    instructions: '',
    dueDate: '',
    attachment: null,
  });

  const [submissionForm, setSubmissionForm] = useState<{
    note: string;
    fileUrl: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  }>({
    note: '',
    fileUrl: '',
    fileName: '',
    fileSize: undefined,
    mimeType: undefined,
  });

  const studentId = classData.studentId?.id || classData.studentId;

  const handleSessionAssignmentRedirect = (sessionNumber?: number) => {
    if (!sessionNumber) {
      toast.error('Không xác định được buổi học của bài tập này');
      return;
    }
    if (onOpenSessionHomework) {
      onOpenSessionHomework(sessionNumber);
    } else {
      toast.error('Không thể mở bài tập buổi học từ giao diện này');
    }
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await uploadService.uploadFile(formData);
    return response.data;
  };

  const openMaterialModal = (material?: ClassMaterial) => {
    if (material) {
      setEditingMaterial(material);
      setMaterialForm({
        title: material.title,
        description: material.description || '',
        fileUrl: material.fileUrl,
        fileName: material.fileName,
        fileSize: material.fileSize,
        mimeType: material.mimeType,
        visibility: material.visibility,
      });
    } else {
      setEditingMaterial(null);
      setMaterialForm({
        title: '',
        description: '',
        fileUrl: '',
        fileName: '',
        fileSize: undefined,
        mimeType: undefined,
        visibility: 'STUDENTS',
      });
    }
    setMaterialModalOpen(true);
  };

  const openAssignmentModal = (assignment?: ClassAssignment) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setAssignmentForm({
        title: assignment.title,
        instructions: assignment.instructions || '',
        dueDate: toInputDateValue(assignment.dueDate),
        attachment: assignment.attachment || null,
      });
    } else {
      setEditingAssignment(null);
      setAssignmentForm({
        title: '',
        instructions: '',
        dueDate: '',
        attachment: null,
      });
    }
    setAssignmentModalOpen(true);
  };

  const openSubmissionModal = (assignment: ClassAssignment) => {
    const mySubmission = assignment.submissions.find(
      (submission) => submission.studentId === studentId
    );
    setSubmittingAssignment(assignment);
    setSubmissionForm({
      note: mySubmission?.note || '',
      fileUrl: mySubmission?.fileUrl || '',
      fileName: mySubmission?.fileName,
      fileSize: mySubmission?.fileSize,
      mimeType: mySubmission?.mimeType,
    });
    setSubmissionModalOpen(true);
  };

  const handleMaterialSave = async () => {
    if (!materialForm.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề tài liệu');
      return;
    }
    if (!materialForm.fileUrl) {
      toast.error('Vui lòng tải lên file tài liệu');
      return;
    }
    setMaterialFormLoading(true);
    try {
      if (editingMaterial) {
        await updateClassMaterial(classId, editingMaterial._id, materialForm);
      } else {
        await createClassMaterial(classId, materialForm);
      }
      setMaterialModalOpen(false);
    } finally {
      setMaterialFormLoading(false);
    }
  };

  const handleAssignmentSave = async () => {
    if (!assignmentForm.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài tập');
      return;
    }
    setAssignmentFormLoading(true);
    try {
      const payload = {
        title: assignmentForm.title,
        instructions: assignmentForm.instructions || undefined,
        dueDate: assignmentForm.dueDate
          ? new Date(assignmentForm.dueDate).toISOString()
          : undefined,
        attachment: assignmentForm.attachment || undefined,
      };

      if (editingAssignment) {
        await updateClassAssignment(classId, editingAssignment._id, payload);
      } else {
        await createClassAssignment(classId, payload);
      }
      setAssignmentModalOpen(false);
    } finally {
      setAssignmentFormLoading(false);
    }
  };

  const handleSubmissionSave = async () => {
    if (!submittingAssignment) return;
    if (!submissionForm.fileUrl) {
      toast.error('Vui lòng tải lên file bài nộp');
      return;
    }
    setSubmissionLoading(true);
    try {
      await submitAssignmentWork(classId, submittingAssignment._id, submissionForm);
      setSubmissionModalOpen(false);
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleDeleteMaterial = async (material: ClassMaterial) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá tài liệu này?')) {
      return;
    }
    await deleteClassMaterial(classId, material._id);
  };

  const handleDeleteAssignment = async (assignment: ClassAssignment) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá bài tập này?')) {
      return;
    }
    await deleteClassAssignment(classId, assignment._id);
  };

  const handleUploadChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    target: 'material' | 'assignment' | 'submission'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Giới hạn 15MB cho mỗi file');
      return;
    }
    setUploading(true);
    try {
      const data = await handleUpload(file);
      if (target === 'material') {
        setMaterialForm((prev) => ({
          ...prev,
          fileUrl: data.url,
          fileName: data.fileName,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
        }));
      } else if (target === 'assignment') {
        setAssignmentForm((prev) => ({
          ...prev,
          attachment: {
            fileUrl: data.url,
            fileName: data.fileName,
            fileSize: data.fileSize,
            mimeType: data.mimeType,
          },
        }));
      } else {
        setSubmissionForm((prev) => ({
          ...prev,
          fileUrl: data.url,
          fileName: data.fileName,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
        }));
      }
      toast.success('Tải file thành công');
    } catch (error: any) {
      console.error('Upload file failed:', error);
      toast.error('Không thể tải file');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const renderMaterialModal = () => {
    if (!materialModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingMaterial ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới'}
            </h3>
            <button
              onClick={() => setMaterialModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề
              </label>
              <input
                type="text"
                value={materialForm.title}
                onChange={(e) => setMaterialForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Ví dụ: Slide bài giảng tuần 3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={materialForm.description}
                onChange={(e) =>
                  setMaterialForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Tóm tắt nội dung tài liệu..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File đính kèm
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                  <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                  {materialForm.fileUrl ? 'Đổi file' : 'Tải file'}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleUploadChange(e, 'material')}
                    disabled={uploading}
                  />
                </label>
                {materialForm.fileName && (
                  <span className="text-sm text-gray-600">
                    {materialForm.fileName} • {formatFileSize(materialForm.fileSize)}
                  </span>
                )}
              </div>
              {uploading && (
                <p className="text-xs text-blue-600 mt-1">Đang tải file lên...</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quyền xem
              </label>
              <select
                value={materialForm.visibility}
                onChange={(e) =>
                  setMaterialForm((prev) => ({
                    ...prev,
                    visibility: e.target.value as MaterialVisibility,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {visibilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setMaterialModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Huỷ
            </button>
            <button
              onClick={handleMaterialSave}
              disabled={materialFormLoading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              {materialFormLoading ? 'Đang lưu...' : 'Lưu tài liệu'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAssignmentModal = () => {
    if (!assignmentModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingAssignment ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}
            </h3>
            <button
              onClick={() => setAssignmentModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề
              </label>
              <input
                type="text"
                value={assignmentForm.title}
                onChange={(e) =>
                  setAssignmentForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Ví dụ: Bài tập chương 2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hướng dẫn / Nội dung
              </label>
              <textarea
                rows={4}
                value={assignmentForm.instructions}
                onChange={(e) =>
                  setAssignmentForm((prev) => ({ ...prev, instructions: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Mô tả chi tiết yêu cầu bài tập..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hạn nộp (tuỳ chọn)
              </label>
              <input
                type="datetime-local"
                value={assignmentForm.dueDate}
                onChange={(e) =>
                  setAssignmentForm((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File đính kèm
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors">
                  <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                  {assignmentForm.attachment ? 'Đổi file' : 'Tải file'}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleUploadChange(e, 'assignment')}
                    disabled={uploading}
                  />
                </label>
                {assignmentForm.attachment && (
                  <span className="text-sm text-gray-600">
                    {assignmentForm.attachment.fileName} •{' '}
                    {formatFileSize(assignmentForm.attachment.fileSize)}
                  </span>
                )}
                {assignmentForm.attachment && (
                  <button
                    onClick={() => setAssignmentForm((prev) => ({ ...prev, attachment: null }))}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Xoá file
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setAssignmentModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Huỷ
            </button>
            <button
              onClick={handleAssignmentSave}
              disabled={assignmentFormLoading}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {assignmentFormLoading ? 'Đang lưu...' : 'Lưu bài tập'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSubmissionModal = () => {
    if (!submissionModalOpen || !submittingAssignment) return null;
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Nộp bài tập</h3>
            <button
              onClick={() => setSubmissionModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {submittingAssignment.title}
              </p>
              <p className="text-sm text-gray-500">
                Hạn nộp: {formatDateTime(submittingAssignment.dueDate)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                rows={3}
                value={submissionForm.note}
                onChange={(e) =>
                  setSubmissionForm((prev) => ({ ...prev, note: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Bạn có thể mô tả ngắn gọn về bài làm..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File bài làm
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-emerald-700 transition-colors">
                  <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                  {submissionForm.fileUrl ? 'Đổi file' : 'Tải file'}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleUploadChange(e, 'submission')}
                    disabled={uploading}
                  />
                </label>
                {submissionForm.fileName && (
                  <span className="text-sm text-gray-600">
                    {submissionForm.fileName} • {formatFileSize(submissionForm.fileSize)}
                  </span>
                )}
              </div>
              {uploading && <p className="text-xs text-blue-600 mt-1">Đang tải file...</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setSubmissionModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Huỷ
            </button>
            <button
              onClick={handleSubmissionSave}
              disabled={submissionLoading}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:bg-gray-400"
            >
              {submissionLoading ? 'Đang nộp...' : 'Nộp bài'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMaterialCard = (material: ClassMaterial) => (
    <div
      key={material._id}
      className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <div>
        <h4 className="text-base font-semibold text-gray-900">{material.title}</h4>
        {material.description && (
          <p className="text-sm text-gray-600 mt-1">{material.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
          <span className="inline-flex items-center gap-1">
            <PaperClipIcon className="w-4 h-4" />
            {material.fileName || 'Tài liệu'}
          </span>
          <span>{formatFileSize(material.fileSize)}</span>
          <span>Cập nhật {formatDateTime(material.updatedAt)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={material.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
          Tải xuống
        </a>
        {userRole === 'TUTOR' && (
          <>
            <button
              onClick={() => openMaterialModal(material)}
              className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            >
              <PencilSquareIcon className="w-4 h-4 mr-1" />
              Sửa
            </button>
            <button
              onClick={() => handleDeleteMaterial(material)}
              className="inline-flex items-center px-3 py-2 rounded-lg border border-red-200 text-sm text-red-600 hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              Xoá
            </button>
          </>
        )}
      </div>
    </div>
  );

  const getAssignmentInitials = (assignment: ClassAssignment) => {
    if (assignment.source === 'SESSION' && assignment.sessionNumber) {
      return `B${assignment.sessionNumber}`;
    }
    const words = assignment.title?.trim().split(/\s+/) || [];
    const initials = words.slice(0, 2).map((word) => word.charAt(0)).join('');
    return initials ? initials.toUpperCase() : 'BT';
  };

  const renderAssignmentCard = (assignment: ClassAssignment) => {
    const isSessionAssignment = assignment.source === 'SESSION';
    const mySubmission = assignment.submissions.find(
      (submission) => submission.studentId === studentId
    );
    const dueDatePassed =
      assignment.dueDate && new Date(assignment.dueDate).getTime() < Date.now();

    return (
      <div key={assignment._id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm ${isSessionAssignment ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}
            >
              {getAssignmentInitials(assignment)}
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <h4 className="text-base font-semibold text-gray-900">{assignment.title}</h4>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${isSessionAssignment
                    ? 'bg-purple-50 text-purple-700 border-purple-100'
                    : 'bg-gray-50 text-gray-600 border-gray-100'
                    }`}
                >
                  {isSessionAssignment ? `Buổi ${assignment.sessionNumber ?? '--'}` : 'Bài tập chung'}
                </span>
              </div>
              {assignment.instructions && (
                <p className="text-sm text-gray-600 whitespace-pre-line">{assignment.instructions}</p>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                {assignment.dueDate && (
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    <span className="font-medium text-orange-600">Hạn nộp: {formatDateTime(assignment.dueDate)}</span>
                  </span>
                )}
                <span>
                  Cập nhật {formatDateTime(assignment.updatedAt)} •{' '}
                  {assignment.submissions.length > 0
                    ? `${assignment.submissions.length} bài nộp`
                    : 'Chưa có bài nộp'}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {assignment.attachment && (
                <a
                  href={assignment.attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <PaperClipIcon className="w-4 h-4 mr-1" />
                  {assignment.attachment.fileName || 'Tài liệu'}
                </a>
              )}

              {userRole === 'STUDENT' && !mySubmission && dueDatePassed && (
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-red-100 bg-red-50 text-xs font-semibold text-red-600">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>Quá hạn nộp bài</span>
                </div>
              )}

              {userRole === 'TUTOR' ? (
                isSessionAssignment ? (
                  <button
                    onClick={() => handleSessionAssignmentRedirect(assignment.sessionNumber)}
                    className="inline-flex items-center px-3 py-2 rounded-lg border border-purple-200 text-sm font-medium text-purple-700 hover:bg-purple-50"
                  >
                    <DocumentTextIcon className="w-4 h-4 mr-1" />
                    Xem chi tiết
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => openAssignmentModal(assignment)}
                      className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      <PencilSquareIcon className="w-4 h-4 mr-1" />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment)}
                      className="inline-flex items-center px-3 py-2 rounded-lg border border-red-200 text-sm text-red-600 hover:bg-red-50"
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      Xoá
                    </button>
                  </>
                )
              ) : isSessionAssignment ? (
                <button
                  onClick={() => handleSessionAssignmentRedirect(assignment.sessionNumber)}
                  className="inline-flex items-center px-3 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
                >
                  <DocumentTextIcon className="w-4 h-4 mr-1" />
                  Xem bài tập
                </button>
              ) : (
                <button
                  onClick={() => openSubmissionModal(assignment)}
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${mySubmission
                    ? 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                >
                  <ArrowUpTrayIcon className="w-4 h-4 mr-1" />
                  {mySubmission ? 'Chỉnh sửa bài nộp' : 'Nộp bài'}
                </button>
              )}
            </div>
          </div>

          {userRole === 'TUTOR' && assignment.submissions.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium text-gray-700">Bài nộp của học viên</p>
              <div className="space-y-2">
                {assignment.submissions.map((submission: AssignmentSubmission) => (
                  <div
                    key={submission._id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-700 bg-white rounded-lg border border-gray-100 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium">{submission.studentName}</p>
                      <p className="text-xs text-gray-500">
                        Nộp {formatDateTime(submission.updatedAt || submission.submittedAt)}
                      </p>
                      {submission.note && (
                        <p className="text-xs text-gray-600 mt-1">Ghi chú: {submission.note}</p>
                      )}
                    </div>
                    <a
                      href={submission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 md:mt-0 inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                      Tải file
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userRole === 'STUDENT' && mySubmission && (
            <div className="bg-emerald-50 rounded-lg p-3 text-sm text-emerald-800 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <span>
                Bạn đã nộp bài {formatDateTime(mySubmission.updatedAt || mySubmission.submittedAt)}
              </span>
              <a
                href={mySubmission.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 rounded-lg border border-emerald-200 text-sm text-emerald-700 hover:bg-emerald-100"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                Xem bài nộp
              </a>
            </div>
          )}

        </div>
      </div>
    );
  };

  return (
    <>
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">📚 Tài liệu học tập</h3>
            <p className="text-sm text-gray-600">
              Chia sẻ slide, đề cương, bài đọc để học viên chuẩn bị trước mỗi buổi học.
            </p>
          </div>
          {userRole === 'TUTOR' && (
            <button
              onClick={() => openMaterialModal()}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Thêm tài liệu
            </button>
          )}
        </div>
        {materials.length === 0 ? (
          <EmptyState message="Chưa có tài liệu nào, gia sư có thể chia sẻ ngay tại đây." />
        ) : (
          <div className="space-y-3">{materials.map(renderMaterialCard)}</div>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">📝 Bài tập lớp học</h3>
            <p className="text-sm text-gray-600">
              Theo dõi bài tập tổng quát của lớp, nộp bài và phản hồi ngay tại đây.
            </p>
          </div>
          {userRole === 'TUTOR' && (
            <button
              onClick={() => openAssignmentModal()}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Tạo bài tập
            </button>
          )}
        </div>
        {assignments.length === 0 ? (
          <EmptyState message="Chưa có bài tập nào được giao cho lớp này." />
        ) : (
          <div className="space-y-4">{assignments.map(renderAssignmentCard)}</div>
        )}
      </section>

      {renderMaterialModal()}
      {renderAssignmentModal()}
      {renderSubmissionModal()}
    </>
  );
};

export default ClassResourcesSection;

