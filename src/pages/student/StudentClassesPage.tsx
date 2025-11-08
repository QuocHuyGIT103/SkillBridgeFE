import React, { useEffect, useState } from 'react';
import StudentClassesList from '../../components/student/StudentClassesList';
import { useClassStore } from '../../store/class.store';

const StudentClassesPage: React.FC = () => {
  const { fetchStudentClasses, loading } = useClassStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClasses = async () => {
      debugger;
      await fetchStudentClasses();
      setIsLoading(false);
    };
    
    loadClasses();
  }, [fetchStudentClasses]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lớp học của tôi
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý các lớp học bạn đã đăng ký
          </p>
        </div>
        
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