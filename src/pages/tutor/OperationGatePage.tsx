import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import TutorProfileStatusCard from "../../components/tutor/TutorProfileStatusCard";
import type { TutorProfileStatusResponse } from "../../services/tutorProfile.service";
import type { TutorProfileVerification } from "../../types/tutor.types";

interface OperationGatePageProps {
  statusData: TutorProfileStatusResponse;
  profileData?: TutorProfileVerification | null;
}

const OperationGatePage: React.FC<OperationGatePageProps> = ({ statusData, profileData }) => {
  const isVerified = statusData.profileStatus === "VERIFIED" && statusData.canOperate;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {!isVerified && (
          <>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <TutorProfileStatusCard statusData={statusData} profileData={profileData} showActions={true} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Chức năng tạm thời bị hạn chế</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Để sử dụng các chức năng quản lý bài đăng, bạn cần hoàn thiện và xác thực hồ sơ gia sư.
                Sau khi hồ sơ được xác thực, bạn sẽ có thể tạo, chỉnh sửa và quản lý các bài đăng của mình.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  to="/tutor/profile/personal"
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Đi đến hồ sơ gia sư
                </Link>
                <Link
                  to="/tutor/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Về trang tổng quan
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default OperationGatePage;
