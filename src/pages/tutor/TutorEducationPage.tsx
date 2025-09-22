import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import useEducationStore from "../../store/education.store";
import useCertificateStore from "../../store/certificate.store";
import useAchievementStore from "../../store/achievement.store";
import EducationSection from "../../components/tutor/EducationSection";
import CertificatesSection from "../../components/tutor/CertificatesSection";
import AchievementsSection from "../../components/tutor/AchievementsSection";

const TutorEducationPage: React.FC = () => {
  // Education Store
  const { educations, fetchEducations, fetchEducationLevels } =
    useEducationStore();

  // Certificate Store
  const { certificates, fetchCertificates } = useCertificateStore();

  // Achievement Store
  const { fetchAchievements } = useAchievementStore();

  // Get current education (assuming one education record per tutor)
  const currentEducation = educations.length > 0 ? educations[0] : null;

  // Load data on component mount
  useEffect(() => {
    fetchEducations();
    fetchEducationLevels();
    fetchCertificates();
    fetchAchievements();
  }, []); // Empty dependency array to prevent infinite calls

  // Check if verification button should be shown
  const canRequestVerification = () => {
    return currentEducation && certificates.length > 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Học vấn & Chứng chỉ
            </h1>
            <p className="text-secondary mt-2">
              Quản lý thông tin học vấn, chứng chỉ và thành tích của bạn
            </p>
          </div>
          {canRequestVerification() && (
            <button className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <ShieldCheckIcon className="w-5 h-5" />
              <span>Yêu cầu xác thực</span>
            </button>
          )}
        </motion.div>

        {/* Education Section */}
        <EducationSection />

        {/* Certificates Section */}
        <CertificatesSection />

        {/* Achievements Section */}
        <AchievementsSection />

        {/* Verification Notice */}
        {!canRequestVerification() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-6"
          >
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  Chưa đủ điều kiện xác thực
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  Để yêu cầu xác thực, bạn cần hoàn thành ít nhất:
                </p>
                <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                  <li>Một trình độ học vấn</li>
                  <li>Ít nhất một chứng chỉ</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TutorEducationPage;
