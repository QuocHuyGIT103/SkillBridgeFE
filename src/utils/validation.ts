import toast from "react-hot-toast";

interface ValidationError {
  field: string;
  message: string;
}

export const showValidationErrors = (errors: ValidationError[]) => {
  errors.forEach((error) => {
    toast.error(`${error.field}: ${error.message}`, {
      position: "top-right",
      duration: 3000,
    });
  });
};

export const validateRegistrationForm = (formData: {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone_number?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Full name validation
  if (!formData.full_name.trim()) {
    errors.push({ field: "Họ và tên", message: "Không được để trống" });
  } else if (formData.full_name.trim().length < 2) {
    errors.push({ field: "Họ và tên", message: "Phải có ít nhất 2 ký tự" });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email.trim()) {
    errors.push({ field: "Email", message: "Không được để trống" });
  } else if (!emailRegex.test(formData.email)) {
    errors.push({ field: "Email", message: "Email không hợp lệ" });
  }

  // Password validation
  if (!formData.password) {
    errors.push({ field: "Mật khẩu", message: "Không được để trống" });
  } else if (formData.password.length < 6) {
    errors.push({ field: "Mật khẩu", message: "Phải có ít nhất 6 ký tự" });
  }

  // Confirm password validation
  if (formData.password !== formData.confirmPassword) {
    errors.push({ field: "Xác nhận mật khẩu", message: "Mật khẩu không khớp" });
  }

  // Phone number validation (optional)
  if (formData.phone_number && formData.phone_number.trim()) {
    const cleanPhone = formData.phone_number.replace(/[\s\-\(\)]/g, "");
    const backendPattern = /^(\+84|0)[3|5|7|8|9][0-9]{8}$/;

    if (!backendPattern.test(cleanPhone)) {
      errors.push({
        field: "Số điện thoại",
        message: "Phải bắt đầu bằng 03, 05, 07, 08, hoặc 09",
      });
    }
  }

  return errors;
};

export const validateResetPasswordForm = (formData: {
  otp_code: string;
  new_password: string;
  confirmPassword: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  // OTP validation
  if (!formData.otp_code.trim()) {
    errors.push({ field: "Mã OTP", message: "Không được để trống" });
  } else if (formData.otp_code.length !== 6) {
    errors.push({ field: "Mã OTP", message: "Phải có đúng 6 chữ số" });
  } else if (!/^\d{6}$/.test(formData.otp_code)) {
    errors.push({ field: "Mã OTP", message: "Chỉ được chứa số" });
  }

  // New password validation
  if (!formData.new_password) {
    errors.push({ field: "Mật khẩu mới", message: "Không được để trống" });
  } else if (formData.new_password.length < 6) {
    errors.push({ field: "Mật khẩu mới", message: "Phải có ít nhất 6 ký tự" });
  }

  // Confirm password validation
  if (formData.new_password !== formData.confirmPassword) {
    errors.push({ field: "Xác nhận mật khẩu", message: "Mật khẩu không khớp" });
  }

  return errors;
};

export const validateEmailForm = (email: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    errors.push({ field: "Email", message: "Không được để trống" });
  } else if (!emailRegex.test(email)) {
    errors.push({ field: "Email", message: "Email không hợp lệ" });
  }

  return errors;
};

/**
 * Validate UUID v4 format
 */
export const validateUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate ID parameter (UUID v4)
 */
export const validateId = (
  id: string,
  fieldName: string = "ID"
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!id.trim()) {
    errors.push({ field: fieldName, message: "Không được để trống" });
  } else if (!validateUUID(id)) {
    errors.push({
      field: fieldName,
      message: "Định dạng ID không hợp lệ (phải là UUID v4)",
    });
  }

  return errors;
};
