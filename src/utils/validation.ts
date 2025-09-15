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
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(formData.phone_number.trim())) {
      errors.push({
        field: "Số điện thoại",
        message: "Số điện thoại không hợp lệ",
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
