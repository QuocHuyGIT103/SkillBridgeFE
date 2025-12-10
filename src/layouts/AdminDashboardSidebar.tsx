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
    },
    {
      id: "authentication",
      label: "Xác thực & Chất lượng",
      icon: "shield",
      path: "/admin/verification-approval",
    },
    {
      id: "posts",
      label: "Quản lý Bài Đăng",
      icon: "document",
      path: "/admin/posts/review",
    },
    {
      id: "transactions",
      label: "Quản lý giao dịch",
      icon: "currency",
      path: "/admin/transactions",
    },
    {
      id: "session-reports",
      label: "Xử lý báo cáo",
      icon: "exclamation",
      path: "/admin/session-reports",
    },
    {
      id: "notifications",
      label: "Thông báo hàng loạt",
      icon: "bell",
      path: "/admin/notifications",
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
