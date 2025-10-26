import React from 'react';
import TutorRequestsList from '../../components/tutor/TutorRequestsList';

const TutorContactRequestsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yêu cầu học tập</h1>
            <p className="mt-1 text-gray-600">Theo dõi và xử lý yêu cầu từ học viên</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-gray-200">Danh sách yêu cầu</span>
          </div>
        </div>
      </div>
      
      <TutorRequestsList />
    </div>
  );
};

export default TutorContactRequestsPage;