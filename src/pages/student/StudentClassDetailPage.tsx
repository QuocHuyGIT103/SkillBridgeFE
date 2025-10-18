import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClassStore } from '../../store/class.store';
import ClassStatusBadge from '../../components/common/ClassStatusBadge';
// Thêm import icons từ heroicons
import {
  ArrowLeftIcon,
  InformationCircleIcon,
  AcademicCapIcon, // Icon cho gia sư
  DocumentTextIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'; // Icon ngôi sao (đầy)

const StudentClassDetailPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { fetchClassById, currentClass, loading } = useClassStore();

  useEffect(() => {
    if (classId) {
      fetchClassById(classId);
    }
  }, [classId, fetchClassById]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // --- Not Found State (Làm đẹp hơn) ---
  if (!currentClass) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
        <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-3">Lớp học không tồn tại</h2>
          <p className="text-gray-600 mb-6">Không thể tìm thấy thông tin lớp học này.</p>
          <button
            onClick={() => navigate('/student/classes')}
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
            onClick={() => navigate('/student/classes')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">

            {/* Card Header: Title, Status */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentClass.title}</h2>
                <ClassStatusBadge status={currentClass.status} />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mt-6 pt-6">
              
              {/* Info Grid (Class & Tutor) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Class Info Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                    <InformationCircleIcon className="h-6 w-6 text-blue-500" />
                    Thông tin lớp học
                  </h3>
                  {/* Dùng Definition List (dl) cho sạch sẽ, bỏ nền xám */}
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

                {/* Tutor Info Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                    <AcademicCapIcon className="h-6 w-6 text-green-500" />
                    Thông tin gia sư
                  </h3>
                  <dl className="divide-y divide-gray-100">
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Họ tên</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{currentClass.tutorId?.full_name}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{currentClass.tutorId?.email}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Số điện thoại</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{currentClass.tutorId?.phone_number || 'Không có'}</dd>
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

              {/* Schedule Section */}
              {currentClass.schedule && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                    <ClockIcon className="h-6 w-6 text-gray-500" />
                    Lịch học
                  </h3>
                  <p className="text-gray-900">
                    {currentClass.schedule.dayOfWeek.map(day => {
                      const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                      return days[day];
                    }).join(', ')}
                    {' '}từ {currentClass.schedule.startTime} đến {currentClass.schedule.endTime}
                  </p>
                </div>
              )}

              {/* Location Section */}
              {currentClass.location && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                    <MapPinIcon className="h-6 w-6 text-gray-500" />
                    Địa điểm học
                  </h3>
                  <p className="text-gray-900">{currentClass.location.address}</p>
                </div>
              )}

              {/* Review Section */}
              {currentClass.status === 'COMPLETED' && (
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                    <StarIcon className="h-6 w-6 text-yellow-500" />
                    Đánh giá của bạn
                  </h3>
                  {currentClass.studentReview ? (
                    <div>
                      <div className="flex items-center mb-2">
                        {/* Thay thế SVG bằng Heroicons */}
                        {[...Array(5)].map((_, i) => (
                          i < (currentClass.studentReview?.rating || 0) 
                            ? <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
                            : <StarIcon key={i} className="w-5 h-5 text-gray-300" />
                        ))}
                        <span className="ml-2 text-sm font-medium text-gray-600">
                          {currentClass.studentReview.rating}/5
                        </span>
                      </div>
                      <p className="text-gray-800 italic">"{currentClass.studentReview.comment}"</p>
                    </div>
                  ) : (
                    // Dùng nền xám nhẹ ở đây để tạo Call-to-Action
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <p className="text-gray-600 mb-4">Bạn chưa đánh giá lớp học này.</p>
                      <button
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => navigate(`/student/classes/${classId}/review`)}
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                        Đánh giá ngay
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentClassDetailPage;