import React, { useState } from "react";
import { motion } from "framer-motion";
import { CogIcon, CheckIcon, PencilIcon } from "@heroicons/react/24/outline";

interface SystemConfig {
  commissionRate: number;
  refundPolicyDays: number;
  minimumPayoutAmount: number;
  autoApprovalThreshold: number;
  platformFees: {
    transactionFee: number;
    withdrawalFee: number;
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  securitySettings: {
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    passwordExpiryDays: number;
  };
}

const SystemConfiguration: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    commissionRate: 20,
    refundPolicyDays: 7,
    minimumPayoutAmount: 100000,
    autoApprovalThreshold: 5000000,
    platformFees: {
      transactionFee: 2.5,
      withdrawalFee: 5000,
    },
    notificationSettings: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
    securitySettings: {
      sessionTimeoutMinutes: 60,
      maxLoginAttempts: 5,
      passwordExpiryDays: 90,
    },
  });

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempConfig, setTempConfig] = useState<SystemConfig>(config);

  const handleEdit = (section: string) => {
    setEditingSection(section);
    setTempConfig({ ...config });
  };

  const handleSave = (section: string) => {
    setConfig({ ...tempConfig });
    setEditingSection(null);
    console.log(`Saving ${section} configuration:`, tempConfig);
    // Implement API call here
  };

  const handleCancel = () => {
    setTempConfig({ ...config });
    setEditingSection(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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
              <CogIcon className="w-8 h-8 mr-3 text-gray-600" />
              Cấu hình hệ thống
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý các cài đặt và tham số hệ thống
            </p>
          </div>
        </div>
      </motion.div>

      {/* Commission Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Cài đặt hoa hồng
          </h2>
          {editingSection !== "commission" && (
            <button
              onClick={() => handleEdit("commission")}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>

        {editingSection === "commission" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tỷ lệ hoa hồng (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={tempConfig.commissionRate}
                onChange={(e) =>
                  setTempConfig({
                    ...tempConfig,
                    commissionRate: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngưỡng tự động duyệt
              </label>
              <input
                type="number"
                value={tempConfig.autoApprovalThreshold}
                onChange={(e) =>
                  setTempConfig({
                    ...tempConfig,
                    autoApprovalThreshold: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="col-span-2 flex space-x-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleSave("commission")}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-1"
              >
                <CheckIcon className="w-4 h-4" />
                <span>Lưu</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Tỷ lệ hoa hồng</p>
              <p className="text-lg font-semibold text-gray-900">
                {config.commissionRate}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ngưỡng tự động duyệt</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(config.autoApprovalThreshold)}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Platform Fees */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Phí nền tảng</h2>
          {editingSection !== "fees" && (
            <button
              onClick={() => handleEdit("fees")}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>

        {editingSection === "fees" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phí giao dịch (%)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={tempConfig.platformFees.transactionFee}
                onChange={(e) =>
                  setTempConfig({
                    ...tempConfig,
                    platformFees: {
                      ...tempConfig.platformFees,
                      transactionFee: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phí rút tiền (VND)
              </label>
              <input
                type="number"
                value={tempConfig.platformFees.withdrawalFee}
                onChange={(e) =>
                  setTempConfig({
                    ...tempConfig,
                    platformFees: {
                      ...tempConfig.platformFees,
                      withdrawalFee: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tiền rút tối thiểu (VND)
              </label>
              <input
                type="number"
                value={tempConfig.minimumPayoutAmount}
                onChange={(e) =>
                  setTempConfig({
                    ...tempConfig,
                    minimumPayoutAmount: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời hạn hoàn tiền (ngày)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={tempConfig.refundPolicyDays}
                onChange={(e) =>
                  setTempConfig({
                    ...tempConfig,
                    refundPolicyDays: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="col-span-2 flex space-x-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleSave("fees")}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-1"
              >
                <CheckIcon className="w-4 h-4" />
                <span>Lưu</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Phí giao dịch</p>
              <p className="text-lg font-semibold text-gray-900">
                {config.platformFees.transactionFee}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phí rút tiền</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(config.platformFees.withdrawalFee)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rút tối thiểu</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(config.minimumPayoutAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Thời hạn hoàn tiền</p>
              <p className="text-lg font-semibold text-gray-900">
                {config.refundPolicyDays} ngày
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Cài đặt thông báo
          </h2>
          {editingSection !== "notifications" && (
            <button
              onClick={() => handleEdit("notifications")}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>

        {editingSection === "notifications" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Email thông báo
                </p>
                <p className="text-sm text-gray-600">Gửi thông báo qua email</p>
              </div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={tempConfig.notificationSettings.emailNotifications}
                  onChange={(e) =>
                    setTempConfig({
                      ...tempConfig,
                      notificationSettings: {
                        ...tempConfig.notificationSettings,
                        emailNotifications: e.target.checked,
                      },
                    })
                  }
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  SMS thông báo
                </p>
                <p className="text-sm text-gray-600">Gửi thông báo qua SMS</p>
              </div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={tempConfig.notificationSettings.smsNotifications}
                  onChange={(e) =>
                    setTempConfig({
                      ...tempConfig,
                      notificationSettings: {
                        ...tempConfig.notificationSettings,
                        smsNotifications: e.target.checked,
                      },
                    })
                  }
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Push notifications
                </p>
                <p className="text-sm text-gray-600">
                  Thông báo đẩy trên ứng dụng
                </p>
              </div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={tempConfig.notificationSettings.pushNotifications}
                  onChange={(e) =>
                    setTempConfig({
                      ...tempConfig,
                      notificationSettings: {
                        ...tempConfig.notificationSettings,
                        pushNotifications: e.target.checked,
                      },
                    })
                  }
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>
            </div>
            <div className="flex space-x-3 justify-end pt-4 border-t">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleSave("notifications")}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-1"
              >
                <CheckIcon className="w-4 h-4" />
                <span>Lưu</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">Email thông báo</span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  config.notificationSettings.emailNotifications
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {config.notificationSettings.emailNotifications ? "Bật" : "Tắt"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">SMS thông báo</span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  config.notificationSettings.smsNotifications
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {config.notificationSettings.smsNotifications ? "Bật" : "Tắt"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">Push notifications</span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  config.notificationSettings.pushNotifications
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {config.notificationSettings.pushNotifications ? "Bật" : "Tắt"}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Cài đặt bảo mật
          </h2>
          {editingSection !== "security" && (
            <button
              onClick={() => handleEdit("security")}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>

        {editingSection === "security" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian hết hạn phiên (phút)
              </label>
              <input
                type="number"
                min="15"
                max="480"
                value={tempConfig.securitySettings.sessionTimeoutMinutes}
                onChange={(e) =>
                  setTempConfig({
                    ...tempConfig,
                    securitySettings: {
                      ...tempConfig.securitySettings,
                      sessionTimeoutMinutes: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lần đăng nhập tối đa
              </label>
              <input
                type="number"
                min="3"
                max="10"
                value={tempConfig.securitySettings.maxLoginAttempts}
                onChange={(e) =>
                  setTempConfig({
                    ...tempConfig,
                    securitySettings: {
                      ...tempConfig.securitySettings,
                      maxLoginAttempts: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hết hạn mật khẩu (ngày)
              </label>
              <input
                type="number"
                min="30"
                max="365"
                value={tempConfig.securitySettings.passwordExpiryDays}
                onChange={(e) =>
                  setTempConfig({
                    ...tempConfig,
                    securitySettings: {
                      ...tempConfig.securitySettings,
                      passwordExpiryDays: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="col-span-3 flex space-x-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleSave("security")}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-1"
              >
                <CheckIcon className="w-4 h-4" />
                <span>Lưu</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Thời gian hết hạn phiên</p>
              <p className="text-lg font-semibold text-gray-900">
                {config.securitySettings.sessionTimeoutMinutes} phút
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số lần đăng nhập tối đa</p>
              <p className="text-lg font-semibold text-gray-900">
                {config.securitySettings.maxLoginAttempts} lần
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Hết hạn mật khẩu</p>
              <p className="text-lg font-semibold text-gray-900">
                {config.securitySettings.passwordExpiryDays} ngày
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SystemConfiguration;
