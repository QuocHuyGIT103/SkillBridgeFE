import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import SessionPaymentSelector from "../../components/student/SessionPaymentSelector";
import { toast } from "react-hot-toast";
import axiosClient from "../../api/axiosClient";

interface PendingPayment {
  orderId: string;
  amount: number;
  sessionNumbers: number[];
  expiredAt: string;
  status: string;
}

const StudentPaymentPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(
    null
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // 1. Check for payment result from redirect
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const status = searchParams.get("status");
    const sessions = searchParams.get("sessions");
    const message = searchParams.get("message");

    if (status === "success" && sessions) {
      const sessionList = sessions.split(",").join(", ");
      toast.success(`✅ Thanh toán thành công các buổi: ${sessionList}!`, {
        duration: 5000,
      });
      setRefreshKey((prev) => prev + 1);
      // Clear URL params
      window.history.replaceState({}, "", window.location.pathname);
    } else if (status === "failure") {
      toast.error(`❌ Thanh toán thất bại: ${message || "Vui lòng thử lại"}`, {
        duration: 5000,
      });
      setRefreshKey((prev) => prev + 1);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // 2. Check for existing pending payment
  useEffect(() => {
    const checkPendingPayment = async () => {
      if (!classId) return;

      try {
        const response = await axiosClient.get(
          `/payments/classes/${classId}/pending`
        );

        if (response.success && response.data) {
          const payment = response.data;
          setPendingPayment(payment);

          // Calculate time remaining
          const expireTime = new Date(payment.expiredAt).getTime();
          const now = new Date().getTime();
          const remaining = Math.max(0, Math.floor((expireTime - now) / 1000));
          setTimeRemaining(remaining);
        } else {
          setPendingPayment(null);
          setTimeRemaining(0);
        }
      } catch (error) {
        console.error("Error checking pending payment:", error);
        setPendingPayment(null);
      }
    };

    checkPendingPayment();
    // Re-check every 10 seconds
    const interval = setInterval(checkPendingPayment, 10000);
    return () => clearInterval(interval);
  }, [classId, refreshKey]);

  // 3. Countdown timer for pending payment
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Payment expired - refresh to cancel it
            toast("Giao dịch đã hết hạn. Đang làm mới trang...", {
              duration: 2000,
              icon: "⏰",
            });
            setTimeout(() => {
              setRefreshKey((k) => k + 1);
            }, 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!classId) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-3">
            Lớp học không tồn tại
          </h2>
          <p className="text-gray-600 mb-6">
            Không thể tìm thấy thông tin lớp học này.
          </p>
          <button
            onClick={() => navigate("/student/classes")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Về trang lớp học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Thanh toán học phí
          </h1>
          <button
            onClick={() => navigate(`/student/classes/${classId}`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại
          </button>
        </div>

        {/* Pending Payment Warning */}
        {pendingPayment && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">
                  ⚠️ Bạn có giao dịch đang chờ xử lý
                </h3>
                <p className="text-sm text-yellow-800 mb-1">
                  Mã giao dịch:{" "}
                  <span className="font-mono font-semibold">
                    {pendingPayment.orderId}
                  </span>
                </p>
                <p className="text-sm text-yellow-800 mb-2">
                  Các buổi: {pendingPayment.sessionNumbers.join(", ")}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">
                    Hết hạn sau:{" "}
                    <span className="font-mono text-lg">
                      {formatTime(timeRemaining)}
                    </span>
                  </span>
                </div>
                <div className="bg-yellow-100 rounded p-2 mt-2">
                  <p className="text-xs text-yellow-800">
                    💡 <strong>Lưu ý:</strong> Nếu bạn đã thanh toán, vui lòng
                    đợi hệ thống xử lý. Nếu chưa thanh toán, giao dịch sẽ tự
                    động hủy sau {formatTime(timeRemaining)} và bạn có thể tạo
                    giao dịch mới.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Selector */}
        <div className={pendingPayment ? "opacity-50 pointer-events-none" : ""}>
          <SessionPaymentSelector
            key={refreshKey}
            classId={classId}
            onPaymentInitiated={(url) => {
              // Redirect to VNPay
              window.location.href = url;
            }}
          />
        </div>

        {pendingPayment && (
          <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg text-center">
            <p className="text-sm text-gray-700">
              🔒 Vui lòng hoàn tất hoặc chờ hủy giao dịch hiện tại trước khi tạo
              giao dịch mới.
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            📌 Hướng dẫn thanh toán:
          </h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="font-semibold">1.</span>
              <span>
                Chọn các buổi học bạn muốn thanh toán (có thể chọn 1 buổi, nhiều
                buổi hoặc tất cả)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">2.</span>
              <span>
                Nhấn nút "Thanh toán qua VNPay" để chuyển đến cổng thanh toán
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">3.</span>
              <span>
                Chọn phương thức thanh toán và hoàn tất giao dịch trên VNPay
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">4.</span>
              <span>
                Sau khi thanh toán thành công, các buổi học sẽ được mở khóa tự
                động
              </span>
            </li>
          </ol>
        </div>

        {/* Security Info */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            🔒 Giao dịch được bảo mật bởi{" "}
            <span className="font-semibold">VNPay</span> - Cổng thanh toán điện
            tử hàng đầu Việt Nam
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentPaymentPage;
