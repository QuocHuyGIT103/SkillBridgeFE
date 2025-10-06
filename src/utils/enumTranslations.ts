// Utility functions for translating enums to Vietnamese

/**
 * Student level translations
 */
export const StudentLevelTranslations: Record<string, string> = {
  TIEU_HOC: "Tiểu học",
  TRUNG_HOC_CO_SO: "Trung học cơ sở",
  TRUNG_HOC_PHO_THONG: "Trung học phổ thông",
  DAI_HOC: "Đại học",
  NGUOI_DI_LAM: "Người đi làm",
  KHAC: "Khác",
};

/**
 * Education level translations
 */
export const EducationLevelTranslations: Record<string, string> = {
  HIGH_SCHOOL: "Trung học phổ thông",
  BACHELOR: "Cử nhân",
  UNIVERSITY: "Đại học",
  ENGINEER: "Kỹ sư",
  DOCTOR: "Tiến sĩ",
  MASTER: "Thạc sĩ",
  OTHER: "Khác",
};

/**
 * Teaching mode translations
 */
export const TeachingModeTranslations: Record<string, string> = {
  ONLINE: "Trực tuyến",
  OFFLINE: "Trực tiếp",
  BOTH: "Cả hai hình thức",
};

/**
 * Verification status translations
 */
export const VerificationStatusTranslations: Record<string, string> = {
  DRAFT: "Bản nháp",
  PENDING: "Chờ xác thực",
  VERIFIED: "Đã xác thực",
  REJECTED: "Bị từ chối",
  MODIFIED_PENDING: "Chờ xác thực (đã sửa)",
  MODIFIED_AFTER_REJECTION: "Đã sửa sau khi từ chối",
};

/**
 * Translate student level to Vietnamese
 */
export const translateStudentLevel = (level: string): string => {
  return StudentLevelTranslations[level] || level;
};

/**
 * Translate education level to Vietnamese
 */
export const translateEducationLevel = (level: string): string => {
  return EducationLevelTranslations[level] || level;
};

/**
 * Translate teaching mode to Vietnamese
 */
export const translateTeachingMode = (mode: string): string => {
  return TeachingModeTranslations[mode] || mode;
};

/**
 * Translate verification status to Vietnamese
 */
export const translateVerificationStatus = (status: string): string => {
  return VerificationStatusTranslations[status] || status;
};
