import React from 'react';
import TutorRequestsList from '../../components/tutor/TutorRequestsList';

const TutorContactRequestsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Yêu cầu học tập
        </h1>
        <p className="text-gray-600">
          Quản lý các yêu cầu học tập từ học viên
        </p>
      </div>
      
      <TutorRequestsList />
    </div>
  );
};

export default TutorContactRequestsPage;