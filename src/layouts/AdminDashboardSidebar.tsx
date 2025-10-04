import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  BellIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolidIcon,
  UserGroupIcon as UserGroupSolidIcon,
  CurrencyDollarIcon as CurrencySolidIcon,
  ChartBarIcon as ChartSolidIcon,
  CogIcon as CogSolidIcon,
  ShieldCheckIcon as ShieldSolidIcon,
  ExclamationTriangleIcon as ExclamationSolidIcon,
  CalendarDaysIcon as CalendarSolidIcon,
  DocumentTextIcon as DocumentSolidIcon,
  BellIcon as BellSolidIcon,
} from "@heroicons/react/24/solid";
import type { AdminNavigationItem } from "../types/admin.types";

interface AdminDashboardSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

const AdminDashboardSidebar: React.FC<AdminDashboardSidebarProps> = ({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const adminNavigationItems: AdminNavigationItem[] = [
    {
      id: "dashboard",
      label: "Tổng quan",
      icon: "home",
      path: "/admin/dashboard",
    },
    {
      id: "user-management",
      label: "Quản lý người dùng",
      icon: "users",
      path: "/admin/users",
      children: [
        {
          id: "users-list",
          label: "Danh sách người dùng",
          path: "/admin/users/list",
        },
        {
          id: "users-students",
          label: "Học sinh",
          path: "/admin/users/students",
        },
        {
          id: "users-tutors",
          label: "Gia sư",
          path: "/admin/users/tutors",
        },
        {
          id: "users-blocked",
          label: "Tài khoản bị khóa",
          path: "/admin/users/blocked",
          badge: 3,
        },
        {
          id: "users-reports",
          label: "Báo cáo người dùng",
          path: "/admin/users/reports",
        },
      ],
    },
    {
      id: "authentication",
      label: "Xác thực & Chất lượng",
      icon: "shield",
      path: "/admin/authentication",
      children: [
        {
          id: "tutor-approval",
          label: "Duyệt hồ sơ gia sư",
          path: "/admin/authentication/tutor-approval",
          badge: 12,
        },
        {
          id: "verification-approval",
          label: "Duyệt xác thực bằng cấp",
          path: "/admin/authentication/verification-approval",
        },
        {
          id: "verification-history",
          label: "Lịch sử xác thực bằng cấp",
          path: "/admin/authentication/verification-history",
        },
      ],
    },
    {
      id: "operations",
      label: "Quản lý vận hành",
      icon: "calendar",
      path: "/admin/operations",
      children: [
        {
          id: "sessions-tracking",
          label: "Theo dõi buổi học",
          path: "/admin/operations/sessions",
        },
        {
          id: "sessions-ongoing",
          label: "Buổi học đang diễn ra",
          path: "/admin/operations/sessions/ongoing",
          badge: 5,
        },
        {
          id: "sessions-history",
          label: "Lịch sử buổi học",
          path: "/admin/operations/sessions/history",
        },
        {
          id: "session-analytics",
          label: "Phân tích buổi học",
          path: "/admin/operations/analytics",
        },
      ],
    },
    {
      id: "posts",
      label: "Quản lý Bài Đăng",
      icon: "document",
      path: "/admin/posts",
      children: [
        {
          id: "post-review",
          label: "Duyệt Bài Đăng",
          path: "/admin/posts/review",
        },
      ],
    },
    {
      id: "transactions",
      label: "Quản lý giao dịch",
      icon: "currency",
      path: "/admin/transactions",
      children: [
        {
          id: "transaction-overview",
          label: "Tổng quan giao dịch",
          path: "/admin/transactions/overview",
        },
        {
          id: "payments",
          label: "Thanh toán",
          path: "/admin/transactions/payments",
        },
        {
          id: "withdrawals",
          label: "Yêu cầu rút tiền",
          path: "/admin/transactions/withdrawals",
          badge: 7,
        },
        {
          id: "refunds",
          label: "Hoàn tiền",
          path: "/admin/transactions/refunds",
          badge: 2,
        },
        {
          id: "commission",
          label: "Hoa hồng hệ thống",
          path: "/admin/transactions/commission",
        },
        {
          id: "financial-reports",
          label: "Báo cáo tài chính",
          path: "/admin/transactions/reports",
        },
      ],
    },
    {
      id: "complaints",
      label: "Xử lý khiếu nại",
      icon: "exclamation",
      path: "/admin/complaints",
      badge: 15,
      children: [
        {
          id: "complaints-pending",
          label: "Khiếu nại chờ xử lý",
          path: "/admin/complaints/pending",
          badge: 15,
        },
        {
          id: "complaints-investigating",
          label: "Đang điều tra",
          path: "/admin/complaints/investigating",
          badge: 5,
        },
        {
          id: "complaints-resolved",
          label: "Đã xử lý",
          path: "/admin/complaints/resolved",
        },
        {
          id: "complaints-dismissed",
          label: "Đã bác bỏ",
          path: "/admin/complaints/dismissed",
        },
        {
          id: "complaints-analytics",
          label: "Phân tích khiếu nại",
          path: "/admin/complaints/analytics",
        },
      ],
    },
    {
      id: "reports",
      label: "Báo cáo & Phân tích",
      icon: "chart",
      path: "/admin/reports",
      children: [
        {
          id: "revenue-reports",
          label: "Báo cáo doanh thu",
          path: "/admin/reports/revenue",
        },
        {
          id: "user-analytics",
          label: "Phân tích người dùng",
          path: "/admin/reports/users",
        },
        {
          id: "session-statistics",
          label: "Thống kê buổi học",
          path: "/admin/reports/sessions",
        },
        {
          id: "growth-metrics",
          label: "Chỉ số tăng trưởng",
          path: "/admin/reports/growth",
        },
        {
          id: "performance-dashboard",
          label: "Bảng điều khiển hiệu suất",
          path: "/admin/reports/performance",
        },
        {
          id: "custom-reports",
          label: "Báo cáo tùy chỉnh",
          path: "/admin/reports/custom",
        },
      ],
    },
    {
      id: "content",
      label: "Quản lý nội dung",
      icon: "document",
      path: "/admin/content",
      children: [
        {
          id: "static-pages",
          label: "Trang tĩnh",
          path: "/admin/content/pages",
        },
        {
          id: "privacy-policy",
          label: "Chính sách bảo mật",
          path: "/admin/content/privacy",
        },
        {
          id: "terms-service",
          label: "Điều khoản dịch vụ",
          path: "/admin/content/terms",
        },
        {
          id: "faq-management",
          label: "Quản lý FAQ",
          path: "/admin/content/faq",
        },
        {
          id: "announcements",
          label: "Thông báo hệ thống",
          path: "/admin/content/announcements",
        },
      ],
    },
    {
      id: "configuration",
      label: "Cấu hình hệ thống",
      icon: "cog",
      path: "/admin/config",
      children: [
        {
          id: "system-settings",
          label: "Cài đặt hệ thống",
          path: "/admin/config/system",
        },
        {
          id: "commission-settings",
          label: "Cài đặt hoa hồng",
          path: "/admin/config/commission",
        },
        {
          id: "payment-settings",
          label: "Cài đặt thanh toán",
          path: "/admin/config/payment",
        },
        {
          id: "refund-policy",
          label: "Chính sách hoàn tiền",
          path: "/admin/config/refund",
        },
        {
          id: "notification-settings",
          label: "Cài đặt thông báo",
          path: "/admin/config/notifications",
        },
        {
          id: "security-settings",
          label: "Cài đặt bảo mật",
          path: "/admin/config/security",
        },
      ],
    },
    {
      id: "notifications",
      label: "Thông báo hàng loạt",
      icon: "bell",
      path: "/admin/notifications",
      children: [
        {
          id: "send-notification",
          label: "Gửi thông báo",
          path: "/admin/notifications/send",
        },
        {
          id: "notification-templates",
          label: "Mẫu thông báo",
          path: "/admin/notifications/templates",
        },
        {
          id: "notification-history",
          label: "Lịch sử thông báo",
          path: "/admin/notifications/history",
        },
        {
          id: "notification-analytics",
          label: "Phân tích thông báo",
          path: "/admin/notifications/analytics",
        },
      ],
    },
  ];

  const getIcon = (iconName: string, isActive: boolean) => {
    const className = `w-6 h-6 ${isActive ? "text-red-500" : "text-secondary"}`;

    switch (iconName) {
      case "home":
        return isActive ? (
          <HomeSolidIcon className={className} />
        ) : (
          <HomeIcon className={className} />
        );
      case "users":
        return isActive ? (
          <UserGroupSolidIcon className={className} />
        ) : (
          <UserGroupIcon className={className} />
        );
      case "shield":
        return isActive ? (
          <ShieldSolidIcon className={className} />
        ) : (
          <ShieldCheckIcon className={className} />
        );
      case "calendar":
        return isActive ? (
          <CalendarSolidIcon className={className} />
        ) : (
          <CalendarDaysIcon className={className} />
        );
      case "currency":
        return isActive ? (
          <CurrencySolidIcon className={className} />
        ) : (
          <CurrencyDollarIcon className={className} />
        );
      case "exclamation":
        return isActive ? (
          <ExclamationSolidIcon className={className} />
        ) : (
          <ExclamationTriangleIcon className={className} />
        );
      case "chart":
        return isActive ? (
          <ChartSolidIcon className={className} />
        ) : (
          <ChartBarIcon className={className} />
        );
      case "document":
        return isActive ? (
          <DocumentSolidIcon className={className} />
        ) : (
          <DocumentTextIcon className={className} />
        );
      case "cog":
        return isActive ? (
          <CogSolidIcon className={className} />
        ) : (
          <CogIcon className={className} />
        );
      case "bell":
        return isActive ? (
          <BellSolidIcon className={className} />
        ) : (
          <BellIcon className={className} />
        );
      default:
        return <HomeIcon className={className} />;
    }
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isItemActive = (item: AdminNavigationItem) => {
    if (location.pathname === item.path) return true;
    if (item.children) {
      return item.children.some((child) => location.pathname === child.path);
    }
    return false;
  };

  const isChildActive = (childPath: string) => location.pathname === childPath;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary/20">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-red-600">
                Admin Panel
              </span>
              <span className="text-xs text-gray-500">SkillBridge</span>
            </div>
          </motion.div>
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-2 rounded-lg hover:bg-secondary/10 transition-colors"
        >
          {collapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <Bars3Icon className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-2 rounded-lg hover:bg-secondary/10 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-2 px-3">
          {adminNavigationItems.map((item) => {
            const isActive = isItemActive(item);
            const isExpanded = expandedItems.has(item.id);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.id} className="space-y-1">
                <div
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${
                    isActive
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-gray-700 hover:bg-red-50 hover:text-red-600"
                  }`}
                  onClick={() => {
                    if (hasChildren) {
                      toggleExpanded(item.id);
                      if (collapsed) {
                        onToggleCollapse();
                      }
                    } else {
                      navigate(item.path);
                    }
                  }}
                >
                  {getIcon(item.icon, isActive)}
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex-1 flex items-center justify-between"
                    >
                      <span className="font-medium">{item.label}</span>
                      <div className="flex items-center space-x-2">
                        {item.badge && (
                          <span
                            className={`px-2 py-1 text-xs font-bold rounded-full ${
                              isActive
                                ? "bg-white text-red-600"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {hasChildren && (
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDownIcon className="w-4 h-4" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Sub-navigation */}
                <AnimatePresence>
                  {hasChildren && isExpanded && !collapsed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-9 space-y-1"
                    >
                      {item.children?.map((child) => (
                        <Link
                          key={child.id}
                          to={child.path}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isChildActive(child.path)
                              ? "bg-red-100 text-red-600 font-medium"
                              : "text-gray-600 hover:bg-red-50 hover:text-red-600"
                          }`}
                        >
                          <span>{child.label}</span>
                          {child.badge && (
                            <span className="px-1.5 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full">
                              {child.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-secondary/20">
        <Link
          to="/"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <ArrowLeftOnRectangleIcon className="w-6 h-6" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-medium"
            >
              Trở về trang chủ
            </motion.span>
          )}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 z-30 h-full bg-white shadow-xl border-r border-secondary/20 hidden lg:block"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed left-0 top-0 z-50 w-64 h-full bg-white shadow-xl border-r border-secondary/20 lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminDashboardSidebar;
