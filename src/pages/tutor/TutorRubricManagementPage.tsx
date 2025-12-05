import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';

interface RubricCriterion {
  _id?: string;
  label: string;
  description?: string;
  weight: number; // 0-1 (e.g., 0.4 = 40%)
  maxScore: number;
}

interface Rubric {
  _id: string;
  ownerId: string;
  subjectId?: string;
  name: string;
  description?: string;
  criteria: RubricCriterion[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Subject {
  _id: string;
  name: string;
  category: string;
}

const TutorRubricManagementPage: React.FC = () => {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRubric, setEditingRubric] = useState<Rubric | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subjectId: '',
    isPublic: false,
    criteria: [
      {
        label: 'Nội dung (Content)',
        description: 'Đánh giá ý tưởng chính, lập luận và dẫn chứng',
        weight: 0.4,
        maxScore: 10,
      },
    ] as RubricCriterion[],
  });

  useEffect(() => {
    fetchRubrics();
    fetchSubjects();
  }, []);

  const fetchRubrics = async () => {
    try {
      setLoading(true);
      const result = await axiosClient.get('/assignments/rubrics');
      
      if (result.success) {
        setRubrics(result.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch rubrics:', error);
      toast.error(error.message || 'Không thể tải danh sách rubric');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      // Use public endpoint that doesn't require admin role
      const result = await axiosClient.get('/subjects/active');
      
      if (result.success) {
        // API returns { data: { subjects: [...] } }
        const subjectsArray = result.data?.subjects || result.data || [];
        setSubjects(Array.isArray(subjectsArray) ? subjectsArray : []);
      } else {
        setSubjects([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch subjects:', error);
      setSubjects([]);
    }
  };

  const handleAddCriterion = () => {
    setFormData((prev) => ({
      ...prev,
      criteria: [
        ...prev.criteria,
        {
          label: '',
          description: '',
          weight: 0.2,
          maxScore: 10,
        },
      ],
    }));
  };

  const handleRemoveCriterion = (index: number) => {
    if (formData.criteria.length <= 1) {
      toast.error('Rubric phải có ít nhất 1 tiêu chí');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index),
    }));
  };

  const handleCriterionChange = (
    index: number,
    field: keyof RubricCriterion,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      criteria: prev.criteria.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate weights sum to 1.0
    const totalWeight = formData.criteria.reduce((sum, c) => sum + c.weight, 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      toast.error(
        `Tổng trọng số phải bằng 100% (hiện tại: ${(totalWeight * 100).toFixed(1)}%)`
      );
      return;
    }

    try {
      const result = editingRubric
        ? await axiosClient.put(`/assignments/rubrics/${editingRubric._id}`, formData)
        : await axiosClient.post('/assignments/rubrics', formData);

      if (result.success) {
        toast.success(
          editingRubric ? 'Cập nhật rubric thành công' : 'Tạo rubric thành công'
        );
        setShowForm(false);
        setEditingRubric(null);
        fetchRubrics();
        resetForm();
      } else {
        toast.error(result.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Không thể lưu rubric');
    }
  };

  const handleEdit = (rubric: Rubric) => {
    setEditingRubric(rubric);
    setFormData({
      name: rubric.name,
      description: rubric.description || '',
      subjectId: rubric.subjectId || '',
      isPublic: rubric.isPublic,
      criteria: rubric.criteria.map((c) => ({
        label: c.label,
        description: c.description || '',
        weight: c.weight,
        maxScore: c.maxScore,
      })),
    });
    setShowForm(true);
  };

  const handleDelete = async (rubricId: string) => {
    if (!confirm('Bạn có chắc muốn xóa rubric này?')) return;

    try {
      const result = await axiosClient.delete(`/assignments/rubrics/${rubricId}`);
      
      if (result.success) {
        toast.success('Xóa rubric thành công');
        fetchRubrics();
      } else {
        toast.error(result.message || 'Không thể xóa rubric');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Không thể xóa rubric');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      subjectId: '',
      isPublic: false,
      criteria: [
        {
          label: 'Nội dung (Content)',
          description: 'Đánh giá ý tưởng chính, lập luận và dẫn chứng',
          weight: 0.4,
          maxScore: 10,
        },
      ],
    });
  };

  const totalWeight = formData.criteria.reduce((sum, c) => sum + c.weight, 0);
  const isWeightValid = Math.abs(totalWeight - 1.0) < 0.01;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý Rubric (Tiêu chí chấm điểm)
              </h1>
              <p className="text-gray-600 mt-1">
                Tạo và quản lý rubric để AI tự động chấm bài tập
              </p>
            </div>
            <button
              onClick={() => {
                setEditingRubric(null);
                resetForm();
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Tạo Rubric mới
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Rubric là gì?</p>
              <p>
                Rubric là bảng tiêu chí chấm điểm có cấu trúc. Khi gắn rubric vào
                bài tập, AI sẽ tự động chấm điểm theo từng tiêu chí (nội dung, cấu
                trúc, ngữ pháp...) giúp bạn tiết kiệm thời gian và đảm bảo tính
                nhất quán.
              </p>
            </div>
          </div>
        </div>

        {/* Rubrics List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
            <p className="text-gray-600 mt-2">Đang tải...</p>
          </div>
        ) : rubrics.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có rubric nào
            </h3>
            <p className="text-gray-500 mb-4">
              Tạo rubric đầu tiên để bắt đầu sử dụng tính năng chấm tự động
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <PlusIcon className="w-5 h-5" />
              Tạo Rubric mới
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rubrics.map((rubric) => (
              <motion.div
                key={rubric._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {rubric.name}
                    </h3>
                    {rubric.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {rubric.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => handleEdit(rubric)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rubric._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {rubric.criteria.map((criterion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-700">{criterion.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600 font-medium">
                          {(criterion.weight * 100).toFixed(0)}%
                        </span>
                        <span className="text-gray-500">
                          ({criterion.maxScore}đ)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{rubric.criteria.length} tiêu chí</span>
                  {rubric.isPublic && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                      Công khai
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => {
              setShowForm(false);
              setEditingRubric(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-3xl w-full my-8"
            >
              <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingRubric ? 'Chỉnh sửa Rubric' : 'Tạo Rubric mới'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingRubric(null);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                  {/* Basic Info */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên Rubric <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="VD: Rubric Bài Viết Thuyết Trình"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Mô tả mục đích sử dụng rubric này"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Môn học (tùy chọn)
                        </label>
                        <select
                          value={formData.subjectId}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              subjectId: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Không chọn môn học</option>
                          {subjects.map((subject) => (
                            <option key={subject._id} value={subject._id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.isPublic}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                isPublic: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">
                            Công khai (cho phép gia sư khác sử dụng)
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Criteria */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Tiêu chí chấm điểm <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddCriterion}
                        className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Thêm tiêu chí
                      </button>
                    </div>

                    {/* Weight Summary */}
                    <div
                      className={`mb-4 p-3 rounded-lg border ${
                        isWeightValid
                          ? 'bg-green-50 border-green-200'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          Tổng trọng số: {(totalWeight * 100).toFixed(1)}%
                        </span>
                        {isWeightValid ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckIcon className="w-4 h-4" />
                            Hợp lệ
                          </span>
                        ) : (
                          <span className="text-yellow-700">
                            Cần bằng 100%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {formData.criteria.map((criterion, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 relative"
                        >
                          {formData.criteria.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCriterion(index)}
                              className="absolute top-2 right-2 p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          )}

                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Tên tiêu chí <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={criterion.label}
                                onChange={(e) =>
                                  handleCriterionChange(
                                    index,
                                    'label',
                                    e.target.value
                                  )
                                }
                                placeholder="VD: Nội dung (Content)"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Mô tả tiêu chí
                              </label>
                              <textarea
                                value={criterion.description || ''}
                                onChange={(e) =>
                                  handleCriterionChange(
                                    index,
                                    'description',
                                    e.target.value
                                  )
                                }
                                placeholder="VD: Đánh giá ý tưởng chính, lập luận và dẫn chứng"
                                rows={2}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Trọng số (%) <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  required
                                  min="1"
                                  max="100"
                                  step="1"
                                  value={(criterion.weight * 100).toFixed(0)}
                                  onChange={(e) =>
                                    handleCriterionChange(
                                      index,
                                      'weight',
                                      parseFloat(e.target.value) / 100
                                    )
                                  }
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Điểm tối đa <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  required
                                  min="1"
                                  max="100"
                                  value={criterion.maxScore}
                                  onChange={(e) =>
                                    handleCriterionChange(
                                      index,
                                      'maxScore',
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingRubric(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={!isWeightValid}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingRubric ? 'Cập nhật' : 'Tạo Rubric'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TutorRubricManagementPage;
