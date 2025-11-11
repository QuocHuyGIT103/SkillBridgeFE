import React, { useEffect, useState } from 'react';
import StudentClassesList from '../../components/student/StudentClassesList';
import { useClassStore } from '../../store/class.store';
import DashboardStats from '../../components/dashboard/DashboardStats';
import { AcademicCapIcon, UserGroupIcon, BookOpenIcon, ChartBarIcon } from '@heroicons/react/24/outline';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lớp học của tôi
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý các lớp học bạn đã đăng ký
          </p>
        </div>

        {/* Dashboard Stats */}
        {!isLoading && (
          <DashboardStats
            title="Tổng quan lớp học"
            description="Thống kê về các lớp học của bạn"
            stats={[
              {
                label: 'Tổng lớp học',
                value: studentClasses.length,
                icon: AcademicCapIcon,
                color: 'blue',
                description: 'Tất cả lớp học',
              },
              {
                label: 'Lớp đang học',
                value: activeClasses.length,
                icon: BookOpenIcon,
                color: 'green',
                description: 'Đang hoạt động',
              },
              {
                label: 'Tổng gia sư',
                value: totalTutors,
                icon: UserGroupIcon,
                color: 'purple',
                description: 'Số gia sư',
              },
              {
                label: 'Tỷ lệ hoàn thành',
                value: `${completionRate}%`,
                icon: ChartBarIcon,
                color: 'indigo',
                description: `${completedSessions}/${totalSessions} buổi`,
              },
            ]}
          />
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <StudentClassesList />
        )}
      </div>
    </div>
  );
};

export default StudentClassesPage;