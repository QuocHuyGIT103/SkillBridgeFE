import React, { useState } from 'react';
import {
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  PaperClipIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { uploadService } from '../../services/upload.service';
import { useClassStore } from '../../store/class.store';
import type { ClassMaterial, MaterialVisibility } from '../../types/classResources';

interface ClassResourcesSectionProps {
  classId: string;
  userRole: 'TUTOR' | 'STUDENT';
  materials?: ClassMaterial[];
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

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-500 text-sm">
    {message}
  </div>
);

const ClassResourcesSection = ({
  classId,
  userRole,
  materials = [],
}: ClassResourcesSectionProps): React.ReactElement => {
  const { createClassMaterial, updateClassMaterial, deleteClassMaterial } = useClassStore();

  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<ClassMaterial | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<ClassMaterial | null>(null);
  const [uploading, setUploading] = useState(false);
  const [materialFormLoading, setMaterialFormLoading] = useState(false);
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

  const handleDeleteClick = (material: ClassMaterial) => {
    setMaterialToDelete(material);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!materialToDelete) return;
    setDeleting(true);
    try {
      await deleteClassMaterial(classId, materialToDelete._id);
      setDeleteModalOpen(false);
      setMaterialToDelete(null);
      toast.success('Đã xoá tài liệu thành công');
    } catch (error: any) {
      toast.error(error.message || 'Không thể xoá tài liệu');
    } finally {
      setDeleting(false);
    }
  };

  const handleUploadChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Dung lượng file quá lớn. Giới hạn 20MB');
      event.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const data = await handleUpload(file);
      setMaterialForm((prev) => ({
        ...prev,
        fileUrl: data.url,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
      }));
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
              <input
                type="text"
                value={materialForm.title}
                onChange={(e) => setMaterialForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Ví dụ: Slide bài giảng tuần 3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">File đính kèm</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                  <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                  {materialForm.fileUrl ? 'Đổi file' : 'Tải file'}
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleUploadChange}
                    disabled={uploading}
                  />
                </label>
                {materialForm.fileName && (
                  <span className="text-sm text-gray-600">
                    {materialForm.fileName} • {formatFileSize(materialForm.fileSize)}
                  </span>
                )}
              </div>
              {uploading && <p className="text-xs text-blue-600 mt-1">Đang tải file lên...</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quyền xem</label>
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
              onClick={() => handleDeleteClick(material)}
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

      {renderMaterialModal()}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && materialToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <TrashIcon className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Xác nhận xóa tài liệu
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                Bạn có chắc chắn muốn xóa tài liệu này?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mb-6 mt-4">
                <p className="text-sm font-medium text-gray-900">{materialToDelete.title}</p>
                {materialToDelete.fileName && (
                  <p className="text-xs text-gray-500 mt-1">{materialToDelete.fileName}</p>
                )}
              </div>
              <p className="text-xs text-red-600 mb-6">
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setMaterialToDelete(null);
                }}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    <span>Xóa tài liệu</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClassResourcesSection;

