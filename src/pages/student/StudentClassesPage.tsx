import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import StudentClassesList from '../../components/student/StudentClassesList';
import { useClassStore } from '../../store/class.store';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  BookOpenIcon, 
  ChartBarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const StudentClassesPage: React.FC = () => {
  const { studentClasses, fetchStudentClasses, loading } = useClassStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClasses = async () => {
      await fetchStudentClasses();
      setIsLoading(false);
    };
    
    loadClasses();
  }, [fetchStudentClasses]);

  const activeClasses = studentClasses.filter((c) => c.status === 'ACTIVE');
  const totalTutors = new Set(studentClasses.map((c) => c.tutorId.id)).size;
  const totalSessions = studentClasses.reduce((sum, c) => sum + c.totalSessions, 0);
  const completedSessions = studentClasses.reduce((sum, c) => sum + c.completedSessions, 0);
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  const stats = [
    {
      label: 'Tổng lớp học',
      value: studentClasses.length,
      icon: AcademicCapIcon,
      gradient: 'from-blue-500 to-indigo-500',
      bgLight: 'bg-blue-50',
      description: 'Tất cả lớp học',
    },
    {
      label: 'Lớp đang học',
      value: activeClasses.length,
      icon: BookOpenIcon,
      gradient: 'from-emerald-500 to-green-500',
      bgLight: 'bg-emerald-50',
      description: 'Đang hoạt động',
    },
    {
      label: 'Tổng gia sư',
      value: totalTutors,
      icon: UserGroupIcon,
      gradient: 'from-purple-500 to-violet-500',
      bgLight: 'bg-purple-50',
      description: 'Số gia sư',
    },
    {
      label: 'Tỷ lệ hoàn thành',
      value: `${completionRate}%`,
      icon: ChartBarIcon,
      gradient: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50',
      description: `${completedSessions}/${totalSessions} buổi`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
                  <AcademicCapIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Lớp Học Của Tôi
                </h1>
              </div>
              <p className="text-gray-600 ml-14">
                Quản lý các lớp học bạn đã đăng ký
              </p>
            </div>

            <button
              onClick={() => fetchStudentClasses()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium shadow-sm"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {!isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Tổng quan lớp học</h2>
              <p className="text-sm text-gray-500 mb-6">Thống kê về các lớp học của bạn</p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className={`${stat.bgLight} rounded-xl p-4 border border-gray-100`}
                  >
                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-sm mb-3`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm font-medium text-gray-700">{stat.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Classes List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-500">Đang tải danh sách lớp học...</p>
              </div>
            </div>
          ) : (
            <StudentClassesList />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StudentClassesPage;