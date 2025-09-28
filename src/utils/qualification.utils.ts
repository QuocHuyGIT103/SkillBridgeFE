import type {
  VerificationRequest,
  Education,
  Certificate,
  Achievement,
  RequestStatus,
} from "../types/qualification.types";

/**
 * Kiểm tra xem một item có đang trong verification request pending không
 */
export const hasPendingVerificationRequest = (
  itemId: string,
  itemType: "education" | "certificate" | "achievement",
  verificationRequests: VerificationRequest[]
): boolean => {
  return verificationRequests.some((request) => {
    if (request.status !== "PENDING") return false;

    return request.details?.some(
      (detail) =>
        detail.targetId === itemId &&
        detail.targetType.toLowerCase() === itemType &&
        detail.status === "PENDING"
    );
  });
};

/**
 * Kiểm tra xem có thể edit một item không
 */
export const canEditItem = (
  item: Education | Certificate | Achievement,
  itemType: "education" | "certificate" | "achievement",
  verificationRequests: VerificationRequest[]
): boolean => {
  // Không thể edit nếu đang pending verification
  if (hasPendingVerificationRequest(item.id, itemType, verificationRequests)) {
    return false;
  }

  // Không thể edit nếu status là PENDING
  if (item.status === "PENDING") {
    return false;
  }

  return true;
};

/**
 * Kiểm tra xem có thể xóa certificate không (phải có ít nhất 1 certificate đã verified)
 */
export const canDeleteCertificate = (
  certificateId: string,
  certificates: Certificate[]
): { canDelete: boolean; reason?: string } => {
  const remainingVerified = certificates.filter(
    (cert) => cert.status === "VERIFIED" && cert.id !== certificateId
  );

  if (remainingVerified.length === 0) {
    return {
      canDelete: false,
      reason:
        "Bạn phải có ít nhất 1 chứng chỉ đã xác thực để duy trì tư cách gia sư",
    };
  }

  return { canDelete: true };
};

/**
 * Lấy thông tin hiển thị cho một item (ưu tiên verifiedData nếu có)
 */
export const getDisplayData = <T extends Education | Certificate | Achievement>(
  item: T
): T => {
  // Nếu có verifiedData, sử dụng nó, ngược lại dùng data hiện tại
  if ("verifiedData" in item && item.verifiedData) {
    return {
      ...item,
      ...item.verifiedData,
      // Giữ lại các field không có trong verifiedData
      id: item.id,
      tutorId: item.tutorId,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    } as T;
  }

  return item;
};

/**
 * Kiểm tra xem item có cần verification lại không khi edit
 */
export const needsReVerification = (
  item: Education | Certificate | Achievement
): boolean => {
  return item.status === "VERIFIED";
};

/**
 * Lấy message cảnh báo khi edit verified item
 */
export const getEditWarningMessage = (
  itemType: "education" | "certificate" | "achievement",
  itemName: string
): string => {
  const typeNames = {
    education: "thông tin học vấn",
    certificate: "chứng chỉ",
    achievement: "thành tích",
  };

  return `Việc chỉnh sửa ${typeNames[itemType]} "${itemName}" sẽ yêu cầu xác thực lại từ Admin. Thông tin hiện tại sẽ được lưu làm bản sao lưu. Bạn có chắc chắn muốn tiếp tục?`;
};

/**
 * Lấy message cảnh báo khi xóa certificate
 */
export const getDeleteCertificateWarningMessage = (
  certificateName: string,
  reason?: string
): string => {
  if (reason) {
    return `Không thể xóa chứng chỉ "${certificateName}". ${reason}`;
  }

  return `Bạn có chắc chắn muốn xóa chứng chỉ "${certificateName}"? Hành động này không thể hoàn tác.`;
};

/**
 * Kiểm tra xem có thể submit verification request không
 */
export const canSubmitVerificationRequest = (
  qualifications: {
    education?: Education;
    certificates: Certificate[];
    achievements: Achievement[];
  } | null
): { canSubmit: boolean; reason?: string } => {
  if (!qualifications) {
    return {
      canSubmit: false,
      reason: "Chưa có thông tin trình độ",
    };
  }

  // Phải có education
  if (!qualifications.education) {
    return {
      canSubmit: false,
      reason: "Bạn cần thêm thông tin học vấn",
    };
  }

  // Phải có ít nhất 1 certificate
  if (qualifications.certificates.length === 0) {
    return {
      canSubmit: false,
      reason: "Bạn cần thêm ít nhất 1 chứng chỉ",
    };
  }

  return { canSubmit: true };
};

/**
 * Lấy danh sách items cần verification
 */
