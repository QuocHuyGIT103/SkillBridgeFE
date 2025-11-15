import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useContractStore } from "../../store/contract.store";
import type { Contract } from "../../types/contract.types";
import DashboardStats from "../../components/dashboard/DashboardStats";

const StudentContractsPage: React.FC = () => {
  const { contracts, isLoading, getStudentContracts } = useContractStore();
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    getStudentContracts();
  }, [getStudentContracts]);

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    // Filter logic can be added here if needed
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      DRAFT: "Nháp",
      PENDING_STUDENT_APPROVAL: "Chờ duyệt",
      APPROVED: "Đã duyệt",
      REJECTED: "Đã từ chối",
      EXPIRED: "Hết hạn",
      CANCELLED: "Đã hủy",
    };
    return labels[status] || status;
  };

  const filteredContracts = selectedStatus
    ? contracts.filter((c) => c.status === selectedStatus)
    : contracts;

  if (isLoading && contracts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    {
      label: "Tổng hợp đồng",
      value: contracts.length,
      icon: DocumentTextIcon,
      color: "blue" as const,
      description: "Tất cả hợp đồng",
    },
    {
      label: "Chờ phê duyệt",
      value: contracts.filter((c) => c.status === "PENDING_STUDENT_APPROVAL")
        .length,
      icon: ClockIcon,
      color: "yellow" as const,
      description: "Cần xem xét",
    },
    {
      label: "Đã duyệt",
      value: contracts.filter((c) => c.status === "APPROVED").length,
      icon: CheckCircleIcon,
      color: "green" as const,
      description: "Đã phê duyệt",
    },
    {
      label: "Đã ký kết",
      value: contracts.filter((c) => c.isSigned && c.isLocked).length,
      icon: ShieldCheckIcon,
      color: "purple" as const,
      description: "Có hiệu lực",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <DashboardStats
        title="Hợp đồng của tôi"
        description="Tổng quan về các hợp đồng học tập"
        stats={stats}
      />

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-indigo-50 opacity-80" />
        <div className="absolute -right-10 top-10 h-32 w-32 rounded-full bg-blue-100/40 blur-2xl" />
        <div className="absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-indigo-100/40 blur-2xl" />
        <div className="relative">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500">
              Học viên
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-gray-900">
              Quản lý hợp đồng
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Xem, phê duyệt và ký kết các hợp đồng học tập với gia sư.
            </p>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={() => handleStatusFilter("")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedStatus === ""
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white/70 text-gray-700 border border-gray-200 hover:bg-white"
              }`}
            >
              Tất cả ({contracts.length})
            </button>
            <button
              onClick={() => handleStatusFilter("PENDING_STUDENT_APPROVAL")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedStatus === "PENDING_STUDENT_APPROVAL"
                  ? "bg-yellow-600 text-white shadow-md"
                  : "bg-white/70 text-gray-700 border border-gray-200 hover:bg-white"
              }`}
            >
              Chờ duyệt (
              {
                contracts.filter((c) => c.status === "PENDING_STUDENT_APPROVAL")
                  .length
              }
              )
            </button>
            <button
              onClick={() => handleStatusFilter("APPROVED")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedStatus === "APPROVED"
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-white/70 text-gray-700 border border-gray-200 hover:bg-white"
              }`}
            >
              Đã duyệt (
              {contracts.filter((c) => c.status === "APPROVED").length})
            </button>
            <button
              onClick={() => handleStatusFilter("REJECTED")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedStatus === "REJECTED"
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-white/70 text-gray-700 border border-gray-200 hover:bg-white"
              }`}
            >
              Đã từ chối (
              {contracts.filter((c) => c.status === "REJECTED").length})
            </button>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContracts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <DocumentTextIcon className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có hợp đồng nào
            </h3>
            <p className="text-gray-600">
              {selectedStatus
                ? "Không có hợp đồng nào trong trạng thái này."
                : "Bạn chưa có hợp đồng nào. Hợp đồng sẽ được tạo sau khi gia sư chấp nhận yêu cầu học tập."}
            </p>
          </div>
        ) : (
          filteredContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              getStatusLabel={getStatusLabel}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface ContractCardProps {
  contract: Contract;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  getStatusLabel: (status: string) => string;
}

const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  formatDate,
  formatCurrency,
  getStatusLabel,
}) => {
  const getStatusStyles = (status: string) => {
    const styles: Record<
      string,
      { bg: string; text: string; icon: typeof CheckCircleIcon }
    > = {
      PENDING_STUDENT_APPROVAL: {
        bg: "bg-yellow-100 border-yellow-300",
        text: "text-yellow-800",
        icon: ClockIcon,
      },
      APPROVED: {
        bg: "bg-green-100 border-green-300",
        text: "text-green-800",
        icon: CheckCircleIcon,
      },
      REJECTED: {
        bg: "bg-red-100 border-red-300",
        text: "text-red-800",
        icon: XCircleIcon,
      },
      EXPIRED: {
        bg: "bg-gray-100 border-gray-300",
        text: "text-gray-800",
        icon: ClockIcon,
      },
      CANCELLED: {
        bg: "bg-gray-100 border-gray-300",
        text: "text-gray-800",
        icon: XCircleIcon,
      },
    };
    return styles[status] || styles.PENDING_STUDENT_APPROVAL;
  };

  const statusStyle = getStatusStyles(contract.status);
  const StatusIcon = statusStyle.icon;

  // Check signing status
  const isFullySigned = contract.isSigned && contract.isLocked;
  const isPartiallySigned = contract.studentSignedAt || contract.tutorSignedAt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
    >
      <div className="relative p-6 md:p-7 space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-2xl ${statusStyle.bg} border`}
            >
              <StatusIcon className={`w-6 h-6 ${statusStyle.text}`} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {contract.title}
                </h3>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text} border`}
                >
                  {getStatusLabel(contract.status)}
                </span>
                {isFullySigned && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
                    <ShieldCheckIcon className="w-3 h-3 mr-1" />
                    Đã ký kết
                  </span>
                )}
                {isPartiallySigned && !isFullySigned && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                    Đang ký kết
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Tạo lúc: {formatDate(contract.createdAt)}
              </p>
              {contract.expiresAt &&
                contract.status === "PENDING_STUDENT_APPROVAL" && (
                  <p className="text-xs text-red-600 mt-1">
                    ⏰ Hết hạn: {formatDate(contract.expiresAt)}
                  </p>
                )}
            </div>
          </div>

          <Link
            to={`/student/contracts/${contract.id}`}
            className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors shadow-sm"
          >
            <EyeIcon className="w-4 h-4" />
            Xem chi tiết
          </Link>
        </div>

        {/* Contract Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Tổng số buổi
            </p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {contract.totalSessions} buổi
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {contract.sessionDuration} phút/buổi
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Học phí
            </p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {formatCurrency(contract.pricePerSession)}
            </p>
            <p className="text-xs text-gray-600 mt-1">Mỗi buổi</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Tổng chi phí
            </p>
            <p className="text-lg font-bold text-blue-600 mt-1">
              {formatCurrency(contract.totalAmount)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {contract.paymentTerms?.paymentMethod === "INSTALLMENTS"
                ? "Trả góp"
                : "Thanh toán toàn bộ"}
            </p>
          </div>
        </div>

        {/* Schedule Info */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-2">
            Lịch học
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-blue-900">
            <span>
              📅 Từ {formatDate(contract.startDate)} đến{" "}
              {formatDate(contract.expectedEndDate)}
            </span>
            <span>
              ⏰ {contract.schedule.startTime} - {contract.schedule.endTime}
            </span>
            <span>
              🏠 {contract.learningMode === "ONLINE" ? "Trực tuyến" : "Tại nhà"}
            </span>
          </div>
        </div>

        {/* Action required banner */}
        {contract.status === "PENDING_STUDENT_APPROVAL" && (
          <div className="rounded-2xl border-l-4 border-yellow-500 bg-yellow-50 p-4">
            <p className="text-sm font-semibold text-yellow-900">
              ⚠️ Cần phê duyệt
            </p>
            <p className="text-sm text-yellow-800 mt-1">
              Hợp đồng đang chờ bạn xem xét và phê duyệt. Vui lòng xem chi tiết
              và đưa ra quyết định.
            </p>
          </div>
        )}

        {/* Signing status */}
        {contract.status === "APPROVED" && !isFullySigned && (
          <div className="rounded-2xl border-l-4 border-green-500 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-900">
              ✅ Đã phê duyệt - Cần ký kết
            </p>
            <p className="text-sm text-green-800 mt-1">
              {!contract.studentSignedAt && !contract.tutorSignedAt && (
                <>
                  Hợp đồng đã được phê duyệt. Cả hai bên cần ký kết điện tử để
                  hợp đồng có hiệu lực.
                </>
              )}
              {contract.studentSignedAt && !contract.tutorSignedAt && (
                <>Bạn đã ký kết. Đang chờ gia sư ký kết để hoàn tất hợp đồng.</>
              )}
              {!contract.studentSignedAt && contract.tutorSignedAt && (
                <>Gia sư đã ký kết. Vui lòng ký kết để hoàn tất hợp đồng.</>
              )}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StudentContractsPage;
