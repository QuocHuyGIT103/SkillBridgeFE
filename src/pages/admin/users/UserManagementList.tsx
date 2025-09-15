import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "student" | "tutor";
  status: "active" | "blocked" | "pending";
  joinDate: string;
  lastActive: string;
  avatar?: string;
}

const UserManagementList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "student" | "tutor">(
    "all"
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "blocked" | "pending"
  >("all");

  // Mock data
  const users: User[] = [
    {
      id: "1",
      name: "Nguyễn Văn An",
      email: "nguyenvana@email.com",
      phone: "0912345678",
      role: "student",
      status: "active",
      joinDate: "2024-01-15",
      lastActive: "2024-03-10 14:30",
    },
    {
      id: "2",
      name: "Trần Thị Bình",
      email: "tranthib@email.com",
      phone: "0987654321",
      role: "tutor",
      status: "active",
      joinDate: "2024-02-20",
      lastActive: "2024-03-10 16:45",
    },
    {
      id: "3",
      name: "Lê Văn Cường",
      email: "levanc@email.com",
      phone: "0923456789",
      role: "student",
      status: "blocked",
      joinDate: "2024-01-08",
      lastActive: "2024-03-05 09:15",
    },
    {
      id: "4",
      name: "Phạm Thị Dung",
      email: "phamthid@email.com",
      phone: "0934567890",
      role: "tutor",
      status: "pending",
      joinDate: "2024-03-01",
      lastActive: "2024-03-10 11:20",
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "blocked":
        return "Bị khóa";
      case "pending":
        return "Chờ duyệt";
      default:
        return status;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "student":
        return "Học sinh";
      case "tutor":
        return "Gia sư";
      default:
        return role;
    }
  };

  const handleAction = (userId: string, action: string) => {
    console.log(`Performing ${action} on user ${userId}`);
    // Implement action logic here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <UserGroupIcon className="w-8 h-8 mr-3 text-blue-600" />
              Quản lý người dùng
            </h1>
            <p className="text-gray-600 mt-1">
              Xem và quản lý tất cả người dùng trong hệ thống
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="student">Học sinh</option>
              <option value="tutor">Gia sư</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="blocked">Bị khóa</option>
              <option value="pending">Chờ duyệt</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tham gia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hoạt động cuối
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {getRoleText(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        user.status
                      )}`}
                    >
                      {getStatusText(user.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.joinDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.lastActive}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAction(user.id, "view")}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAction(user.id, "edit")}
                        className="text-green-600 hover:text-green-900"
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      {user.status === "active" ? (
                        <button
                          onClick={() => handleAction(user.id, "block")}
                          className="text-red-600 hover:text-red-900"
                          title="Khóa tài khoản"
                        >
                          <LockClosedIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(user.id, "unblock")}
                          className="text-green-600 hover:text-green-900"
                          title="Mở khóa tài khoản"
                        >
                          <LockOpenIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Không tìm thấy người dùng nào</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UserManagementList;
