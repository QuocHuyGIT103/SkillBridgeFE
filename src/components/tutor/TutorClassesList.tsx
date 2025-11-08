import React from 'react';
import { Link } from 'react-router-dom';
import { useClassStore } from '../../store/class.store';
import ClassStatusBadge from '../common/ClassStatusBadge';
// Thêm import icons từ heroicons
import {
  EyeIcon,
  CalendarDaysIcon,
  UserIcon,
  AcademicCapIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const TutorClassesList: React.FC = () => {
  const { tutorClasses, loading, error } = useClassStore();

  // --- Loading State (Giữ nguyên, đã tốt) ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // --- Error State (Làm đẹp hơn với icon) ---
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3 shadow">
        <XCircleIcon className="h-6 w-6 text-red-500" />
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  // --- Empty State (Làm đẹp hơn với icon) ---
  if (!tutorClasses || tutorClasses.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8 text-center">
        <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có lớp học nào</h3>
        <p className="text-gray-500">Hiện tại bạn chưa quản lý lớp học nào.</p>
      </div>
    );
  }

  // --- Main List (Hybrid Layout) ---
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      
      {/* 1. DESKTOP VIEW: Bảng (chỉ hiển thị từ 'md' trở lên) */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Gộp Tên Lớp + Môn Học */}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lớp học
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Học viên
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày bắt đầu
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chi tiết
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tutorClasses.map((classItem) => (
              <tr key={classItem._id} className="hover:bg-gray-50 transition-colors">
                
                {/* Cột Lớp học / Môn học */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link 
                    to={`/tutor/classes/${classItem._id}`} 
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {classItem.title}
                  </Link>
                  <div className="text-xs text-gray-500">{classItem.subject?.name}</div>
                </td>
                
                {/* Cột Học viên */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{classItem.studentId?.full_name}</div>
                </td>
                
                {/* Cột Trạng thái */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <ClassStatusBadge status={classItem.status} />
                </td>
                
                {/* Cột Ngày bắt đầu */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(classItem.startDate).toLocaleDateString('vi-VN')}
                  </div>
                </td>
                
                {/* Cột Thao tác (dùng icon) */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link 
                    to={`/tutor/classes/${classItem._id}`} 
                    className="text-gray-400 hover:text-blue-600 p-2 rounded-full transition-colors"
                    title="Xem chi tiết"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. MOBILE VIEW: Danh sách Card (ẩn từ 'md' trở lên) */}
      <div className="block md:hidden bg-gray-50">
        <div className="space-y-4 p-4">
          {tutorClasses.map((classItem) => (
            <div key={classItem._id} className="bg-white shadow rounded-lg p-4">
              {/* Phần Header của Card */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Link 
                    to={`/tutor/classes/${classItem._id}`} 
                    className="text-base font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {classItem.title}
                  </Link>
                  <div className="text-sm text-gray-500">{classItem.subject?.name}</div>
                </div>
                <ClassStatusBadge status={classItem.status} />
              </div>
              
              {/* Phần thông tin của Card */}
              <div className="space-y-2 mb-4 border-t pt-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <span>{classItem.studentId?.full_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                  <span>{new Date(classItem.startDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              {/* Nút hành động của Card */}
              <Link 
                to={`/tutor/classes/${classItem._id}`} 
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <EyeIcon className="h-4 w-4" />
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default TutorClassesList;