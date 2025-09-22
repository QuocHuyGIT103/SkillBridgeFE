import React, { useEffect } from "react";
import useEducationStore from "../../store/education.store";
import useCertificateStore from "../../store/certificate.store";
import useAchievementStore from "../../store/achievement.store";
import useVerificationStore from "../../store/verification.store";
import { VerificationStatus } from "../../types/verification.types";
import EducationSection from "../../components/tutor/EducationSection";
import CertificatesSection from "../../components/tutor/CertificatesSection";
import AchievementsSection from "../../components/tutor/AchievementsSection";
import VerificationHistory from "../../components/tutor/VerificationHistory";
import TutorEducationHeader from "../../components/tutor/TutorEducationHeader";
import VerificationMessages from "../../components/tutor/VerificationMessages";
import VerificationNotice from "../../components/tutor/VerificationNotice";

const TutorEducationPage: React.FC = () => {
  // Education Store
  const { educations, fetchEducations, fetchEducationLevels } =
    useEducationStore();

  // Certificate Store
  const { certificates, fetchCertificates } = useCertificateStore();

  // Achievement Store
  const { fetchAchievements } = useAchievementStore();

  // Verification Store
  const {
    currentVerificationRequest,
    isCreatingRequest,
    createVerificationRequest,
    fetchVerificationStatus,
  } = useVerificationStore();

  // Get current education (assuming one education record per tutor)
  const currentEducation = educations.length > 0 ? educations[0] : null;

  // Load data on component mount
  useEffect(() => {
    fetchEducations();
    fetchEducationLevels();
    fetchCertificates();
    fetchAchievements();
    fetchVerificationStatus();
  }, []); // Empty dependency array to prevent infinite calls

  // Check if verification button should be shown
  const canRequestVerification = (): boolean => {
    return Boolean(
      currentEducation &&
        certificates.length > 0 &&
        (!currentVerificationRequest ||
          currentVerificationRequest.status === VerificationStatus.REJECTED)
    );
  };

  // Handle verification request
  const handleVerificationRequest = async () => {
    try {
      await createVerificationRequest();
    } catch (error) {
      console.error("Error creating verification request:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <TutorEducationHeader
          verificationRequest={currentVerificationRequest}
          canRequestVerification={canRequestVerification()}
          isCreatingRequest={isCreatingRequest}
          onVerificationRequest={handleVerificationRequest}
        />

        {/* Education Section */}
        <EducationSection />

        {/* Certificates Section */}
        <CertificatesSection />

        {/* Achievements Section */}
        <AchievementsSection />

        {/* Verification Messages */}
        <VerificationMessages
          verificationRequest={currentVerificationRequest}
        />

        {/* Verification History */}
        <VerificationHistory />

        {/* Verification Notice */}
        <VerificationNotice
          show={!canRequestVerification() && !currentVerificationRequest}
        />
      </div>
    </div>
  );
};

export default TutorEducationPage;
