import { useMemo } from "react";
import useVerificationStore from "../store/verification.store";
import { VerificationStatus } from "../types/verification.types";

export const useVerification = () => {
  const {
    currentVerificationRequest,
    isCreatingRequest,
    isLoading,
    createVerificationRequest,
    fetchVerificationStatus,
    clearCurrentRequest,
  } = useVerificationStore();

  // Computed values
  const verificationStatus = useMemo(() => {
    if (!currentVerificationRequest) return null;
    return currentVerificationRequest.status;
  }, [currentVerificationRequest]);

  const isVerified = useMemo(() => {
    return verificationStatus === VerificationStatus.APPROVED;
  }, [verificationStatus]);

  const isPending = useMemo(() => {
    return verificationStatus === VerificationStatus.PENDING;
  }, [verificationStatus]);

  const isRejected = useMemo(() => {
    return verificationStatus === VerificationStatus.REJECTED;
  }, [verificationStatus]);

  const canRequestVerification = useMemo(() => {
    // Can request if no current request or if the previous one was rejected
    return !currentVerificationRequest || isRejected;
  }, [currentVerificationRequest, isRejected]);

  const adminFeedback = useMemo(() => {
    return currentVerificationRequest?.admin_feedback || null;
  }, [currentVerificationRequest]);

  const verificationDate = useMemo(() => {
    if (!currentVerificationRequest?.reviewed_at) return null;
    return new Date(currentVerificationRequest.reviewed_at);
  }, [currentVerificationRequest]);

  const requestDate = useMemo(() => {
    if (!currentVerificationRequest?.created_at) return null;
    return new Date(currentVerificationRequest.created_at);
  }, [currentVerificationRequest]);

  // Actions
  const requestVerification = async () => {
    try {
      await createVerificationRequest();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const refreshStatus = async () => {
    try {
      await fetchVerificationStatus();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    // Data
    currentVerificationRequest,
    verificationStatus,
    adminFeedback,
    verificationDate,
    requestDate,

    // States
    isVerified,
    isPending,
    isRejected,
    canRequestVerification,
    isCreatingRequest,
    isLoading,

    // Actions
    requestVerification,
    refreshStatus,
    clearCurrentRequest,
  };
};

export default useVerification;
