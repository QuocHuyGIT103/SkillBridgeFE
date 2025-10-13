import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useStudentProfileStore } from '../../../store/studentProfile.store';
import StudentPersonalInfoSection from '../../../components/student/profile/StudentPersonalInfoSection';

const StudentPersonalProfilePage: React.FC = () => {
  const { 
    profileData, 
    isLoading, 
    error, 
    fetchProfile, 
    clearError 
  } = useStudentProfileStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
        <p className="text-gray-600 mt-2">
          Cập nhật thông tin cá nhân của bạn
        </p>
      </div>

      <StudentPersonalInfoSection user={profileData?.user || null} />
    </div>
  );
};

export default StudentPersonalProfilePage;