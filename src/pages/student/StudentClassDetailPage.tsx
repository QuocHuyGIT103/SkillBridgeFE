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
  VideoCameraIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LEFT COLUMN: Class Info */}
                <div className="space-y-8">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                      <InformationCircleIcon className="h-6 w-6 text-blue-500" />
                      Thông tin lớp học
                    </h3>
                    <dl className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <dt className="text-sm font-medium text-gray-500">Môn học</dt>
                        <dd className="text-sm font-semibold text-gray-900">{currentClass.subject?.name}</dd>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <dt className="text-sm font-medium text-gray-500">Hình thức</dt>
                        <dd className="text-sm text-gray-900">
                          {currentClass.learningMode === 'ONLINE' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              <VideoCameraIcon className="h-4 w-4" />
                              Online
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              <MapPinIcon className="h-4 w-4" />
                              Trực tiếp
                            </span>
                          )}
                        </dd>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <dt className="text-sm font-medium text-gray-500">Tổng số buổi</dt>
                        <dd className="text-sm text-gray-900">{currentClass.totalSessions} buổi</dd>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <dt className="text-sm font-medium text-gray-500">Đã hoàn thành</dt>
                        <dd className="text-sm text-gray-900">{currentClass.completedSessions} / {currentClass.totalSessions} buổi</dd>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <dt className="text-sm font-medium text-gray-500">Giá/buổi</dt>
                        <dd className="text-sm font-semibold text-blue-600">{currentClass.pricePerSession?.toLocaleString('vi-VN')} VND</dd>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <dt className="text-sm font-medium text-gray-500">Tổng học phí</dt>
                        <dd className="text-sm font-bold text-blue-600">{currentClass.totalAmount?.toLocaleString('vi-VN')} VND</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Schedule */}
                  {currentClass.schedule && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                        <CalendarDaysIcon className="h-6 w-6 text-purple-500" />
                        Lịch học
                      </h3>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <ClockIcon className="h-5 w-5 text-purple-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-purple-900">
                                {currentClass.schedule.dayOfWeek.map(day => {
                                  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                                  return days[day];
                                }).join(', ')}
                              </p>
                              <p className="text-sm text-purple-700">
                                {currentClass.schedule.startTime} - {currentClass.schedule.endTime}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-purple-200">
                            <CalendarDaysIcon className="h-5 w-5 text-purple-600" />
                            <div className="text-sm">
                              <span className="text-purple-700">Bắt đầu: </span>
                              <span className="font-medium text-purple-900">{new Date(currentClass.startDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>
                          {currentClass.expectedEndDate && (
                            <div className="flex items-center gap-2">
                              <CheckCircleIcon className="h-5 w-5 text-purple-600" />
                              <div className="text-sm">
                                <span className="text-purple-700">Kết thúc dự kiến: </span>
                                <span className="font-medium text-purple-900">{new Date(currentClass.expectedEndDate).toLocaleDateString('vi-VN')}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: Tutor & Location/Online Info */}
                <div className="space-y-8">
                  {/* Tutor Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                      <AcademicCapIcon className="h-6 w-6 text-green-500" />
                      Thông tin gia sư
                    </h3>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        {currentClass.tutorId?.avatar_url ? (
                          <img 
                            src={currentClass.tutorId.avatar_url} 
                            alt={currentClass.tutorId.full_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                            <AcademicCapIcon className="h-6 w-6 text-green-700" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{currentClass.tutorId?.full_name}</p>
                          <p className="text-sm text-gray-600">Gia sư</p>
                        </div>
                      </div>
                      <dl className="space-y-2">
                        <div className="flex justify-between py-2 border-t border-green-200">
                          <dt className="text-sm text-green-700">Email</dt>
                          <dd className="text-sm text-gray-900">{currentClass.tutorId?.email}</dd>
                        </div>
                        <div className="flex justify-between py-2 border-t border-green-200">
                          <dt className="text-sm text-green-700">Số điện thoại</dt>
                          <dd className="text-sm text-gray-900">{currentClass.tutorId?.phone_number || 'Không có'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {/* Online Info - ZOOM */}
                  {currentClass.learningMode === 'ONLINE' && currentClass.onlineInfo && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                        <VideoCameraIcon className="h-6 w-6 text-blue-500" />
                        Thông tin học Online
                      </h3>
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <img src="https://img.icons8.com/color/48/000000/zoom.png" alt="Zoom" className="w-8 h-8" />
                          <span className="font-semibold text-blue-900">{currentClass.onlineInfo.platform}</span>
                        </div>
                        
                        <dl className="space-y-3">
                          <div>
                            <dt className="text-xs font-medium text-blue-700 mb-1">Meeting ID</dt>
                            <dd className="flex items-center justify-between bg-white rounded px-3 py-2">
                              <span className="font-mono text-sm text-gray-900">{currentClass.onlineInfo.meetingId}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(currentClass.onlineInfo!.meetingId);
                                  alert('Đã copy Meeting ID!');
                                }}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                              >
                                Copy
                              </button>
                            </dd>
                          </div>

                          <div>
                            <dt className="text-xs font-medium text-blue-700 mb-1">Link Meeting</dt>
                            <dd className="flex items-center justify-between bg-white rounded px-3 py-2">
                              <a 
                                href={currentClass.onlineInfo.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs text-blue-600 hover:underline truncate max-w-[200px]"
                              >
                                {currentClass.onlineInfo.meetingLink}
                              </a>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(currentClass.onlineInfo!.meetingLink);
                                  alert('Đã copy Link!');
                                }}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium ml-2"
                              >
                                Copy
                              </button>
                            </dd>
                          </div>

                          <div>
                            <dt className="text-xs font-medium text-blue-700 mb-1">Mật khẩu</dt>
                            <dd className="flex items-center justify-between bg-white rounded px-3 py-2">
                              <span className="font-mono text-sm text-gray-900">{currentClass.onlineInfo.password}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(currentClass.onlineInfo!.password);
                                  alert('Đã copy mật khẩu!');
                                }}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                              >
                                Copy
                              </button>
                            </dd>
                          </div>
                        </dl>

                        <div className="mt-4 pt-3 border-t border-blue-200">
                          <a
                            href={currentClass.onlineInfo.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            <VideoCameraIcon className="h-5 w-5" />
                            Tham gia lớp học
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Location - OFFLINE */}
                  {currentClass.learningMode === 'OFFLINE' && currentClass.location && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                        <MapPinIcon className="h-6 w-6 text-red-500" />
                        Địa điểm học
                      </h3>
                      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                        <p className="text-gray-900">{currentClass.location.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                  <DocumentTextIcon className="h-6 w-6 text-gray-500" />
                  Mô tả lớp học
                </h3>
                <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 rounded-lg p-4">
                  <p className="whitespace-pre-line">
                    {currentClass.description || 'Không có mô tả'}
                  </p>
                </div>
              </div>

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