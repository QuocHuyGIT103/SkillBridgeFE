import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

const PaymentFailurePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const message = searchParams.get("message");

  const getErrorMessage = () => {
    if (message) {
      return decodeURIComponent(message);
    }
    return "Giao dịch không thành công. Vui lòng thử lại sau.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Failure Card */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-12 text-center">
            <div className="relative">
              <XCircleIcon className="h-32 w-32 text-white mx-auto mb-4" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Thanh toán không thành công
            </h1>
            <p className="text-red-100 text-lg">
              Đã xảy ra lỗi trong quá trình thanh toán
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Error Message */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <div className="flex gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">
                    Lý do thất bại:
                  </h3>
                  <p className="text-red-800">{getErrorMessage()}</p>
                </div>
              </div>
            </div>

            {/* Order ID */}
            {orderId && (
              <div className="text-center py-4 border-y border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
                <p className="text-lg font-mono font-bold text-gray-900">
                  {orderId}
                </p>
              </div>
            )}

            {/* Common Reasons */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-900 mb-3">
                Các nguyên nhân thường gặp:
              </h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Số dư tài khoản không đủ</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Thông tin thẻ không chính xác</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Thẻ/Tài khoản đã bị khóa</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Vượt quá hạn mức giao dịch trong ngày</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Hủy giao dịch hoặc hết thời gian chờ thanh toán</span>
                </li>
              </ul>
            </div>

            {/* Help Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Gợi ý:</strong> Vui lòng kiểm tra lại thông tin tài
                khoản/thẻ của bạn và thử thanh toán lại. Nếu vấn đề vẫn tiếp
                diễn, hãy liên hệ với ngân hàng hoặc bộ phận hỗ trợ của chúng
                tôi.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                onClick={() => navigate("/student/classes")}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Thử lại thanh toán
              </button>

              <button
                onClick={() => navigate("/student/dashboard")}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                <HomeIcon className="h-5 w-5" />
                Về trang chủ
              </button>
            </div>

            {/* Support Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Cần trợ giúp?{" "}
                <button
                  onClick={() => navigate("/student/support")}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Liên hệ hỗ trợ
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;
