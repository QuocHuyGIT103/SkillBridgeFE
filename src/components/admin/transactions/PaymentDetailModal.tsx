import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CreditCardIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarIcon,
  DocumentTextIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import PaymentAdminService from "../../../services/payment.admin.service";
import type {
  PaymentDetail,
  PaymentStatus,
} from "../../../types/payment.types";

interface PaymentDetailModalProps {
  paymentId: string;
  onClose: () => void;
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  paymentId,
  onClose,
}) => {
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      setIsLoading(true);
      try {
        const response = await PaymentAdminService.getPaymentDetails(paymentId);
        if (response.success && response.data) {
          setPayment(response.data);
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId]);

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
      case "FAILED":
      case "CANCELLED":
        return <XCircleIcon className="w-6 h-6 text-red-600" />;
      case "PENDING":
        return <ClockIcon className="w-6 h-6 text-yellow-600" />;
      default:
        return <ClockIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: PaymentStatus) => {
    const labels: Record<PaymentStatus, string> = {
      COMPLETED: "Thành công",
      PENDING: "Đang xử lý",
      FAILED: "Thất bại",
      EXPIRED: "Hết hạn",
      REFUNDED: "Đã hoàn tiền",
      CANCELLED: "Đã hủy",
    };
    return labels[status] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Chi tiết giao dịch
                  </h2>
                  <p className="text-sm text-gray-500">
                    {payment?.orderId || "Đang tải..."}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500">Đang tải thông tin...</p>
                </div>
              ) : !payment ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <XCircleIcon className="w-16 h-16 text-red-500 mb-4" />
                  <p className="text-gray-500 font-medium">
                    Không tìm thấy thông tin giao dịch
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Status Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(payment.status)}
                        <div>
                          <p className="text-sm text-gray-600">Trạng thái</p>
                          <p className="text-xl font-bold text-gray-900">
                            {getStatusLabel(payment.status)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Số tiền</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                      Thông tin thanh toán
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Mã đơn hàng</p>
                        <p className="font-medium text-gray-900">
                          {payment.orderId}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Loại thanh toán</p>
                        <p className="font-medium text-gray-900">
                          {payment.paymentType === "SINGLE_WEEK"
                            ? "Thanh toán theo tuần"
                            : payment.paymentType === "MULTI_WEEK"
                            ? "Thanh toán nhiều tuần"
                            : "Thanh toán toàn bộ"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phương thức</p>
                        <p className="font-medium text-gray-900">
                          {payment.paymentMethod === "VNPAY"
                            ? "VNPay"
                            : payment.paymentMethod === "BANK_TRANSFER"
                            ? "Chuyển khoản ngân hàng"
                            : "Tiền mặt"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Cổng thanh toán</p>
                        <p className="font-medium text-gray-900">
                          {payment.paymentGateway}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Số buổi học</p>
                        <p className="font-medium text-gray-900">
                          {payment.sessionNumbers.length} buổi (
                          {payment.sessionNumbers.join(", ")})
                        </p>
                      </div>
                      {payment.gatewayTransactionId && (
                        <div>
                          <p className="text-sm text-gray-600">
                            Mã giao dịch cổng
                          </p>
                          <p className="font-medium text-gray-900">
                            {payment.gatewayTransactionId}
                          </p>
                        </div>
                      )}
                      {payment.gatewayBankCode && (
                        <div>
                          <p className="text-sm text-gray-600">Ngân hàng</p>
                          <p className="font-medium text-gray-900">
                            {payment.gatewayBankCode}
                          </p>
                        </div>
                      )}
                      {payment.gatewayResponseCode && (
                        <div>
                          <p className="text-sm text-gray-600">Mã phản hồi</p>
                          <p className="font-medium text-gray-900">
                            {payment.gatewayResponseCode}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-gray-600" />
                      Thông tin học viên
                    </h3>
                    <div className="flex items-center gap-4">
                      {payment.studentId.avatar_url ? (
                        <img
                          src={payment.studentId.avatar_url}
                          alt={payment.studentId.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xl font-bold text-blue-600">
                            {payment.studentId.full_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {payment.studentId.full_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {payment.studentId.email}
                        </p>
                        {payment.studentId.phone_number && (
                          <p className="text-sm text-gray-600">
                            {payment.studentId.phone_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tutor Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <AcademicCapIcon className="w-5 h-5 text-gray-600" />
                      Thông tin gia sư
                    </h3>
                    <div className="flex items-center gap-4">
                      {payment.tutorId.avatar_url ? (
                        <img
                          src={payment.tutorId.avatar_url}
                          alt={payment.tutorId.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                          <span className="text-xl font-bold text-orange-600">
                            {payment.tutorId.full_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {payment.tutorId.full_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {payment.tutorId.email}
                        </p>
                        {payment.tutorId.phone_number && (
                          <p className="text-sm text-gray-600">
                            {payment.tutorId.phone_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Class Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-gray-600" />
                      Thông tin lớp học
                    </h3>
                    <div>
                      <p className="font-medium text-gray-900">
                        {payment.learningClassId.title}
                      </p>
                      {payment.learningClassId.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {payment.learningClassId.description}
                        </p>
                      )}
                      {payment.learningClassId.total_sessions && (
                        <p className="text-sm text-gray-600 mt-2">
                          Tổng số buổi: {payment.learningClassId.total_sessions}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-gray-600" />
                      Thời gian
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Ngày tạo</span>
                        <span className="font-medium text-gray-900">
                          {payment.createdAt
                            ? format(
                                new Date(payment.createdAt),
                                "dd/MM/yyyy HH:mm:ss",
                                { locale: vi }
                              )
                            : "Không có dữ liệu"}
                        </span>
                      </div>
                      {payment.paidAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Ngày thanh toán
                          </span>
                          <span className="font-medium text-green-600">
                            {format(
                              new Date(payment.paidAt),
                              "dd/MM/yyyy HH:mm:ss",
                              { locale: vi }
                            )}
                          </span>
                        </div>
                      )}
                      {payment.expiredAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Hết hạn</span>
                          <span className="font-medium text-gray-900">
                            {format(
                              new Date(payment.expiredAt),
                              "dd/MM/yyyy HH:mm:ss",
                              { locale: vi }
                            )}
                          </span>
                        </div>
                      )}
                      {payment.cancelledAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Ngày hủy
                          </span>
                          <span className="font-medium text-red-600">
                            {format(
                              new Date(payment.cancelledAt),
                              "dd/MM/yyyy HH:mm:ss",
                              { locale: vi }
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Refund Information */}
                  {payment.refundInfo && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                        <BanknotesIcon className="w-5 h-5 text-purple-600" />
                        Thông tin hoàn tiền
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-purple-700">
                            Số tiền hoàn
                          </span>
                          <span className="font-bold text-purple-900">
                            {formatCurrency(payment.refundInfo.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-purple-700">Lý do</span>
                          <span className="font-medium text-purple-900">
                            {payment.refundInfo.reason}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-purple-700">
                            Ngày hoàn tiền
                          </span>
                          <span className="font-medium text-purple-900">
                            {format(
                              new Date(payment.refundInfo.refundedAt),
                              "dd/MM/yyyy HH:mm:ss",
                              { locale: vi }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {payment.notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                        Ghi chú
                      </h3>
                      <p className="text-sm text-yellow-800">{payment.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentDetailModal;
