import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useStudentStore } from '../../store/student.store';

// ✅ Định nghĩa interface cho Student
interface Student {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  role: string;
  status: string;
  address?: string;
  parent_id?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  grade?: string;
  school?: string;
  subjects?: string[];
  learning_goals?: string;
  preferred_schedule?: string;
  special_requirements?: string;
  created_at: string;
  updated_at: string;
}

// ✅ Định nghĩa interface cho FormData
interface StudentFormData {
  full_name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  grade?: string;
  school?: string;
  subjects?: string[];
  learning_goals?: string;
  preferred_schedule?: string;
  special_requirements?: string;
}

interface StudentDetailsModalProps {
  show: boolean;
  onClose: () => void;
  student: Student | null;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ show, onClose, student }) => {
  const { updateStudent, loading } = useStudentStore();
  const [isEditing, setIsEditing] = useState(false);
  
  // ✅ Sử dụng interface đã định nghĩa
  const [formData, setFormData] = useState<StudentFormData>({});

  React.useEffect(() => {
    if (student) {
  
      setFormData({
        full_name: student.full_name || '',
        email: student.email || '',
        phone_number: student.phone_number || '',
        address: student.address || '',
        date_of_birth: student.date_of_birth || '',
        gender: student.gender || undefined,
        grade: student.grade || '',
        school: student.school || '',
        subjects: student.subjects || [],
        learning_goals: student.learning_goals || '',
        preferred_schedule: student.preferred_schedule || '',
        special_requirements: student.special_requirements || ''
      });
    }
  }, [student]);

  // ✅ Type-safe input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleSave = async () => {
    try {
      if (!student?.id) {
        throw new Error('Student ID is missing');
      }
      await updateStudent(student.id, formData);
      setIsEditing(false);
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật thông tin học viên');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  };

  
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };


  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };


  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!student || !show) return null; // ✅ Early return

  const studentName = student.full_name || 'N/A';
  const studentEmail = student.email || 'N/A';
  const avatarUrl = student.avatar_url;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={handleBackdropClick}
          />

         
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={handleModalClick}
            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full relative z-10"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    {avatarUrl ? (
                      <img className="h-12 w-12 rounded-full" src={avatarUrl} alt="" />
                    ) : (
                      <span className="text-lg font-semibold text-blue-600">
                        {studentName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{studentName}</h3>
                    <p className="text-sm text-gray-500">{studentEmail}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    disabled={loading}
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Thông tin cá nhân */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Thông tin cá nhân</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formatDateForInput(formData.date_of_birth)}
                        onChange={handleInputChange}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{formatDate(student.date_of_birth)}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                    {isEditing ? (
                      <select
                        name="gender"
                        value={formData.gender || ''}
                        onChange={handleInputChange}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {student.gender === 'male' ? 'Nam' : 
                         student.gender === 'female' ? 'Nữ' : 
                         student.gender === 'other' ? 'Khác' : 'Chưa cập nhật'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number || ''}
                        onChange={handleInputChange}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{student.phone_number || 'Chưa cập nhật'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{student.address || 'Chưa cập nhật'}</p>
                    )}
                  </div>
                </div>

                {/* Thông tin học tập */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Thông tin học tập</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lớp</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="grade"
                        value={formData.grade || ''}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Lớp 10, Lớp 12..."
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{student.grade || 'Chưa cập nhật'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trường học</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="school"
                        value={formData.school || ''}
                        onChange={handleInputChange}
                        placeholder="Tên trường đang học"
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{student.school || 'Chưa cập nhật'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Môn học</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {student.subjects && student.subjects.length > 0 
                        ? student.subjects.join(', ') 
                        : 'Chưa chọn môn học'
                      }
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mục tiêu học tập</label>
                    {isEditing ? (
                      <textarea
                        name="learning_goals"
                        value={formData.learning_goals || ''}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Mô tả mục tiêu học tập..."
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{student.learning_goals || 'Chưa cập nhật'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lịch học ưa thích</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="preferred_schedule"
                        value={formData.preferred_schedule || ''}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Thứ 2, 4, 6 từ 19h-21h"
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{student.preferred_schedule || 'Chưa cập nhật'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Yêu cầu đặc biệt</label>
                    {isEditing ? (
                      <textarea
                        name="special_requirements"
                        value={formData.special_requirements || ''}
                        onChange={handleInputChange}
                        rows={2}
                        placeholder="Các yêu cầu đặc biệt khác..."
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{student.special_requirements || 'Không có'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Thông tin hệ thống */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Thông tin hệ thống</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Trạng thái:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      student.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {student.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Ngày tạo:</span>
                    <span className="ml-2 text-gray-900">{formatDate(student.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data khi cancel
                    if (student) {
                      setFormData({
                        full_name: student.full_name || '',
                        email: student.email || '',
                        phone_number: student.phone_number || '',
                        address: student.address || '',
                        date_of_birth: student.date_of_birth || '',
                        gender: student.gender || undefined,
                        grade: student.grade || '',
                        school: student.school || '',
                        subjects: student.subjects || [],
                        learning_goals: student.learning_goals || '',
                        preferred_schedule: student.preferred_schedule || '',
                        special_requirements: student.special_requirements || ''
                      });
                    }
                  }}
                  disabled={loading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default StudentDetailsModal;