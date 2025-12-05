import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useClassStore } from '../../store/class.store';
import ClassStatusBadge from '../common/ClassStatusBadge';
import {
  EyeIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  XCircleIcon,
  BookmarkSlashIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

const StudentClassesList: React.FC = () => {
  const { studentClasses, loading, error } = useClassStore();

  // --- Loading State ---
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-500">Đang tải danh sách lớp học...</p>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-xl flex items-center gap-3 border border-red-200">
        <XCircleIcon className="h-6 w-6 text-red-500" />
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  // --- Empty State ---
  if (!studentClasses || studentClasses.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm rounded-2xl border border-gray-100 p-12 text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
          <BookmarkSlashIcon className="h-10 w-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có lớp học nào</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Bạn chưa đăng ký tham gia lớp học nào. Hãy tìm kiếm gia sư phù hợp và gửi yêu cầu học tập.
        </p>
      </motion.div>
    );
  }

  // --- Main List ---
  return (
    <div className="space-y-3">
      <AnimatePresence>
        {studentClasses.map((classItem, index) => (
          <motion.div
            key={classItem._id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
          >
            <div className="p-4 sm:p-5">
              {/* Row Layout */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Left: Class Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    {/* Class Icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                      <BookOpenIcon className="h-6 w-6 text-white" />
                    </div>
                    
                    {/* Class Details */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/student/classes/${classItem._id}`}
                        className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
                      >
                        {classItem.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                          <BookOpenIcon className="h-4 w-4 text-blue-500" />
                          {classItem.subject?.name}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                          <CalendarDaysIcon className="h-4 w-4 text-purple-500" />
                          {new Date(classItem.startDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle: Tutor Info */}
                <div className="flex items-center gap-3 lg:min-w-[180px]">
                  {classItem.tutorId?.avatar_url ? (
                    <img 
                      src={classItem.tutorId.avatar_url} 
                      alt="" 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                      <AcademicCapIcon className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{classItem.tutorId?.full_name}</p>
                    <p className="text-xs text-gray-500">Gia sư</p>
                  </div>
                </div>

                {/* Right: Status & Action */}
                <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                  <ClassStatusBadge status={classItem.status} />
                  <Link 
                    to={`/student/classes/${classItem._id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>Chi tiết</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default StudentClassesList;