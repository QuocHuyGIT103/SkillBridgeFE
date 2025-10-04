/**
 * Utility functions for tutor-related operations
 */

/**
 * Calculate age from date of birth
 * @param dateOfBirth - Date of birth string or Date object
 * @returns Age in years
 */
export const calculateAge = (dateOfBirth: string | Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Format price to Vietnamese currency
 * @param amount - Price amount in VND
 * @returns Formatted price string
 */
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Get teaching mode display text
 * @param mode - Teaching mode enum value
 * @returns Human-readable teaching mode text
 */
export const getTeachingModeText = (mode: string): string => {
  switch (mode) {
    case "ONLINE":
      return "Trực tuyến";
    case "OFFLINE":
      return "Tại nhà";
    case "BOTH":
      return "Cả hai hình thức";
    default:
      return "Linh hoạt";
  }
};

/**
 * Get teaching mode CSS classes for styling
 * @param mode - Teaching mode enum value
 * @returns CSS class string for the mode
 */
export const getTeachingModeColor = (mode: string): string => {
  switch (mode) {
    case "ONLINE":
      return "bg-green-100 text-green-800";
    case "OFFLINE":
      return "bg-blue-100 text-blue-800";
    case "BOTH":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Get student level display text
 * @param level - Student level enum value
 * @returns Human-readable student level text
 */
export const getStudentLevelText = (level: string): string => {
  switch (level) {
    case "TIEU_HOC":
      return "Tiểu học";
    case "TRUNG_HOC_CO_SO":
      return "Trung học cơ sở";
    case "TRUNG_HOC_PHO_THONG":
      return "Trung học phổ thông";
    case "DAI_HOC":
      return "Đại học";
    case "NGUOI_DI_LAM":
      return "Người đi làm";
    case "KHAC":
      return "Khác";
    default:
      return level;
  }
};

/**
 * Get location text based on teaching mode and structured address
 * @param teachingMode - Teaching mode
 * @param structuredAddress - Structured address object
 * @returns Location display text
 */
export const getLocationText = (
  teachingMode: string,
  structuredAddress?: {
    province_name?: string;
    district_name?: string;
    ward_name?: string;
  }
): string => {
  if (teachingMode === "ONLINE") return "Trực tuyến";

  if (structuredAddress?.province_name) {
    if (structuredAddress.district_name) {
      return `${structuredAddress.district_name}, ${structuredAddress.province_name}`;
    }
    return structuredAddress.province_name;
  }

  return "Linh hoạt";
};

/**
 * Get short location text (just province)
 * @param structuredAddress - Structured address object
 * @returns Short location text
 */
export const getShortLocationText = (structuredAddress?: {
  province_name?: string;
  district_name?: string;
  ward_name?: string;
}): string => {
  if (structuredAddress?.province_name) {
    return structuredAddress.province_name;
  }
  return "Không xác định";
};

/**
 * Format full address display
 * @param structuredAddress - Structured address object
 * @param includeDetails - Whether to include ward and detail address
 * @returns Full address string
 */
export const formatAddressDisplay = (
  structuredAddress?: {
    province_name?: string;
    district_name?: string;
    ward_name?: string;
    detail_address?: string;
  },
  includeDetails: boolean = false
): string => {
  if (!structuredAddress) return "Không xác định";

  const parts: string[] = [];

  if (includeDetails && structuredAddress.detail_address) {
    parts.push(structuredAddress.detail_address);
  }

  if (includeDetails && structuredAddress.ward_name) {
    parts.push(structuredAddress.ward_name);
  }

  if (structuredAddress.district_name) {
    parts.push(structuredAddress.district_name);
  }

  if (structuredAddress.province_name) {
    parts.push(structuredAddress.province_name);
  }

  return parts.length > 0 ? parts.join(", ") : "Không xác định";
};

/**
 * Get day name from day of week number
 * @param dayOfWeek - Day of week (0-6, 0 = Sunday)
 * @returns Day name in Vietnamese
 */
export const getDayName = (dayOfWeek: number): string => {
  const days = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];
  return days[dayOfWeek] || "Không xác định";
};

/**
 * Format time range for display
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @returns Formatted time range string
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${startTime} - ${endTime}`;
};

/**
 * Get post status display text
 * @param status - Post status
 * @returns Human-readable status text
 */
export const getPostStatusText = (status: string): string => {
  switch (status) {
    case "ACTIVE":
      return "Đang hoạt động";
    case "PENDING":
      return "Chờ duyệt";
    case "INACTIVE":
      return "Tạm dừng";
    default:
      return status;
  }
};

/**
 * Get post status CSS classes for styling
 * @param status - Post status
 * @returns CSS class string for the status
 */
export const getPostStatusColor = (status: string): string => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "INACTIVE":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Calculate price per hour from price per session and duration
 * @param pricePerSession - Price per session in VND
 * @param sessionDuration - Session duration in minutes
 * @returns Price per hour in VND
 */
export const calculatePricePerHour = (
  pricePerSession: number,
  sessionDuration: number
): number => {
  return Math.round((pricePerSession * 60) / sessionDuration);
};

/**
 * Format price per hour
 * @param pricePerSession - Price per session in VND
 * @param sessionDuration - Session duration in minutes
 * @returns Formatted price per hour string
 */
export const formatPricePerHour = (
  pricePerSession: number,
  sessionDuration: number
): string => {
  const pricePerHour = calculatePricePerHour(pricePerSession, sessionDuration);
  return `${formatPrice(pricePerHour)}/giờ`;
};

/**
 * Generate initials from full name
 * @param fullName - Full name string
 * @returns Initials string
 */
export const generateInitials = (fullName: string): string => {
  if (!fullName) return "U";

  const words = fullName.trim().split(" ");
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Format relative time (e.g., "2 ngày trước")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Hôm nay";
  } else if (diffInDays === 1) {
    return "Hôm qua";
  } else if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} tuần trước`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} tháng trước`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} năm trước`;
  }
};

/**
 * Validate if a string is a valid UUID
 * @param uuid - String to validate
 * @returns True if valid UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Debounce function to limit function calls
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