export const getItemsNeedingVerification = (
  qualifications: {
    education?: Education;
    certificates: Certificate[];
    achievements: Achievement[];
  } | null
): {
  education?: Education;
  certificates: Certificate[];
  achievements: Achievement[];
} => {
  if (!qualifications) {
    return { certificates: [], achievements: [] };
  }

  return {
    education:
      qualifications.education?.status !== "VERIFIED"
        ? qualifications.education
        : undefined,
    certificates: qualifications.certificates.filter(
      (cert) => cert.status !== "VERIFIED"
    ),
    achievements: qualifications.achievements.filter(
      (achievement) => achievement.status !== "VERIFIED"
    ),
  };
};

/**
 * Lấy danh sách items bị từ chối
 */
export const getRejectedItems = (
  qualifications: {
    education?: Education;
    certificates: Certificate[];
    achievements: Achievement[];
  } | null
): {
  education?: Education;
  certificates: Certificate[];
  achievements: Achievement[];
} => {
  if (!qualifications) {
    return { certificates: [], achievements: [] };
  }

  return {
    education:
      qualifications.education?.status === "REJECTED"
        ? qualifications.education
        : undefined,
    certificates: qualifications.certificates.filter(
      (cert) => cert.status === "REJECTED"
    ),
    achievements: qualifications.achievements.filter(
      (achievement) => achievement.status === "REJECTED"
    ),
  };
};

/**
 * Lấy danh sách items đã được sửa sau khi bị từ chối
 */
export const getModifiedAfterRejectionItems = (
  qualifications: {
    education?: Education;
    certificates: Certificate[];
    achievements: Achievement[];
  } | null
): {
  education?: Education;
  certificates: Certificate[];
  achievements: Achievement[];
} => {
  if (!qualifications) {
    return { certificates: [], achievements: [] };
  }

  return {
    education:
      qualifications.education?.status === "MODIFIED_AFTER_REJECTION"
        ? qualifications.education
        : undefined,
    certificates: qualifications.certificates.filter(
      (cert) => cert.status === "MODIFIED_AFTER_REJECTION"
    ),
    achievements: qualifications.achievements.filter(
      (achievement) => achievement.status === "MODIFIED_AFTER_REJECTION"
    ),
  };
};

/**
 * Kiểm tra xem có items cần gửi lại yêu cầu xác thực không
 */
export const hasItemsNeedingReVerification = (
  qualifications: {
    education?: Education;
    certificates: Certificate[];
    achievements: Achievement[];
  } | null
): boolean => {
  if (!qualifications) {
    return false;
  }

  const rejectedItems = getRejectedItems(qualifications);
  const modifiedItems = getModifiedAfterRejectionItems(qualifications);

  return !!(
    rejectedItems.education ||
    rejectedItems.certificates.length > 0 ||
    rejectedItems.achievements.length > 0 ||
    modifiedItems.education ||
    modifiedItems.certificates.length > 0 ||
    modifiedItems.achievements.length > 0
  );
};

/**
 * Lấy tổng số items cần gửi lại yêu cầu xác thực
 */
export const getReVerificationCount = (
  qualifications: {
    education?: Education;
    certificates: Certificate[];
    achievements: Achievement[];
  } | null
): number => {
  if (!qualifications) {
    return 0;
  }

  const rejectedItems = getRejectedItems(qualifications);
  const modifiedItems = getModifiedAfterRejectionItems(qualifications);

  let count = 0;
  if (rejectedItems.education) count++;
  if (modifiedItems.education) count++;
  count += rejectedItems.certificates.length;
  count += modifiedItems.certificates.length;
  count += rejectedItems.achievements.length;
  count += modifiedItems.achievements.length;

  return count;
};

/**
 * Tạo message gợi ý sửa tất cả rejected items
 */
export const getReVerificationSuggestionMessage = (
  qualifications: {
    education?: Education;
    certificates: Certificate[];
    achievements: Achievement[];
  } | null
): string | null => {
  if (!qualifications) {
    return null;
  }

  const rejectedItems = getRejectedItems(qualifications);
  const rejectedCount = getReVerificationCount(qualifications);

  if (rejectedCount === 0) {
    return null;
  }

  const itemNames = [];
  if (rejectedItems.education) {
    itemNames.push("thông tin học vấn");
  }
  if (rejectedItems.certificates.length > 0) {
    itemNames.push(`${rejectedItems.certificates.length} chứng chỉ`);
  }
  if (rejectedItems.achievements.length > 0) {
    itemNames.push(`${rejectedItems.achievements.length} thành tích`);
  }

  if (itemNames.length === 1) {
    return `Bạn có ${itemNames[0]} bị từ chối. Hãy sửa đổi để có thể gửi lại yêu cầu xác thực.`;
  } else {
    return `Bạn có ${itemNames.join(
      ", "
    )} bị từ chối. Hãy sửa đổi tất cả để có thể gửi lại yêu cầu xác thực.`;
  }
};
