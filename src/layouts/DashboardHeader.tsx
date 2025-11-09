import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CommandLineIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as BellSolidIcon } from "@heroicons/react/24/solid";
import { useAuthStore } from "../store/auth.store";
import { useDarkMode } from "../hooks/useDarkMode";
import { useNotifications } from "../contexts/NotificationContext";
import type { NotificationItem } from "../types/tutor.types.ts";

interface DashboardHeaderProps {
  onToggleMobileSidebar: () => void;
  sidebarCollapsed: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onToggleMobileSidebar,
}) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { isDark, toggleDarkMode } = useDarkMode();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const path = "/" + pathSegments.slice(0, i + 1).join("/");

      let label = segment.charAt(0).toUpperCase() + segment.slice(1);

      // Customize labels for better UX
      if (segment === "tutor") label = "Bảng điều khiển Gia sư";
      if (segment === "dashboard") label = "Tổng quan";
      if (segment === "profile") label = "Quản lý hồ sơ";
      if (segment === "schedule") label = "Lịch học & Bài giảng";
      if (segment === "academics") label = "Công việc học thuật";
      if (segment === "chat") label = "Tin nhắn";
      if (segment === "finance") label = "Tài chính";

      breadcrumbs.push({ label, path, isLast: i === pathSegments.length - 1 });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    const className = "w-3 h-3";
    switch (type) {
      case "success":
        return <div className={`${className} bg-green-500 rounded-full`} />;
      case "warning":
        return <div className={`${className} bg-yellow-500 rounded-full`} />;
      case "error":
        return <div className={`${className} bg-red-500 rounded-full`} />;
      default:
        return <div className={`${className} bg-blue-500 rounded-full`} />;
    }
  };

  const formatNotificationTime = (timestamp: string | Date) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (isNaN(date.getTime())) return "Vừa xong";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <header className="bg-white shadow-sm border-b border-secondary/20 sticky top-0 z-20">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary/10 transition-colors"
            >
              <Bars3Icon className="w-6 h-6 text-gray-700" />
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden md:flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center">
                  {index > 0 && (
                    <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
                  )}
                  {crumb.isLast ? (
                    <span className="text-primary font-medium">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-gray-600 hover:text-primary transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Center Section - Search */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm học sinh, bài học, tài liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Search button for mobile */}
            <button className="lg:hidden p-2 rounded-lg hover:bg-secondary/10 transition-colors cursor-pointer">
              <MagnifyingGlassIcon className="w-6 h-6 text-gray-700" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-secondary/10 transition-colors cursor-pointer"
              title={
                isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"
              }
            >
              {isDark ? (
                <SunIcon className="w-6 h-6 text-gray-700" />
              ) : (
                <MoonIcon className="w-6 h-6 text-gray-700" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-secondary/10 transition-colors"
              >
                {unreadCount > 0 ? (
                  <BellSolidIcon className="w-6 h-6 text-primary" />
                ) : (
                  <BellIcon className="w-6 h-6 text-gray-700" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">
                          Thông báo
                        </h3>
                        {unreadCount > 0 && (
                          <span className="text-xs text-primary font-medium">
                            {unreadCount} chưa đọc
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <Link
                            key={notification.id}
                            to={notification.actionUrl || notification.data?.actionUrl || "#"}
                            className={`block p-4 hover:bg-gray-50 transition-colors border-l-4 ${notification.read
                                ? "border-transparent"
                                : "border-primary bg-primary/5"
                              }`}
                            onClick={async () => {
                              if (!notification.read) {
                                await markAsRead(notification.id);
                              }
                              setShowNotifications(false);
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-medium ${notification.read
                                      ? "text-gray-700"
                                      : "text-gray-900"
                                    }`}
                                >
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {formatNotificationTime(
                                    notification.created_at || notification.timestamp.toISOString()
                                  )}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <BellIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Chưa có thông báo nào</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-100">
                        <Link
                          to="/tutor/notifications"
                          className="block text-center text-sm text-primary hover:text-primary/80 font-medium"
                          onClick={() => setShowNotifications(false)}
                        >
                          Xem tất cả thông báo
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-secondary/10 transition-colors"
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        {user?.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                            <UserCircleIcon className="w-8 h-8 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {user?.full_name}
                          </p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/tutor/dashboard"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <CommandLineIcon className="w-5 h-5" />
                        <span>Bảng điều khiển</span>
                      </Link>
                      <Link
                        to="/tutor/profile"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <UserCircleIcon className="w-5 h-5" />
                        <span>Hồ sơ của tôi</span>
                      </Link>
                      <Link
                        to="/tutor/profile/settings"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Cog6ToothIcon className="w-5 h-5" />
                        <span>Cài đặt</span>
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
