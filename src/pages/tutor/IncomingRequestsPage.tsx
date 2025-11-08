import React from 'react';
import TutorRequestsList from '../../components/tutor/TutorRequestsList';

const IncomingRequestsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Yêu cầu học tập
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý các yêu cầu học tập từ học viên
          </p>
        </div>
        
        <TutorRequestsList />
      </div>
    </div>
  );
};

export default IncomingRequestsPage;