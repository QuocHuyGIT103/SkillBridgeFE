import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import ExerciseLibraryService from '../../services/exerciseLibrary.service';
import type { ExerciseTemplate, Rubric } from '../../services/exerciseLibrary.service';
import SubjectService from '../../services/subject.service';
import type { Subject } from '../../services/subject.service';
import { uploadService } from '../../services';
import toast from 'react-hot-toast';

const GRADE_LEVEL_OPTIONS = [
  { value: 'TIỂU_HỌC', label: 'Tiểu học' },
  { value: 'TRUNG_HOC_CO_SO', label: 'THCS' },
  { value: 'TRUNG_HOC_PHO_THONG', label: 'THPT' },
  { value: 'DAI_HOC', label: 'Đại học' },
  { value: 'NGUOI_DI_LAM', label: 'Người đi làm' },
];

const ASSIGNMENT_TYPES = [
  { value: 'WRITING', label: 'Viết' },
  { value: 'SPEAKING', label: 'Nói' },
  { value: 'QUIZ', label: 'Quiz' },
  { value: 'FILE_UPLOAD', label: 'Nộp file' },
];

const TutorExerciseBankPage: React.FC = () => {
  const [templates, setTemplates] = useState<ExerciseTemplate[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    type: 'WRITING',
    gradeLevels: [] as string[],
    difficulty: 'MEDIUM',
    tags: '',
    prompt: '',
    sampleAnswer: '',
    resources: '',
    isPublic: true,
    rubricId: '',
    attachmentUrl: '',
  });

  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [templateRes, rubricRes, subjectRes] = await Promise.all([
        ExerciseLibraryService.listTemplates({ mineOnly: true }),
        ExerciseLibraryService.listRubrics(),
        SubjectService.getActiveSubjects(),
      ]);

      // axiosClient đã unwrap response nên data chính là mảng template/rubric
      setTemplates(templateRes.data || []);
      setRubrics(rubricRes.data || []);
      setSubjects(subjectRes.data?.subjects || []);
    } catch (error) {
      console.error('Failed to load exercise bank data:', error);
      toast.error('Không thể tải kho bài tập');
    } finally {
      setLoading(false);
    }
  };

  const toggleGradeLevel = (value: string) => {
    setFormData((prev) => {
      const exists = prev.gradeLevels.includes(value);
      return {
        ...prev,
        gradeLevels: exists
          ? prev.gradeLevels.filter((item) => item !== value)
          : [...prev.gradeLevels, value],
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File quá lớn! Giới hạn 10MB');
      return;
    }

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadService.uploadFile(formData);
      const fileUrl = response.data.url;

      setFormData(prev => ({ ...prev, attachmentUrl: fileUrl }));
      toast.success('Tải file lên thành công!');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error('Tải file lên thất bại');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }
    if (!formData.subjectId) {
      toast.error('Vui lòng chọn môn học');
      return;
    }
    if (!formData.prompt.trim()) {
      toast.error('Hãy nhập đề bài/prompt');
      return;
    }

    try {
      setCreating(true);
      await ExerciseLibraryService.createTemplate({
        title: formData.title.trim(),
        subjectId: formData.subjectId,
        description: formData.description.trim() || undefined,
        type: formData.type as ExerciseTemplate['type'],
        gradeLevels: formData.gradeLevels.length
          ? formData.gradeLevels
          : ['TRUNG_HOC_PHO_THONG'],
        difficulty: formData.difficulty as ExerciseTemplate['difficulty'],
        tags: formData.tags
          ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : [],
        rubricId: formData.rubricId || undefined,
        content: {
          prompt: formData.prompt.trim(),
          attachmentUrl: formData.attachmentUrl || undefined,
          sampleAnswer: formData.sampleAnswer.trim() || undefined,
          resources: formData.resources
            ? formData.resources
                .split('\n')
                .map((item) => item.trim())
                .filter(Boolean)
            : undefined,
        },
        isPublic: formData.isPublic,
      });

      toast.success('Đã thêm bài tập vào kho');
      setShowForm(false);
      setFormData({
        ...formData,
        title: '',
        description: '',
        prompt: '',
        sampleAnswer: '',
        resources: '',
        tags: '',
        attachmentUrl: '',
      });
      await fetchInitialData();
    } catch (error: any) {
      console.error('Create template error:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo bài tập');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    const confirmed = window.confirm('Xóa bài tập này khỏi kho?');
    if (!confirmed) return;

    try {
      await ExerciseLibraryService.deleteTemplate(templateId);
      toast.success('Đã xóa bài tập');
      setTemplates((prev) => prev.filter((tpl) => tpl.id !== templateId));
    } catch (error) {
      console.error('Delete template error:', error);
      toast.error('Không thể xóa bài tập');
    }
  };

  const subjectMap = useMemo(() => {
    const map: Record<string, string> = {};
    subjects.forEach((subject) => {
      map[subject._id] = subject.name;
    });
    return map;
  }, [subjects]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <p className="text-sm text-purple-500 font-semibold">Kho bài tập</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">
            Exercise Bank & Rubric
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Tạo và tái sử dụng các bài tập chất lượng cao cho từng buổi học. Kho
            bài tập giúp bạn gắn rubric, đề bài, tài nguyên và chia sẻ cho các
            lớp khác nhau.
          </p>
        </div>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg transition"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          {showForm ? 'Đóng biểu mẫu' : 'Thêm bài tập'}
        </button>
      </motion.div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow border border-gray-100 p-6 space-y-5"
        >
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-purple-600" />
            Thông tin bài tập
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Tiêu đề *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Môn học *
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subjectId: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Chọn môn</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Loại bài tập
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {ASSIGNMENT_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Độ khó
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    difficulty: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="EASY">Dễ</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HARD">Khó</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Mô tả ngắn
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={2}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Tóm tắt yêu cầu chính..."
            />
          </div>

  <div>
    <label className="text-sm font-medium text-gray-700">
      Cấp độ áp dụng
    </label>
    <div className="mt-2 flex flex-wrap gap-2">
      {GRADE_LEVEL_OPTIONS.map((option) => {
        const isActive = formData.gradeLevels.includes(option.value);
        return (
          <button
            type="button"
            key={option.value}
            onClick={() => toggleGradeLevel(option.value)}
            className={`px-3 py-1 rounded-full text-sm border ${
              isActive
                ? 'bg-purple-100 border-purple-400 text-purple-700'
                : 'border-gray-200 text-gray-600 hover:border-purple-200'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </div>

  <div className="grid md:grid-cols-2 gap-4">
    <div>
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        Rubric (tùy chọn)
        <span className="group relative">
          <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-10">
            <div className="font-semibold mb-1">Rubric là gì?</div>
            <div className="text-gray-300">
              Rubric là bảng tiêu chí chấm điểm chi tiết, giúp AI tự động chấm điểm theo từng tiêu chí (nội dung, cấu trúc, ngữ pháp...). Khi gắn rubric, bài làm của học viên sẽ được AI đánh giá và gợi ý điểm tham khảo.
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        </span>
      </label>
      <select
        value={formData.rubricId}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, rubricId: e.target.value }))
        }
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="">Không gắn rubric</option>
        {rubrics.map((rubric) => (
          <option key={rubric.id} value={rubric.id}>
            {rubric.name}
          </option>
        ))}
      </select>
      {formData.rubricId && (
        <p className="mt-1 text-xs text-purple-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          AI sẽ tự động chấm điểm theo rubric này
        </p>
      )}
    </div>
    <div>
      <label className="text-sm font-medium text-gray-700">Tags</label>
      <input
        type="text"
        value={formData.tags}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, tags: e.target.value }))
        }
        placeholder="VD: IELTS, Writing task 2"
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  </div>

  <div>
    <label className="text-sm font-medium text-gray-700">
      Đề bài / Prompt *
    </label>
    <textarea
      value={formData.prompt}
      onChange={(e) =>
        setFormData((prev) => ({ ...prev, prompt: e.target.value }))
      }
      rows={4}
      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
      placeholder="Nhập nội dung đề bài chi tiết..."
    />
  </div>

  <div>
    <label className="text-sm font-medium text-gray-700 mb-2 block">
      Tài liệu đính kèm (tùy chọn)
    </label>
    <div className="flex items-center space-x-3">
      <label className="flex-1 cursor-pointer">
        <input
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploadingFile}
        />
        <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors flex items-center justify-center space-x-2 text-gray-600 hover:text-purple-600">
          <DocumentTextIcon className="w-5 h-5" />
          <span>{uploadingFile ? 'Đang tải...' : 'Chọn file đính kèm'}</span>
        </div>
      </label>
    </div>
    {formData.attachmentUrl && (
      <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <a
          href={formData.attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          File đã tải lên
        </a>
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, attachmentUrl: '' }))}
          className="text-red-500 hover:text-red-700 ml-2"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    )}
    <p className="mt-1 text-xs text-gray-500">
      Hỗ trợ: PDF, Word, PowerPoint, ảnh (tối đa 10MB). File này sẽ được đính kèm khi giao bài tập.
    </p>
  </div>

  <div className="grid md:grid-cols-2 gap-4">
    <div>
      <label className="text-sm font-medium text-gray-700">
        Gợi ý/Sample answer
      </label>
      <textarea
        value={formData.sampleAnswer}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            sampleAnswer: e.target.value,
          }))
        }
        rows={3}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
    <div>
      <label className="text-sm font-medium text-gray-700">
        Tài nguyên tham khảo
      </label>
      <textarea
        value={formData.resources}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, resources: e.target.value }))
        }
        rows={3}
        placeholder="Mỗi đường link trên một dòng"
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  </div>

  <label className="flex items-center space-x-2">
    <input
      type="checkbox"
      checked={formData.isPublic}
      onChange={(e) =>
        setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))
      }
      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
    />
    <span className="text-sm text-gray-700">
      Cho phép các gia sư khác sử dụng bài tập này
    </span>
  </label>

  <div className="flex justify-end space-x-3">
    <button
      onClick={() => setShowForm(false)}
      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
    >
      Hủy
    </button>
    <button
      onClick={handleCreateTemplate}
      disabled={creating}
      className="px-5 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:bg-purple-400 transition flex items-center"
    >
      {creating ? (
        <>
          <span className="mr-2 inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Đang lưu...
        </>
      ) : (
        <>
          <PlusIcon className="w-4 h-4 mr-2" />
          Tạo bài tập
        </>
      )}
    </button>
  </div>
</motion.div>
      )}

      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <BookOpenIcon className="w-5 h-5 text-purple-600" />
            Danh sách bài tập ({templates.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            Kho bài tập đang trống. Hãy tạo bài tập đầu tiên của bạn!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {template.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {subjectMap[template.subjectId] || 'Không rõ môn'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-gray-400 hover:text-red-500 transition"
                    title="Xóa bài tập"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                {template.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {template.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                    {template.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {template.difficulty || 'MEDIUM'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Đã dùng {template.usageCount ?? 0} lần
                  </span>
                </div>
                {template.tags && template.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1 text-xs text-gray-500">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded-full"
                      >
                        <TagIcon className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorExerciseBankPage;


