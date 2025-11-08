import React, { useEffect } from "react";
import { useTutorProfileStore } from "../../store/tutorProfile.store";
import OperationGatePage from "../../pages/tutor/OperationGatePage.tsx";

interface RequireTutorOperateProps {
  children: React.ReactNode;
}

const RequireTutorOperate: React.FC<RequireTutorOperateProps> = ({ children }) => {
  const { profileStatusData, isCheckingStatus, checkOperationStatus, profileData } = useTutorProfileStore();

  useEffect(() => {
    if (!profileStatusData && !isCheckingStatus) {
      checkOperationStatus();
    }
  }, [profileStatusData, isCheckingStatus, checkOperationStatus]);

  if (isCheckingStatus && !profileStatusData) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Đang kiểm tra điều kiện sử dụng chức năng...</p>
          </div>
        </div>
      </div>
    );
  }

  // If not verified or not allowed to operate, show gate page
  if (profileStatusData && (profileStatusData.profileStatus !== "VERIFIED" || !profileStatusData.canOperate)) {
    return <OperationGatePage statusData={profileStatusData} profileData={profileData?.profile || null} />;
  }

  return <>{children}</>;
};

export default RequireTutorOperate;
