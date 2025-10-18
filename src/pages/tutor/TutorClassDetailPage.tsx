import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClassStore } from '../../store/class.store';
import ClassStatusBadge from '../../components/common/ClassStatusBadge';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  InformationCircleIcon,
  UserCircleIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'; // <-- Thêm import icon

const TutorClassDetailPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { fetchClassById, currentClass, updateClassStatus, loading } = useClassStore();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (classId) {
      fetchClassById(classId);
    }
  }, [classId, fetchClassById]);

  const handleStatusUpdate = async (status: string) => {
    if (!classId) return;
    
    setIsUpdating(true);
    try {
      await updateClassStatus(classId, status);
      toast.success(`Trạng thái lớp học đã được cập nhật thành ${status === 'COMPLETED' ? 'hoàn thành' : 'đã hủy'}`);
    } catch (error) {
      console.error('Failed to update class status:', error);
      toast.error('Cập nhật trạng thái thất bại'); // Thêm toast error
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // --- Not Found State (cũng được làm đẹp hơn) ---
  if (!currentClass) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
        <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-3">Lớp học không tồn tại</h2>
          <p className="text-gray-600 mb-6">Không thể tìm thấy thông tin lớp học này.</p>
          <button
            onClick={() => navigate('/tutor/classes')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // --- Main Detail Page ---
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header: Title + Back Button */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Chi tiết lớp học
          </h1>
          <button
            onClick={() => navigate('/tutor/classes')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">

            {/* Card Header: Title, Status, Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentClass.title}</h2>
                <ClassStatusBadge status={currentClass.status} />
              </div>
              
              {currentClass.status === 'ACTIVE' && (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 sm:mt-0 flex-shrink-0">
                  <button
                    onClick={() => handleStatusUpdate('COMPLETED')}
                    disabled={isUpdating}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    Hoàn thành
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('CANCELLED')}
                    disabled={isUpdating}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <XCircleIcon className="h-5 w-5" />
                    Hủy lớp học
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mt-6 pt-6">
              
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Class Info Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                    <InformationCircleIcon className="h-6 w-6 text-blue-500" />
                    Thông tin lớp học
                  </h3>
                  {/* Dùng Definition List (dl) cho sạch sẽ */}
                  <dl className="divide-y divide-gray-100">
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Môn học</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{currentClass.subject?.name}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Ngày bắt đầu</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{new Date(currentClass.startDate).toLocaleDateString('vi-VN')}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Kết thúc dự kiến</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{currentClass.expectedEndDate ? new Date(currentClass.expectedEndDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Học phí</dt>
                      <dd className="text-sm font-medium text-blue-600 col-span-2">{currentClass.totalAmount?.toLocaleString('vi-VN')} VND</dd>
                    </div>
                  </dl>
                </div>

                {/* Student Info Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                    <UserCircleIcon className="h-6 w-6 text-green-500" />
                    Thông tin học viên
                  </h3>
                  <dl className="divide-y divide-gray-100">
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Họ tên</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{currentClass.studentId?.full_name}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{currentClass.studentId?.email}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Số điện thoại</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{currentClass.studentId?.phone_number || 'Không có'}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Description Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                  <DocumentTextIcon className="h-6 w-6 text-gray-500" />
                  Mô tả lớp học
                </h3>
                {/* Bỏ nền xám, dùng prose để tự động format text */}
                <div className="prose prose-sm max-w-none text-gray-700">
                  <p className="whitespace-pre-line">
                    {currentClass.description || 'Không có mô tả'}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorClassDetailPage;