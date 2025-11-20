import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { usePaymentStore } from "../../store/payment.store";

interface SessionPaymentSelectorProps {
  classId: string;
  onPaymentInitiated?: (paymentUrl: string) => void;
}

const SessionPaymentSelector: React.FC<SessionPaymentSelectorProps> = ({
  classId,
  onPaymentInitiated,
}) => {
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);

  const {
    getAvailableSessions,
    initiatePayment,
    availableSessions,
    totalUnpaidAmount,
    isLoadingAvailableSessions,
    isInitiatingPayment,
  } = usePaymentStore();

  useEffect(() => {
    getAvailableSessions(classId);
  }, [classId]);

  const handleSelectSession = (sessionNumber: number) => {
    setSelectedSessions((prev) =>
      prev.includes(sessionNumber)
        ? prev.filter((s) => s !== sessionNumber)
        : [...prev, sessionNumber].sort((a, b) => a - b)
    );
  };

  const handleSelectAll = () => {
    if (selectedSessions.length === availableSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(availableSessions.map((s) => s.sessionNumber));
    }
  };

  const selectedAmount = availableSessions
    .filter((s) => selectedSessions.includes(s.sessionNumber))
    .reduce((sum, s) => sum + s.amount, 0);

  const handlePayment = async () => {
    if (selectedSessions.length === 0) {
      alert("Vui lòng chọn ít nhất một buổi học");
      return;
    }

    const paymentType =
      selectedSessions.length === 1
        ? "SINGLE_WEEK"
        : selectedSessions.length === availableSessions.length
        ? "FULL_REMAINING"
        : "MULTI_WEEK";

    const url = await initiatePayment({
      learningClassId: classId,
      paymentType,
      sessionNumbers: selectedSessions,
    });

    if (url) {
      if (onPaymentInitiated) {
        onPaymentInitiated(url);
      } else {
        window.location.href = url;
      }
    }
  };

  if (isLoadingAvailableSessions) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (availableSessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Tất cả buổi học đã được thanh toán!
          </h3>
          <p className="text-gray-600">
            Bạn đã hoàn tất thanh toán cho tất cả các buổi học.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <CalendarDaysIcon className="h-6 w-6" />
          Chọn buổi học cần thanh toán
        </h3>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Select All Checkbox */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={selectedSessions.length === availableSessions.length}
              onChange={handleSelectAll}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-semibold text-gray-900">
              Chọn tất cả ({availableSessions.length} buổi)
            </span>
          </label>
        </div>

        {/* Sessions List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {availableSessions.map((session) => (
            <div
              key={session.sessionNumber}
              className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                selectedSessions.includes(session.sessionNumber)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
              onClick={() => handleSelectSession(session.sessionNumber)}
            >
              <label className="flex items-center gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSessions.includes(session.sessionNumber)}
                  onChange={() => handleSelectSession(session.sessionNumber)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-semibold text-gray-900">
                      Tuần {session.sessionNumber}
                    </span>
                    <span className="text-base font-bold text-blue-600">
                      {session.amount.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>
                        Hạn:{" "}
                        {new Date(session.dueDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    {session.status === "OVERDUE" && (
                      <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        Quá hạn
                      </span>
                    )}
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t-2 border-gray-200">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tổng tiền chưa thanh toán:</span>
              <span className="text-lg font-semibold text-gray-900">
                {totalUnpaidAmount.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Số buổi đã chọn:</span>
              <span className="text-lg font-semibold text-blue-600">
                {selectedSessions.length} buổi
              </span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-lg font-bold text-gray-900">
                Số tiền thanh toán:
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {selectedAmount.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isInitiatingPayment || selectedSessions.length === 0}
            className={`mt-6 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold text-white transition-all ${
              isInitiatingPayment || selectedSessions.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            {isInitiatingPayment ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-6 w-6" />
                Thanh toán qua VNPay
              </>
            )}
          </button>

          {/* VNPay Logo */}
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>Thanh toán an toàn với</span>
            <img
              src="https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg"
              alt="VNPay"
              className="h-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionPaymentSelector;
