// Utility functions for formatting contract data

const WEEKDAYS = [
  { value: 0, label: "Chủ nhật" },
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
];

/**
 * Convert array of day numbers to Vietnamese text
 * @param dayOfWeek - Array of day numbers (0-6, where 0 is Sunday)
 * @returns Formatted string like "Thứ 2, Thứ 4, Thứ 6"
 */
export const getDaysOfWeekText = (dayOfWeek: number[]): string => {
  if (!dayOfWeek || dayOfWeek.length === 0) return "";

  return dayOfWeek
    .sort((a, b) => a - b)
    .map((day) => WEEKDAYS.find((w) => w.value === day)?.label)
    .filter(Boolean)
    .join(", ");
};

/**
 * Format number as Vietnamese currency
 * @param amount - Amount in VND
 * @returns Formatted string like "150.000 ₫"
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Format date string to Vietnamese locale
 * @param dateString - ISO date string or Date object
 * @param options - Optional formatting options
 * @returns Formatted date string like "14/11/2025"
 */
export const formatDate = (
  dateString: string | Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  return new Date(dateString).toLocaleDateString(
    "vi-VN",
    options || defaultOptions
  );
};

/**
 * Format date to long format
 * @param dateString - ISO date string or Date object
 * @returns Formatted string like "14 tháng 11, 2025"
 */
export const formatDateLong = (dateString: string | Date): string => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Calculate session duration in minutes from time strings
 * @param startTime - Start time in format "HH:mm"
 * @param endTime - End time in format "HH:mm"
 * @returns Duration in minutes
 */
export const calculateSessionDuration = (
  startTime: string,
  endTime: string
): number => {
  if (!startTime || !endTime) return 90; // Default 90 minutes

  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return endMinutes - startMinutes;
};

/**
 * Format duration in minutes to readable text
 * @param minutes - Duration in minutes
 * @returns Formatted string like "1 giờ 30 phút" or "90 phút"
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} phút`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours} giờ`;
  }

  return `${hours} giờ ${mins} phút`;
};

/**
 * Get platform display name
 * @param platform - Platform code
 * @returns Display name in Vietnamese
 */
export const getPlatformDisplayName = (platform: string): string => {
  const platforms: Record<string, string> = {
    ZOOM: "Zoom",
    GOOGLE_MEET: "Google Meet",
    MICROSOFT_TEAMS: "Microsoft Teams",
    OTHER: "Khác",
  };

  return platforms[platform] || platform;
};

/**
 * Get payment method display name
 * @param method - Payment method code
 * @returns Display name in Vietnamese
 */
export const getPaymentMethodDisplayName = (method: string): string => {
  const methods: Record<string, string> = {
    FULL_PAYMENT: "Thanh toán toàn bộ",
    INSTALLMENTS: "Thanh toán theo đợt",
  };

  return methods[method] || method;
};
