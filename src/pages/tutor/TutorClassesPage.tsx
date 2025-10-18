import React, { useEffect, useState } from 'react';
import TutorClassesList from '../../components/tutor/TutorClassesList';
import { useClassStore } from '../../store/class.store';

const TutorClassesPage: React.FC = () => {
  const { fetchTutorClasses, loading } = useClassStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClasses = async () => {
      await fetchTutorClasses();
      setIsLoading(false);
    };
    
    loadClasses();
  }, [fetchTutorClasses]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý lớp học
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý các lớp học của bạn
          </p>
        </div>
        
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