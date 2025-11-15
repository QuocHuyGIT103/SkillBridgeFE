import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  FileText,
  Shield,
  User,
  AlertTriangle,
} from "lucide-react";
import type { Contract } from "../../types/contract.types";
import { OTPVerificationModal } from "../OTPVerificationModal";
import { useContractStore } from "../../store/contract.store";
import { useAuthStore } from "../../store/auth.store";

interface ContractSigningViewProps {
  contract: Contract;
  onSuccess?: () => void;
}

export const ContractSigningView: React.FC<ContractSigningViewProps> = ({
  contract,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const {
    initiateContractSigning,
    verifyContractSignature,
    resendContractOTP,
  } = useContractStore();

  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [otpData, setOtpData] = useState<{
    email: string;
    expiresAt: string;
    role: "student" | "tutor";
  } | null>(null);

  // Determine user role
  const userRole: "student" | "tutor" =
    user?.id === contract.studentId ? "student" : "tutor";

  const roleText = userRole === "student" ? "Học viên" : "Gia sư";

  // Check if current user has signed
  const hasUserSigned =
    userRole === "student"
      ? !!contract.studentSignedAt
      : !!contract.tutorSignedAt;

  // Check if other party has signed
  const hasOtherPartySigned =
    userRole === "student"
      ? !!contract.tutorSignedAt
      : !!contract.studentSignedAt;

  // Check if both parties signed
  const isFullySigned = contract.isSigned && contract.isLocked;

  // Consent text
  const consentText = `Tôi xác nhận đã đọc, hiểu rõ và đồng ý với tất cả các điều khoản trong hợp đồng ${contract.title}. Tôi cam kết tuân thủ mọi điều khoản đã ký kết. Việc ký kết này có giá trị pháp lý.`;

  // Handle signing initiation
  const handleInitiateSigning = async () => {
    if (!hasConsent) {
      return;
    }

    try {
      const result = await initiateContractSigning(contract.id, userRole);
      setOtpData({
        email: result.email,
        expiresAt: result.expiresAt,
        role: userRole,
      });
      setIsOTPModalOpen(true);
    } catch (error) {
      // Error handled in store
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (otpCode: string) => {
    if (!otpData) return;

    try {
      await verifyContractSignature(
        contract.id,
        otpCode,
        otpData.role,
        consentText
      );

      setIsOTPModalOpen(false);
      onSuccess?.();
    } catch (error) {
      throw error; // Re-throw to let OTPModal handle error display
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!otpData) return;

    try {
      const result = await resendContractOTP(contract.id, otpData.role);
      setOtpData({
        ...otpData,
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      throw error;
    }
  };

  // If contract is not approved, don't show signing UI
  if (contract.status !== "APPROVED") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-yellow-600" />
          <div>
            <h3 className="font-semibold text-yellow-900">
              Chờ phê duyệt hợp đồng
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Hợp đồng cần được phê duyệt trước khi có thể ký kết.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If fully signed
  if (isFullySigned) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-green-900 text-lg">
              ✅ Hợp đồng đã được ký kết hoàn tất
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Cả hai bên đã ký kết hợp đồng điện tử. Hợp đồng đã được khóa và
              không thể thay đổi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-900">Học viên</span>
            </div>
            <p className="text-sm text-gray-600">
              Đã ký:{" "}
              {contract.studentSignedAt
                ? new Date(contract.studentSignedAt).toLocaleString("vi-VN")
                : "Chưa ký"}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-900">Gia sư</span>
            </div>
            <p className="text-sm text-gray-600">
              Đã ký:{" "}
              {contract.tutorSignedAt
                ? new Date(contract.tutorSignedAt).toLocaleString("vi-VN")
                : "Chưa ký"}
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Tính toàn vẹn</span>
          </div>
          <p className="text-sm text-blue-700">
            Hợp đồng đã được mã hóa SHA-256: <br />
            <code className="text-xs bg-blue-100 px-2 py-1 rounded mt-1 inline-block break-all">
              {contract.contractHash?.substring(0, 32)}...
            </code>
          </p>
        </div>
      </div>
    );
  }

  // If user already signed, waiting for other party
  if (hasUserSigned) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">
              Bạn đã ký hợp đồng thành công
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Chờ {userRole === "student" ? "gia sư" : "học viên"} ký kết để
              hoàn tất hợp đồng.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`rounded-lg p-4 border-2 ${
              userRole === "student"
                ? "bg-green-50 border-green-300"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              <span className="font-medium">Học viên</span>
            </div>
            <p className="text-sm">
              {contract.studentSignedAt ? (
                <span className="text-green-600 font-medium">✓ Đã ký</span>
              ) : (
                <span className="text-gray-500">⏳ Chờ ký</span>
              )}
            </p>
          </div>

          <div
            className={`rounded-lg p-4 border-2 ${
              userRole === "tutor"
                ? "bg-green-50 border-green-300"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              <span className="font-medium">Gia sư</span>
            </div>
            <p className="text-sm">
              {contract.tutorSignedAt ? (
                <span className="text-green-600 font-medium">✓ Đã ký</span>
              ) : (
                <span className="text-gray-500">⏳ Chờ ký</span>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Signing UI for current user
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-full">
            <FileText className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-900">
              Ký kết hợp đồng điện tử
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Bạn đang ký với vai trò: <strong>{roleText}</strong>
            </p>
          </div>
        </div>

        {/* Status of other party */}
        {hasOtherPartySigned && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800">
              ✓{" "}
              {userRole === "student"
                ? "Gia sư đã ký hợp đồng"
                : "Học viên đã ký hợp đồng"}
              . Hợp đồng sẽ có hiệu lực sau khi bạn ký kết.
            </p>
          </div>
        )}

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">
                ⚠️ Lưu ý quan trọng
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>
                  Chữ ký điện tử có <strong>giá trị pháp lý</strong>
                </li>
                <li>
                  Sau khi ký, hợp đồng sẽ <strong>không thể thay đổi</strong>
                </li>
                <li>Bạn sẽ nhận mã OTP qua email để xác thực</li>
                <li>Mã OTP có hiệu lực trong 5 phút</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="bg-white border-2 border-green-300 rounded-lg p-5 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasConsent}
              onChange={(e) => setHasConsent(e.target.checked)}
              className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-800 leading-relaxed">
                {consentText}
              </p>
            </div>
          </label>
        </div>

        {/* Sign Button */}
        <button
          onClick={handleInitiateSigning}
          disabled={!hasConsent}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white 
            font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 
            disabled:opacity-50 disabled:cursor-not-allowed transition-all
            shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
            flex items-center justify-center gap-3"
        >
          <Shield className="w-6 h-6" />
          <span>Ký hợp đồng điện tử</span>
        </button>

        <p className="text-xs text-center text-gray-600 mt-4">
          Bằng cách nhấn nút trên, bạn đồng ý gửi mã OTP về email của mình để
          xác thực chữ ký.
        </p>
      </motion.div>

      {/* OTP Verification Modal */}
      {otpData && (
        <OTPVerificationModal
          isOpen={isOTPModalOpen}
          onClose={() => setIsOTPModalOpen(false)}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
          email={otpData.email}
          contractCode={contract.title}
          role={otpData.role}
          expiresAt={
            otpData.expiresAt ? new Date(otpData.expiresAt) : undefined
          }
        />
      )}
    </>
  );
};
