import React from 'react';
import StudentRequestsList from '../../components/student/StudentRequestsList';

const MyRequestsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Yêu cầu học tập của tôi
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý các yêu cầu học tập bạn đã gửi đến gia sư
          </p>
        </div>
        
        <StudentRequestsList />
      </div>
    </div>
  );
};

export default MyRequestsPage;