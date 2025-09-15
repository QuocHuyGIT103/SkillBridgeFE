import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

const VerifyOTPPage: React.FC = () => {
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const navigate = useNavigate();
  const {
    verifyOTP,
    resendOTP,
    getOTPStatus,
    pendingVerificationEmail,
    isLoading,
    clearPendingVerification,
  } = useAuthStore();

  // Redirect if no pending verification
  useEffect(() => {
    if (!pendingVerificationEmail) {
      navigate("/register");
    }
  }, [pendingVerificationEmail, navigate]);

  // Fetch initial OTP status and sync countdown
  useEffect(() => {
    const fetchOTPStatus = async () => {
      if (!pendingVerificationEmail) return;

      try {
        setIsLoadingStatus(true);
        const status = await getOTPStatus(pendingVerificationEmail);
        setCountdown(status.remainingSeconds);
        setCanResend(status.canResend);
      } catch (error) {
        console.error("Failed to fetch OTP status:", error);
        // Default to allowing resend if we can't fetch status
        setCountdown(0);
        setCanResend(true);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchOTPStatus();

    // Refresh status every 30 seconds to stay in sync
    const intervalId = setInterval(fetchOTPStatus, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [pendingVerificationEmail, getOTPStatus]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: number;

    if (countdown > 0) {
      timer = window.setTimeout(() => {
        setCountdown((prev) => {
          const newCount = prev - 1;
          if (newCount <= 0) {
            setCanResend(true);
            return 0;
          }
          return newCount;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} giây`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only digits
    if (value.length <= 6) {
      setOtpCode(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpCode.length !== 6) {
      alert("Vui lòng nhập đầy đủ 6 chữ số OTP!");
      return;
    }

    try {
      await verifyOTP({
        email: pendingVerificationEmail!,
        otp_code: otpCode,
      });

      // Navigate to homepage after successful verification
      navigate("/");
    } catch (error) {
      console.error("OTP verification failed:", error);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || isLoadingStatus) return;

    try {
      await resendOTP(pendingVerificationEmail!);

      // Refresh OTP status after successful resend
      const status = await getOTPStatus(pendingVerificationEmail!);
      setCountdown(status.remainingSeconds);
      setCanResend(status.canResend);
    } catch (error) {
      console.error("Resend OTP failed:", error);
      // Keep current countdown if resend fails
    }
  };

  const handleBackToRegister = () => {
    clearPendingVerification();
    navigate("/register");
  };

  // Format OTP input display
  const formatOTPDisplay = (value: string) => {
    return value.split("").join(" ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <NavLink
            to="/"
            className="inline-flex items-center bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 rounded-2xl shadow-lg text-xl font-bold gap-3 hover:shadow-xl transition-shadow duration-200"
          >
            <div className="bg-white/20 p-1 rounded-lg">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            SkillBridge
          </NavLink>
        </div>

        {/* Verify OTP Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border-0 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Xác thực OTP
            </h2>
            <p className="text-gray-600 text-base">
              Chúng tôi đã gửi mã OTP gồm 6 chữ số đến
            </p>
            <p className="text-teal-600 font-medium">
              {pendingVerificationEmail}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-4 text-center"
              >
                Nhập mã OTP
              </label>
              <div className="relative">
                <input
                  id="otp"
                  type="text"
                  placeholder=""
                  value={otpCode}
                  onChange={handleOTPChange}
                  required
                  className="block w-full px-4 py-4 text-2xl text-center letter-spacing-wider border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white shadow-sm transition-all duration-200 placeholder:text-gray-300"
                  style={{ letterSpacing: "0.5em" }}
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="text-2xl text-gray-300 tracking-widest">
                    {formatOTPDisplay(otpCode.padEnd(6, "_"))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Vui lòng nhập đầy đủ 6 chữ số
              </p>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 6}
              className={`w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                isLoading ? "opacity-70" : ""
              }`}
            >
              {isLoading ? "Đang xác thực..." : "Xác thực"}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 mb-3">Không nhận được mã?</p>
            {isLoadingStatus ? (
              <p className="text-sm text-gray-500">
                Đang kiểm tra trạng thái...
              </p>
            ) : !canResend && countdown > 0 ? (
              <p className="text-sm text-gray-500">
                Gửi lại mã sau {formatTime(countdown)}
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={isLoading || !canResend}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors disabled:opacity-50"
              >
                Gửi lại mã OTP
              </button>
            )}
          </div>

          {/* Back to Register */}
          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleBackToRegister}
              className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
            >
              ← Quay lại đăng ký
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-6">
          © 2024 SkillBridge. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
