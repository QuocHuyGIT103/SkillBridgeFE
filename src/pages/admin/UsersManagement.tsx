import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  UserIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import adminUserService from "../../services/admin/user.admin.service";
import type {
  AdminUserListItem,
  AdminUserFilters,
  AdminUserStats,
} from "../../types/admin.types";
import UserDetailModal from "../../components/admin/users/UserDetailModal";
import BlockConfirmModal from "../../components/admin/users/BlockConfirmModal";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState<AdminUserFilters>({
    page: 1,
    limit: 20,
    sort_by: "updated_at",
    sort_order: "desc",
  });

  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  // Modals
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockAction, setBlockAction] = useState<"block" | "unblock">("block");

  // Load users
  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminUserService.getAllUsers(filters);
      setUsers(response.users);
      setPagination(response.pagination);
      setStats(response.stats);
    } catch (error: any) {
      console.error("Error loading users:", error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AdminUserFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleViewDetails = (user: AdminUserListItem) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleBlockUser = (user: AdminUserListItem) => {
    setSelectedUser(user);
    setBlockAction(user.status === "locked" ? "unblock" : "block");
    setShowBlockModal(true);
  };

  const handleBlockConfirm = async (reason: string) => {
    if (!selectedUser) return;

    try {
      if (blockAction === "block") {
        await adminUserService.blockUser(selectedUser.id, reason);
      } else {
        await adminUserService.unblockUser(selectedUser.id, reason);
      }

      // Reload users
      await loadUsers();
      setShowBlockModal(false);
      setSelectedUser(null);

      // TODO: Show success toast
    } catch (error: any) {
      console.error("Error updating user status:", error);
      // TODO: Show error toast
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Hoạt động
          </span>
        );
      case "locked":
        return (
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
            Bị khóa
          </span>
        );
      case "pending_verification":
        return (
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Chờ xác thực
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    return role === "TUTOR" ? (
      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
        Gia sư
      </span>
    ) : (
      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
        Học viên
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserGroupIcon className="w-8 h-8 text-red-600" />
            Quản lý người dùng
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý tất cả học viên và gia sư trên hệ thống
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng người dùng
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total_users}
                </p>
              </div>
              <UserGroupIcon className="w-12 h-12 text-blue-500 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Học viên</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {stats.total_students}
                </p>
              </div>
              <UserIcon className="w-12 h-12 text-purple-500 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gia sư</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {stats.total_tutors}
                </p>
              </div>
              <AcademicCapIcon className="w-12 h-12 text-blue-500 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng vi phạm
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {stats.total_violations}
                </p>
              </div>
              <ShieldExclamationIcon className="w-12 h-12 text-red-500 opacity-80" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="w-5 h-5" />
            <span>Bộ lọc</span>
          </button>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò
                </label>
                <select
                  value={filters.role || ""}
                  onChange={(e) =>
                    handleFilterChange("role", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Tất cả</option>
                  <option value="STUDENT">Học viên</option>
                  <option value="TUTOR">Gia sư</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={filters.status || ""}
                  onChange={(e) =>
                    handleFilterChange("status", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Tất cả</option>
                  <option value="active">Hoạt động</option>
                  <option value="locked">Bị khóa</option>
                  <option value="pending_verification">Chờ xác thực</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sắp xếp theo
                </label>
                <select
                  value={filters.sort_by || "updated_at"}
                  onChange={(e) =>
                    handleFilterChange("sort_by", e.target.value as any)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="updated_at">Cập nhật gần nhất</option>
                  <option value="created_at">Ngày tham gia</option>
                  <option value="full_name">Tên</option>
                  <option value="violation_count">Số lượt vi phạm</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Liên hệ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lượt vi phạm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tham gia
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={user.avatar_url || "/default-avatar.png"}
                            alt={user.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.phone_number || "Chưa cập nhật"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {user.violation_count > 0 && (
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                          )}
                          <span
                            className={`text-sm font-semibold ${
                              user.violation_count > 0
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {user.violation_count}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.created_at
                          ? format(new Date(user.created_at), "dd/MM/yyyy", {
                              locale: vi,
                            })
                          : "Không có dữ liệu"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Xem chi tiết"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleBlockUser(user)}
                            className={`transition-colors ${
                              user.status === "locked"
                                ? "text-green-600 hover:text-green-900"
                                : "text-red-600 hover:text-red-900"
                            }`}
                            title={
                              user.status === "locked"
                                ? "Mở khóa"
                                : "Khóa tài khoản"
                            }
                          >
                            {user.status === "locked" ? (
                              <LockOpenIcon className="w-5 h-5" />
                            ) : (
                              <LockClosedIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  trong <span className="font-medium">{pagination.total}</span>{" "}
                  kết quả
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Trước
                  </button>
                  <span className="text-sm text-gray-700">
                    Trang {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {selectedUser && showDetailModal && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedUser(null);
          }}
          onRefresh={loadUsers}
        />
      )}

      {selectedUser && showBlockModal && (
        <BlockConfirmModal
          user={selectedUser}
          action={blockAction}
          onConfirm={handleBlockConfirm}
          onClose={() => {
            setShowBlockModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UsersManagement;
