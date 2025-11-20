import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircleIcon,
  ClockIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { usePaymentStore } from "../../store/payment.store";
import PaymentStatusBadge from "../../components/common/PaymentStatusBadge";

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const { getPaymentByOrderId, currentPayment, isLoadingPaymentDetails } =
    usePaymentStore();

  useEffect(() => {
    if (orderId) {
      getPaymentByOrderId(orderId);
    }
  }, [orderId]);

  if (isLoadingPaymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentPayment) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-3">
            Không tìm thấy giao dịch
          </h2>
          <p className="text-gray-600 mb-6">
            Không thể tìm thấy thông tin giao dịch này.
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Animation Card */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Header with Animation */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-32 bg-white/20 rounded-full animate-ping"></div>
              </div>
              <div className="relative">
                <CheckCircleIcon className="h-32 w-32 text-white mx-auto mb-4" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-green-100 text-lg">
              Cảm ơn bạn đã thanh toán học phí
            </p>
          </div>

          {/* Payment Details */}
          <div className="p-8 space-y-6">
            {/* Order ID */}
            <div className="text-center pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
              <p className="text-xl font-mono font-bold text-gray-900">
                {currentPayment.orderId}
              </p>
            </div>

            {/* Amount */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Số tiền đã thanh toán
              </p>
              <p className="text-4xl font-bold text-blue-600">
                {currentPayment.amount.toLocaleString("vi-VN")} VNĐ
              </p>
            </div>

            {/* Payment Info Grid */}
            <div className="grid grid-cols-1 gap-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  <span className="font-medium text-gray-700">Trạng thái</span>
                </div>
                <PaymentStatusBadge status={currentPayment.status} />
              </div>

              {/* Payment Method */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BanknotesIcon className="h-6 w-6 text-blue-500" />
                  <span className="font-medium text-gray-700">
                    Phương thức thanh toán
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">VNPay</span>
                  <img
                    src="https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg"
                    alt="VNPay"
                    className="h-5"
                  />
                </div>
              </div>

              {/* Sessions */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CalendarDaysIcon className="h-6 w-6 text-purple-500" />
                  <span className="font-medium text-gray-700">
                    Các tuần đã thanh toán
                  </span>
                </div>
                <span className="font-semibold text-gray-900">
                  {currentPayment.sessionNumbers.length === 1
                    ? `Tuần ${currentPayment.sessionNumbers[0]}`
                    : `${
                        currentPayment.sessionNumbers.length
                      } tuần (${currentPayment.sessionNumbers.join(", ")})`}
                </span>
              </div>

              {/* Payment Date */}
              {currentPayment.paidAt && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-6 w-6 text-orange-500" />
                    <span className="font-medium text-gray-700">
                      Thời gian thanh toán
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {new Date(currentPayment.paidAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              )}

              {/* Transaction ID */}
              {currentPayment.gatewayTransactionId && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">
                    Mã giao dịch VNPay
                  </span>
                  <span className="font-mono text-sm text-gray-900">
                    {currentPayment.gatewayTransactionId}
                  </span>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>📌 Lưu ý:</strong> Các buổi học đã thanh toán sẽ được mở
                khóa tự động. Bạn có thể tham gia lớp học ngay bây giờ!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                onClick={() =>
                  navigate(`/student/classes/${currentPayment.learningClassId}`)
                }
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Vào lớp học
                <ArrowRightIcon className="h-5 w-5" />
              </button>

              <button
                onClick={() => navigate("/student/payments/history")}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                Xem lịch sử thanh toán
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Nếu có bất kỳ thắc mắc nào, vui lòng{" "}
            <button
              onClick={() => navigate("/student/support")}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              liên hệ hỗ trợ
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
