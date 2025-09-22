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
    const cleanPhone = formData.phone_number.replace(/[\s\-\(\)]/g, '');
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

// ✅ Thêm validation cho student form
export const validateStudentForm = (formData: {
  full_name: string;
  date_of_birth?: string;
  gender?: string;
  phone_number?: string;
  address?: string;
  grade?: string;
  school?: string;
  learning_goals?: string;
  preferred_schedule?: string;
  special_requirements?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Full name validation
  if (!formData.full_name.trim()) {
    errors.push({ field: "Họ và tên", message: "Không được để trống" });
  } else if (formData.full_name.trim().length < 2 || formData.full_name.trim().length > 100) {
    errors.push({ field: "Họ và tên", message: "Phải có từ 2-100 ký tự" });
  }

  // Date of birth validation
  if (formData.date_of_birth && formData.date_of_birth.trim()) {
    const birthDate = new Date(formData.date_of_birth);
    const today = new Date();
    
    if (isNaN(birthDate.getTime())) {
      errors.push({ field: "Ngày sinh", message: "Ngày sinh không hợp lệ" });
    } else if (birthDate > today) {
      errors.push({ field: "Ngày sinh", message: "Ngày sinh không được là tương lai" });
    } else {
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 3 || age > 30) {
        errors.push({ field: "Ngày sinh", message: "Tuổi phải từ 3 đến 30" });
      }
    }
  }

  // Phone number validation (match backend pattern)
  if (formData.phone_number && formData.phone_number.trim()) {
    const cleanPhone = formData.phone_number.replace(/[\s\-\(\)]/g, '');
    const backendPattern = /^(\+84|0)[3|5|7|8|9][0-9]{8}$/;
    
    if (!backendPattern.test(cleanPhone)) {
      errors.push({ 
        field: "Số điện thoại", 
        message: "Phải bắt đầu bằng 03, 05, 07, 08, hoặc 09 và có đúng 10 số" 
      });
    }
  }

  // Address length validation
  if (formData.address && formData.address.length > 500) {
    errors.push({ field: "Địa chỉ", message: "Không được quá 500 ký tự" });
  }

  // Grade length validation
  if (formData.grade && formData.grade.length > 50) {
    errors.push({ field: "Lớp học", message: "Không được quá 50 ký tự" });
  }

  // School length validation
  if (formData.school && formData.school.length > 200) {
    errors.push({ field: "Trường học", message: "Không được quá 200 ký tự" });
  }

  // Learning goals length validation
  if (formData.learning_goals && formData.learning_goals.length > 1000) {
    errors.push({ field: "Mục tiêu học tập", message: "Không được quá 1000 ký tự" });
  }

  // Preferred schedule length validation
  if (formData.preferred_schedule && formData.preferred_schedule.length > 500) {
    errors.push({ field: "Lịch học ưa thích", message: "Không được quá 500 ký tự" });
  }

  // Special requirements length validation
  if (formData.special_requirements && formData.special_requirements.length > 1000) {
    errors.push({ field: "Yêu cầu đặc biệt", message: "Không được quá 1000 ký tự" });
  }

  return errors;
};
