import React, { useEffect, useState } from "react";
import {
  AcademicCapIcon,
  DocumentTextIcon,
  TrophyIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { useQualificationStore } from "../../store/qualification.store";
import { useVerificationStore } from "../../store/verification.store";
import type {
  CreateEducationRequest,
  CreateCertificateRequest,
  CreateAchievementRequest,
  CreateVerificationRequest,
} from "../../types/qualification.types";

// Components
import EducationForm from "../../components/qualification/EducationForm";
import CertificateForm from "../../components/qualification/CertificateForm";
import AchievementForm from "../../components/qualification/AchievementForm";
import VerificationRequestModal from "../../components/qualification/VerificationRequestModal";
import WarningModal from "../../components/common/WarningModal";
import ReVerificationNotification from "../../components/common/ReVerificationNotification";
import InfoTooltip from "../../components/common/InfoTooltip";
import QualificationStatusCard from "../../components/qualification/QualificationStatusCard";
import OverviewTab from "../../components/qualification/OverviewTab";
import EducationTab from "../../components/qualification/EducationTab";
import CertificatesTab from "../../components/qualification/CertificatesTab";
import AchievementsTab from "../../components/qualification/AchievementsTab";
import {
  canEditItem,
  needsReVerification,
  getEditWarningMessage,
  getDeleteCertificateWarningMessage,
  getDisplayData,
} from "../../utils/qualification.utils";

const TutorEducationPage: React.FC = () => {
  // Stores
  const {
    qualifications,
    qualificationInfo,
    isCreatingEducation,
    isUpdatingEducation,
    isCreatingCertificate,
    isUpdatingCertificate,
    isDeletingCertificate,
    fetchQualifications,
    createEducation,
    createCertificate,
    createAchievement,
    updateEducation,
    updateCertificate,
    updateAchievement,
    deleteCertificate,
    deleteAchievement,
    canSubmitVerification,
    getRejectedItems,
    hasItemsNeedingReVerification,
    getReVerificationCount,
    getReVerificationSuggestionMessage,
  } = useQualificationStore();

  const { createVerificationRequest, isCreatingRequest, tutorRequests } =
    useVerificationStore();

  // Local state
  const [activeTab, setActiveTab] = useState<
    "overview" | "education" | "certificates" | "achievements"
  >("overview");
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showReVerificationSuggestion, setShowReVerificationSuggestion] =
    useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "info";
    title: string;
    message: string;
  } | null>(null);

  // Warning modal state
  const [warningModal, setWarningModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: "warning" | "danger" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Load data on mount
  useEffect(() => {
    fetchQualifications();
  }, [fetchQualifications]);

  // Debug: Log qualifications state changes
  useEffect(() => {
    console.log("Qualifications state changed:", qualifications);
  }, [qualifications]);

  // Check if there are rejected items that need re-verification
  const rejectedItems = getRejectedItems();
  const hasReVerificationItems = hasItemsNeedingReVerification();
  const reVerificationCount = getReVerificationCount();
  const suggestionMessage = getReVerificationSuggestionMessage();

  // Show suggestion when there are rejected items
  useEffect(() => {
    if (
      rejectedItems.education ||
      rejectedItems.certificates.length > 0 ||
      rejectedItems.achievements.length > 0
    ) {
      setShowReVerificationSuggestion(true);
    } else {
      setShowReVerificationSuggestion(false);
    }
  }, [rejectedItems]);

  // Handlers
  const handleCreateEducation = async (data: CreateEducationRequest) => {
    try {
      console.log("Creating education with data:", data);
      const wasRejected = editingItem?.status === "REJECTED";

      if (editingItem) {
        await updateEducation(data);
      } else {
        await createEducation(data);
      }
      console.log("Education created/updated successfully");
      setShowEducationForm(false);
      setEditingItem(null);

      // Show notification if rejected item was updated
      if (wasRejected) {
        setNotification({
          type: "success",
          title: "Cập nhật thành công",
          message:
            "Thông tin học vấn đã được cập nhật. Bạn có thể gửi lại yêu cầu xác thực.",
        });
        // Auto-hide notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      }

      // Force refresh to get updated status
      setTimeout(() => {
        fetchQualifications();
      }, 500);
    } catch (error) {
      console.error("Error creating/updating education:", error);
    }
  };

  const handleCreateCertificate = async (data: CreateCertificateRequest) => {
    try {
      const wasRejected = editingItem?.status === "REJECTED";

      if (editingItem) {
        await updateCertificate(editingItem.id, data);
      } else {
        await createCertificate(data);
      }
      setShowCertificateForm(false);
      setEditingItem(null);

      // Show notification if rejected item was updated
      if (wasRejected) {
        setNotification({
          type: "success",
          title: "Cập nhật thành công",
          message:
            "Chứng chỉ đã được cập nhật. Bạn có thể gửi lại yêu cầu xác thực.",
        });
        // Auto-hide notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      }

      // Force refresh to get updated status
      setTimeout(() => {
        fetchQualifications();
      }, 500);
    } catch (error) {
      console.error("Error creating/updating certificate:", error);
    }
  };

  const handleCreateAchievement = async (data: CreateAchievementRequest) => {
    try {
      const wasRejected = editingItem?.status === "REJECTED";

      if (editingItem) {
        await updateAchievement(editingItem.id, data);
      } else {
        await createAchievement(data);
      }
      setShowAchievementForm(false);
      setEditingItem(null);

      // Show notification if rejected item was updated
      if (wasRejected) {
        setNotification({
          type: "success",
          title: "Cập nhật thành công",
          message:
            "Thành tích đã được cập nhật. Bạn có thể gửi lại yêu cầu xác thực.",
        });
        // Auto-hide notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      }

      // Force refresh to get updated status
      setTimeout(() => {
        fetchQualifications();
      }, 500);
    } catch (error) {
      console.error("Error creating/updating achievement:", error);
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    const certificate = qualifications?.certificates.find((c) => c.id === id);
    if (!certificate) return;

    const displayData = getDisplayData(certificate);
    const message = getDeleteCertificateWarningMessage(displayData.name);

    setWarningModal({
      isOpen: true,
      title: "Xác nhận xóa chứng chỉ",
      message,
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteCertificate(id);
          setWarningModal((prev) => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error("Error deleting certificate:", error);
          setWarningModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleDeleteAchievement = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thành tích này?")) {
      try {
        await deleteAchievement(id);
      } catch (error) {
        console.error("Error deleting achievement:", error);
      }
    }
  };

  const handleSubmitVerification = async (data: CreateVerificationRequest) => {
    try {
      await createVerificationRequest(data);
      setShowVerificationModal(false);
    } catch (error) {
      console.error("Error submitting verification request:", error);
    }
  };

  // Enhanced edit handlers with warnings
  const handleEditEducation = (education: any) => {
    if (!canEditItem(education, "education", tutorRequests)) {
      return; // Button will be disabled
    }

    if (needsReVerification(education)) {
      const message = getEditWarningMessage("education", education.school);
      setWarningModal({
        isOpen: true,
        title: "Cảnh báo chỉnh sửa",
        message,
        type: "warning",
        onConfirm: () => {
          setEditingItem(education);
          setShowEducationForm(true);
          setWarningModal((prev) => ({ ...prev, isOpen: false }));
        },
      });
    } else {
      setEditingItem(education);
      setShowEducationForm(true);
    }
  };

  const handleEditCertificate = (certificate: any) => {
    if (!canEditItem(certificate, "certificate", tutorRequests)) {
      return; // Button will be disabled
    }

    if (needsReVerification(certificate)) {
      const message = getEditWarningMessage("certificate", certificate.name);
      setWarningModal({
        isOpen: true,
        title: "Cảnh báo chỉnh sửa",
        message,
        type: "warning",
        onConfirm: () => {
          setEditingItem(certificate);
          setShowCertificateForm(true);
          setWarningModal((prev) => ({ ...prev, isOpen: false }));
        },
      });
    } else {
      setEditingItem(certificate);
      setShowCertificateForm(true);
    }
  };

  // Remove global loading - we'll use button-level loading instead

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Trình độ & Chứng chỉ
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý thông tin học vấn, chứng chỉ và thành tích của bạn
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Re-verification suggestion */}
            {showReVerificationSuggestion && (
              <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                <p className="font-medium">💡 Gợi ý</p>
                <p>{suggestionMessage}</p>
              </div>
            )}

            {/* Verification buttons */}
            {hasReVerificationItems && (
              <InfoTooltip content="Bạn có thông tin bị từ chối hoặc đã được sửa đổi. Gửi lại yêu cầu xác thực để admin xem xét lại.">
                <button
                  onClick={() => setShowVerificationModal(true)}
                  disabled={isCreatingRequest}
                  className="flex items-center space-x-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                  <span>
                    {reVerificationCount > 1
                      ? `Gửi lại ${reVerificationCount} yêu cầu xác thực`
                      : "Gửi lại yêu cầu xác thực"}
                  </span>
                </button>
              </InfoTooltip>
            )}

            {canSubmitVerification() && !hasReVerificationItems && (
              <button
                onClick={() => setShowVerificationModal(true)}
                disabled={isCreatingRequest}
                className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
                <span>Gửi yêu cầu xác thực</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Qualification Status */}
      {qualificationInfo && (
        <QualificationStatusCard
          qualificationInfo={qualificationInfo}
          qualifications={qualifications}
        />
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "Tổng quan", icon: AcademicCapIcon },
              { id: "education", label: "Học vấn", icon: DocumentTextIcon },
              {
                id: "certificates",
                label: "Chứng chỉ",
                icon: DocumentTextIcon,
              },
              { id: "achievements", label: "Thành tích", icon: TrophyIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <OverviewTab
              qualifications={qualifications}
              tutorRequests={tutorRequests}
              onEditEducation={handleEditEducation}
              onEditCertificate={handleEditCertificate}
              onAddEducation={() => {
                setEditingItem(null);
                setShowEducationForm(true);
              }}
              onAddCertificate={() => {
                setEditingItem(null);
                setShowCertificateForm(true);
              }}
              onViewAllCertificates={() => setActiveTab("certificates")}
              onViewAllAchievements={() => setActiveTab("achievements")}
              isCreatingCertificate={isCreatingCertificate}
            />
          )}

          {/* Education Tab */}
          {activeTab === "education" && (
            <EducationTab
              qualifications={qualifications}
              tutorRequests={tutorRequests}
              isCreatingEducation={isCreatingEducation}
              isUpdatingEducation={isUpdatingEducation}
              onEditEducation={handleEditEducation}
              onAddEducation={() => {
                setEditingItem(null);
                setShowEducationForm(true);
              }}
            />
          )}

          {/* Certificates Tab */}
          {activeTab === "certificates" && (
            <CertificatesTab
              qualifications={qualifications}
              tutorRequests={tutorRequests}
              isCreatingCertificate={isCreatingCertificate}
              isUpdatingCertificate={isUpdatingCertificate}
              isDeletingCertificate={isDeletingCertificate}
              onAddCertificate={() => {
                setEditingItem(null);
                setShowCertificateForm(true);
              }}
              onEditCertificate={handleEditCertificate}
              onDeleteCertificate={handleDeleteCertificate}
            />
          )}

          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <AchievementsTab
              qualifications={qualifications}
              tutorRequests={tutorRequests}
              onAddAchievement={() => {
                setEditingItem(null);
                setShowAchievementForm(true);
              }}
              onEditAchievement={(achievement) => {
                setEditingItem(achievement);
                setShowAchievementForm(true);
              }}
              onDeleteAchievement={handleDeleteAchievement}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showEducationForm && (
        <EducationForm
          isOpen={showEducationForm}
          onClose={() => {
            setShowEducationForm(false);
            setEditingItem(null);
          }}
          onSubmit={handleCreateEducation}
          initialData={editingItem}
        />
      )}

      {showCertificateForm && (
        <CertificateForm
          isOpen={showCertificateForm}
          onClose={() => {
            setShowCertificateForm(false);
            setEditingItem(null);
          }}
          onSubmit={handleCreateCertificate}
          initialData={editingItem}
        />
      )}

      {showAchievementForm && (
        <AchievementForm
          isOpen={showAchievementForm}
          onClose={() => {
            setShowAchievementForm(false);
            setEditingItem(null);
          }}
          onSubmit={handleCreateAchievement}
          initialData={editingItem}
        />
      )}

      {showVerificationModal && (
        <VerificationRequestModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          onSubmit={handleSubmitVerification}
          qualifications={qualifications}
          isLoading={isCreatingRequest}
        />
      )}

      <WarningModal
        isOpen={warningModal.isOpen}
        onClose={() => setWarningModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={warningModal.onConfirm}
        title={warningModal.title}
        message={warningModal.message}
        type={warningModal.type}
      />

      {/* Notification */}
      {notification && (
        <ReVerificationNotification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default TutorEducationPage;
