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
  if (hasPendingVerificationRequest(item._id, itemType, verificationRequests)) {
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
    (cert) => cert.status === "VERIFIED" && cert._id !== certificateId
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
      _id: item._id,
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
