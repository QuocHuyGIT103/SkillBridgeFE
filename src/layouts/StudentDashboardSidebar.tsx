import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  StarIcon,
  SparklesIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  UserIcon, // ✅ Thêm UserIcon
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolidIcon,
  MagnifyingGlassIcon as MagnifyingSolidIcon,
  CalendarDaysIcon as CalendarSolidIcon,
  ChatBubbleLeftRightIcon as ChatSolidIcon,
  AcademicCapIcon as AcademicSolidIcon,
  DocumentTextIcon as DocumentSolidIcon,
  StarIcon as StarSolidIcon,
  SparklesIcon as SparklesSolidIcon,
  CogIcon as CogSolidIcon,
  UserIcon as UserSolidIcon, // ✅ Thêm UserSolidIcon
} from "@heroicons/react/24/solid";

interface StudentNavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  children?: StudentNavigationItem[]; // ✅ Thêm children cho submenu
}

interface StudentDashboardSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

const StudentDashboardSidebar: React.FC<StudentDashboardSidebarProps> = ({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]); // ✅ State cho expanded items

  const studentNavigationItems: StudentNavigationItem[] = [
    {
      id: "dashboard",
      label: "Tổng quan",
      icon: "home",
      path: "/student/dashboard",
    },
    {
      id: "smart-search",
      label: "Tìm gia sư thông minh",
      icon: "search",
      path: "/student/smart-search",
    },
    {
      id: "create-post",
      label: "Tạo Bài Đăng",
      icon: "document",
      path: "/student/posts/create",
    },
    {
      id: "my-posts",
      label: "Bài Đăng Của Tôi",
      icon: "academic",
      path: "/student/my-posts",
    },
    // ✅ Thêm Contact Requests menu
    {
      id: "contact-requests",
      label: "Yêu cầu học tập",
      icon: "chat",
      path: "/student/contact-requests",
      badge: 0, // Có thể cập nhật từ store
    },
    {
      id: "schedule",
      label: "Lịch học",
      icon: "calendar",
      path: "/student/schedule",
    },
    {
      id: "messages",
      label: "Tin nhắn",
      icon: "chat",
      path: "/student/messages",
      badge: 3,
    },
    {
      id: "classes",
      label: "Lớp học",
      icon: "academic",
      path: "/student/classes",
    },
    {
      id: "assignments",
      label: "Bài tập",
      icon: "document",
      path: "/student/assignments",
      badge: 5,
    },
    // ✅ Thêm Profile menu với submenu
    {
      id: "profile",
      label: "Hồ sơ của tôi",
      icon: "user",
      path: "/student/profile",
      children: [
        {
          id: "profile-personal",
          label: "Thông tin cá nhân",
          icon: "user",
          path: "/student/profile/personal",
        },
        {
          id: "profile-preferences",
          label: "Sở thích học tập",
          icon: "heart",
          path: "/student/profile/preferences",
        },
      ],
    },
    {
      id: "ratings",
      label: "Đánh giá",
      icon: "star",
      path: "/student/ratings",
    },
    {
      id: "ai-suggestions",
      label: "AI Gợi ý",
      icon: "sparkles",
      path: "/student/ai-suggestions",
    },
    {
      id: "settings",
      label: "Cài đặt",
      icon: "cog",
      path: "/student/settings",
    },
  ];

  // ✅ Function để toggle expanded items
  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getIcon = (iconName: string, isActive: boolean) => {
    const className = `w-6 h-6 ${isActive ? "text-blue-500" : "text-gray-600"}`;

    switch (iconName) {
      case "home":
        return isActive ? (
          <HomeSolidIcon className={className} />
        ) : (
          <HomeIcon className={className} />
        );
      case "search":
        return isActive ? (
          <MagnifyingSolidIcon className={className} />
        ) : (
          <MagnifyingGlassIcon className={className} />
        );
      case "calendar":
        return isActive ? (
          <CalendarSolidIcon className={className} />
        ) : (
          <CalendarDaysIcon className={className} />
        );
      case "chat":
        return isActive ? (
          <ChatSolidIcon className={className} />
        ) : (
          <ChatBubbleLeftRightIcon className={className} />
        );
      case "academic":
        return isActive ? (
          <AcademicSolidIcon className={className} />
        ) : (
          <AcademicCapIcon className={className} />
        );
      case "document":
        return isActive ? (
          <DocumentSolidIcon className={className} />
        ) : (
          <DocumentTextIcon className={className} />
        );
      case "star":
        return isActive ? (
          <StarSolidIcon className={className} />
        ) : (
          <StarIcon className={className} />
        );
      case "sparkles":
        return isActive ? (
          <SparklesSolidIcon className={className} />
        ) : (
          <SparklesIcon className={className} />
        );
      case "cog":
        return isActive ? (
          <CogSolidIcon className={className} />
        ) : (
          <CogIcon className={className} />
        );
      // ✅ Thêm user icon
      case "user":
        return isActive ? (
          <UserSolidIcon className={className} />
        ) : (
          <UserIcon className={className} />
        );
      default:
        return <HomeIcon className={className} />;
    }
  };

  // ✅ Function kiểm tra item active (bao gồm cả children)
  const isItemActive = (item: StudentNavigationItem) => {
    if (location.pathname === item.path) return true;

    // Kiểm tra children
    if (item.children) {
      return item.children.some((child) => location.pathname === child.path);
    }

    return false;
  };

  // ✅ Function kiểm tra có children active không
  const hasActiveChildren = (item: StudentNavigationItem) => {
    if (!item.children) return false;
    return item.children.some((child) => location.pathname === child.path);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <AcademicCapIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SkillBridge
              </span>
              <span className="text-xs text-blue-600 font-medium">
                Học sinh
              </span>
            </div>
          </motion.div>
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-2 rounded-lg hover:bg-blue-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRightIcon className="w-5 h-5 text-blue-600" />
          ) : (
            <Bars3Icon className="w-5 h-5 text-blue-600" />
          )}
        </button>
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-2 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <XMarkIcon className="w-5 h-5 text-blue-600" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-2 px-3">
          {studentNavigationItems.map((item) => {
            const isActive = isItemActive(item);
            const isExpanded = expandedItems.includes(item.id);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.id}>
                {/* Main Item */}
                {hasChildren ? (
                  // ✅ Item với children - clickable để expand/collapse
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${
                      isActive || hasActiveChildren(item)
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {getIcon(item.icon, isActive || hasActiveChildren(item))}
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="font-medium"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </div>
                    {!collapsed && hasChildren && (
                      <ChevronDownIcon
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? "transform rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                ) : (
                  // ✅ Item thường - Link
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 hover:shadow-sm"
                    }`}
                  >
                    {getIcon(item.icon, isActive)}
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 flex items-center justify-between"
                      >
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`px-2 py-1 text-xs font-bold rounded-full ${
                              isActive
                                ? "bg-white/20 text-white backdrop-blur-sm"
                                : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </Link>
                )}

                {/* ✅ Submenu (Children) */}
                {hasChildren && !collapsed && (
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-6 mt-1 space-y-1"
                      >
                        {item.children?.map((child) => {
                          const isChildActive = location.pathname === child.path;
                          return (
                            <Link
                              key={child.id}
                              to={child.path}
                              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                                isChildActive
                                  ? "bg-blue-100 text-blue-700 font-medium"
                                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                              }`}
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                              <span>{child.label}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <Link
          to="/"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-200 hover:shadow-sm"
        >
          <ArrowLeftOnRectangleIcon className="w-6 h-6" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-medium"
            >
              Đăng xuất
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
        className="fixed left-0 top-0 z-30 h-full bg-white/95 backdrop-blur-md shadow-2xl border-r border-blue-100 hidden lg:block"
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
            className="fixed left-0 top-0 z-50 w-64 h-full bg-white/95 backdrop-blur-md shadow-2xl border-r border-blue-100 lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default StudentDashboardSidebar;