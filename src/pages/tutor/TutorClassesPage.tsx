import React, { useEffect, useState } from 'react';
import TutorClassesList from '../../components/tutor/TutorClassesList';
import { useClassStore } from '../../store/class.store';
import DashboardStats from '../../components/dashboard/DashboardStats';
import { AcademicCapIcon, UserGroupIcon, BookOpenIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const TutorClassesPage: React.FC = () => {
  const { tutorClasses, fetchTutorClasses, loading } = useClassStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClasses = async () => {
      await fetchTutorClasses();
      setIsLoading(false);
    };
    
    loadClasses();
  }, [fetchTutorClasses]);

  const activeClasses = tutorClasses.filter((c) => c.status === 'ACTIVE');
  const totalStudents = new Set(tutorClasses.map((c) => c.studentId.id)).size;
  const totalSessions = tutorClasses.reduce((sum, c) => sum + c.totalSessions, 0);
  const completedSessions = tutorClasses.reduce((sum, c) => sum + c.completedSessions, 0);
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý lớp học
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý các lớp học của bạn
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
                value: tutorClasses.length,
                icon: AcademicCapIcon,
                color: 'blue',
                description: 'Tất cả lớp học',
              },
              {
                label: 'Lớp đang dạy',
                value: activeClasses.length,
                icon: BookOpenIcon,
                color: 'green',
                description: 'Đang hoạt động',
              },
              {
                label: 'Tổng học viên',
                value: totalStudents,
                icon: UserGroupIcon,
                color: 'purple',
                description: 'Số học viên',
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
          <TutorClassesList />
        )}
      </div>
    </div>
  );
};

export default TutorClassesPage;