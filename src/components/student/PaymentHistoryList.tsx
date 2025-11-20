import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClockIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { usePaymentStore } from "../../store/payment.store";
import PaymentStatusBadge from "../common/PaymentStatusBadge";
import type { PaymentStatus } from "../../services/payment.service";

const PaymentHistoryList: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">(
    "ALL"
  );
  const [currentPage, setCurrentPage] = useState(1);

  const {
    getPaymentHistory,
    payments,
    paymentsPagination,
    isLoadingPaymentHistory,
  } = usePaymentStore();

  useEffect(() => {
    const filters = {
      page: currentPage,
      limit: 10,
      ...(statusFilter !== "ALL" && { status: statusFilter }),
    };
    getPaymentHistory(filters);
  }, [currentPage, statusFilter]);

  if (isLoadingPaymentHistory && payments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header with Filter */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ClockIcon className="h-6 w-6" />
            Lịch sử thanh toán
          </h3>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-white" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as PaymentStatus | "ALL");
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="ALL">Tất cả</option>
              <option value="COMPLETED">Đã thanh toán</option>
              <option value="PENDING">Đang xử lý</option>
              <option value="FAILED">Thất bại</option>
              <option value="EXPIRED">Đã hết hạn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <BanknotesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              Chưa có giao dịch nào
            </h4>
            <p className="text-gray-500">
              {statusFilter !== "ALL"
                ? `Không có giao dịch nào ở trạng thái "${statusFilter}"`
                : "Lịch sử thanh toán của bạn sẽ hiển thị tại đây"}
            </p>
          </div>
        ) : (
          <>
            {/* Payments Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Các tuần
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày thanh toán
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() =>
                        navigate(`/student/payments/${payment.orderId}`)
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.orderId}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.paymentMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-blue-600">
                          {payment.amount.toLocaleString("vi-VN")} VNĐ
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.sessionNumbers.length === 1 ? (
                            `Tuần ${payment.sessionNumbers[0]}`
                          ) : (
                            <span>
                              {payment.sessionNumbers.length} tuần
                              <span className="text-xs text-gray-500 ml-1">
                                ({payment.sessionNumbers.join(", ")})
                              </span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PaymentStatusBadge status={payment.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarDaysIcon className="h-4 w-4" />
                          {payment.paidAt
                            ? new Date(payment.paidAt).toLocaleString("vi-VN")
                            : new Date(payment.createdAt).toLocaleString(
                                "vi-VN"
                              )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {paymentsPagination && paymentsPagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-700">
                  Hiển thị{" "}
                  <span className="font-medium">
                    {(paymentsPagination.page - 1) * paymentsPagination.limit +
                      1}
                  </span>{" "}
                  đến{" "}
                  <span className="font-medium">
                    {Math.min(
                      paymentsPagination.page * paymentsPagination.limit,
                      paymentsPagination.total
                    )}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="font-medium">
                    {paymentsPagination.total}
                  </span>{" "}
                  giao dịch
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: paymentsPagination.totalPages },
                      (_, i) => i + 1
                    )
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === paymentsPagination.totalPages ||
                          Math.abs(page - currentPage) <= 1
                      )
                      .map((page, idx, arr) => (
                        <React.Fragment key={page}>
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                              currentPage === page
                                ? "bg-purple-600 text-white"
                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(paymentsPagination.totalPages, p + 1)
                      )
                    }
                    disabled={currentPage === paymentsPagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryList;
