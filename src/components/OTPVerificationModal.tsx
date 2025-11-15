import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otpCode: string) => Promise<void>;
  onResend: () => Promise<void>;
  email: string;
  contractCode: string;
  role: "student" | "tutor";
  expiresAt?: Date;
}

export const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  onResend,
  email,
  contractCode,
  role,
  expiresAt,
}) => {
  const [otpCode, setOtpCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Refs for OTP input boxes
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Calculate time left until OTP expires
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = Math.floor((expiry - now) / 1000);

      if (diff <= 0) {
        setTimeLeft(0);
        setCanResend(true);
        clearInterval(interval);
      } else {
        setTimeLeft(diff);
        setCanResend(diff < 30); // Allow resend in last 30 seconds
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtpCode(["", "", "", "", "", ""]);
      setError(null);
      setIsVerifying(false);
      setIsResending(false);
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  // Handle OTP input change
  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!otpCode[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otpCode];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtpCode(newOtp);
    setError(null);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  // Handle verify
  const handleVerify = async () => {
    const fullOtp = otpCode.join("");

    if (fullOtp.length !== 6) {
      setError("Vui lòng nhập đầy đủ 6 chữ số");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await onVerify(fullOtp);
      // Success handling is done in parent component
    } catch (err: any) {
      setError(err.message || "Mã OTP không đúng. Vui lòng thử lại.");
      setOtpCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resend OTP
  const handleResend = async () => {
    setIsResending(true);
    setError(null);

    try {
      await onResend();
      setOtpCode(["", "", "", "", "", ""]);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Không thể gửi lại mã OTP. Vui lòng thử lại.");
    } finally {
      setIsResending(false);
    }
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const roleText = role === "student" ? "Học viên" : "Gia sư";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        Xác thực chữ ký điện tử
                      </h2>
                      <p className="text-green-100 text-sm mt-1">
                        {roleText} ký hợp đồng
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Contract Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium">
                    Mã hợp đồng:{" "}
                    <span className="font-bold">{contractCode}</span>
                  </p>
                </div>

                {/* Email Info */}
                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    Mã OTP đã được gửi tới
                  </p>
                  <p className="text-gray-900 font-semibold mt-1">{email}</p>
                </div>

                {/* Timer */}
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Clock
                    className={`w-4 h-4 ${
                      timeLeft <= 60 ? "text-red-500" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      timeLeft <= 60 ? "text-red-500" : "text-gray-700"
                    }`}
                  >
                    Mã hết hạn sau: {formatTime(timeLeft)}
                  </span>
                </div>

                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    Nhập mã OTP (6 chữ số)
                  </label>
                  <div
                    className="flex gap-2 justify-center"
                    onPaste={handlePaste}
                  >
                    {otpCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleInputChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-green-500 transition-all
                          ${error ? "border-red-500" : "border-gray-300"}
                          ${digit ? "bg-green-50 border-green-500" : "bg-white"}
                        `}
                        disabled={isVerifying || timeLeft === 0}
                      />
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </motion.div>
                )}

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-xs text-yellow-900">
                    ⚠️ <strong>Lưu ý:</strong> Việc nhập mã OTP có ý nghĩa{" "}
                    <strong>chữ ký điện tử hợp pháp</strong>. Sau khi ký, hợp
                    đồng sẽ <strong>không thể thay đổi</strong>.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleVerify}
                    disabled={
                      isVerifying ||
                      otpCode.join("").length !== 6 ||
                      timeLeft === 0
                    }
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                      font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-all
                      flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Đang xác thực...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Xác nhận ký hợp đồng
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleResend}
                    disabled={!canResend || isResending || timeLeft === 0}
                    className="w-full py-2 text-green-600 font-medium hover:text-green-700 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                      flex items-center justify-center gap-2"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Đang gửi lại...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Gửi lại mã OTP
                        {!canResend && timeLeft > 30 && (
                          <span className="text-sm text-gray-500">
                            (sau {formatTime(timeLeft - 30)})
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </div>

                {/* Help Text */}
                <p className="text-xs text-center text-gray-500">
                  Không nhận được email? Kiểm tra thư mục spam hoặc gửi lại mã
                  OTP.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
