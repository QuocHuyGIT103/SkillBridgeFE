import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  UserIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  UserIcon as UserSolidIcon,
  CalendarIcon as CalendarSolidIcon,
  ChatBubbleLeftRightIcon as ChatSolidIcon,
  CurrencyDollarIcon as CurrencySolidIcon,
  AcademicCapIcon as AcademicSolidIcon,
  HomeIcon as HomeSolidIcon,
  DocumentTextIcon as DocumentSolidIcon,
} from "@heroicons/react/24/solid";
import type { NavigationItem } from "../types/tutor.types.ts";

interface DashboardSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Tổng quan",
      icon: "home",
      path: "/tutor/dashboard",
    },
    {
      id: "profile",
      label: "Quản lý hồ sơ",
      icon: "user",
      path: "/tutor/profile",
      children: [
        {
          id: "profile-personal",
          label: "Hồ sơ của tôi",
          path: "/tutor/profile/personal",
        },
        {
          id: "profile-education",
          label: "Học vấn & Chứng chỉ",
          path: "/tutor/profile/education",
        },
      ],
    },
    {
      id: "schedule",
      label: "Lịch học & Quản lý bài giảng",
      icon: "calendar",
      path: "/tutor/schedule",
      children: [
        {
          id: "schedule-calendar",
          label: "Xem lịch",
          path: "/tutor/schedule/calendar",
        },
        {
          id: "schedule-availability",
          label: "Thiết lập lịch rảnh",
          path: "/tutor/schedule/availability",
        },
        {
          id: "schedule-lessons",
          label: "Quản lý bài học",
          path: "/tutor/schedule/lessons",
        },
        {
          id: "contact-requests",
          label: "Yêu cầu học tập",
          path: "/tutor/contact-requests",
          badge: 3,
        },
        {
          id: "schedule-history",
          label: "Lịch sử bài học",
          path: "/tutor/schedule/history",
        },
      ],
    },
    {
      id: "posts",
      label: "Quản lý bài đăng",
      icon: "document",
      path: "/tutor/posts",
      children: [
        {
          id: "posts-list",
          label: "Danh sách bài đăng",
          path: "/tutor/posts",
        },
        {
          id: "posts-student",
          label: "Tìm học viên",
          path: "/tutor/posts/student",
        },
        {
          id: "posts-create",
          label: "Tạo bài đăng mới",
          path: "/tutor/posts/create",
        },
      ],
    },
    {
      id: "academics",
      label: "Công việc học thuật",
      icon: "academic",
      path: "/tutor/academics",
      children: [
        {
          id: "academics-students",
          label: "Học sinh của tôi",
          path: "/tutor/academics/students",
        },
        {
          id: "academics-classes",
          label: "Quản lý lớp học",
          path: "/tutor/classes",
        },
        {
          id: "academics-assignments",
          label: "Quản lý bài tập",
          path: "/tutor/assignments",
        },
        {
          id: "academics-exercise-bank",
          label: "Kho bài tập",
          path: "/tutor/exercise-bank",
        },
        {
          id: "academics-curriculum",
          label: "Lập kế hoạch giảng dạy",
          path: "/tutor/academics/curriculum",
        },
        {
          id: "academics-materials",
          label: "Tài liệu học tập",
          path: "/tutor/academics/materials",
        },
        {
          id: "academics-assessments",
          label: "Đánh giá & Chấm điểm",
          path: "/tutor/academics/assessments",
        },
        {
          id: "academics-progress",
          label: "Tiến độ học sinh",
          path: "/tutor/academics/progress",
        },
        {
          id: "academics-reports",
          label: "Báo cáo & Phân tích",
          path: "/tutor/academics/reports",
        },
      ],
    },
    {
      id: "chat",
      label: "Tin nhắn & Chat",
      icon: "chat",
      path: "/tutor/messages",
      badge: 5,
      children: [
        {
          id: "chat-conversations",
          label: "Tất cả cuộc hội thoại",
          path: "/tutor/messages/conversations",
        },
        {
          id: "chat-students",
          label: "Tin nhắn học sinh",
          path: "/tutor/messages/students",
          badge: 3,
        },
        {
          id: "chat-announcements",
          label: "Thông báo",
          path: "/tutor/messages/announcements",
        },
        {
          id: "chat-support",
          label: "Hỗ trợ chat",
          path: "/tutor/messages/support",
          badge: 1,
        },
      ],
    },
    {
      id: "finance",
      label: "Quản lý tài chính",
      icon: "currency",
      path: "/tutor/finance",
      children: [
        {
          id: "finance-earnings",
          label: "Tổng quan thu nhập",
          path: "/tutor/finance/earnings",
        },
        {
          id: "finance-transactions",
          label: "Lịch sử giao dịch",
          path: "/tutor/finance/transactions",
        },
        {
          id: "finance-payouts",
          label: "Thanh toán & Rút tiền",
          path: "/tutor/finance/payouts",
        },
        {
          id: "finance-pricing",
          label: "Giá cả & Mức phí",
          path: "/tutor/finance/pricing",
        },
        {
          id: "finance-invoices",
          label: "Hóa đơn",
          path: "/tutor/finance/invoices",
        },
        {
          id: "finance-taxes",
          label: "Tài liệu thuế",
          path: "/tutor/finance/taxes",
        },
      ],
    },
  ];

  const getIcon = (iconName: string, isActive: boolean) => {
    const className = `w-6 h-6 ${isActive ? "text-accent" : "text-secondary"}`;

    switch (iconName) {
      case "home":
        return isActive ? (
          <HomeSolidIcon className={className} />
        ) : (
          <HomeIcon className={className} />
        );
      case "user":
        return isActive ? (
          <UserSolidIcon className={className} />
        ) : (
          <UserIcon className={className} />
        );
      case "calendar":
        return isActive ? (
          <CalendarSolidIcon className={className} />
        ) : (
          <CalendarIcon className={className} />
        );
      case "chat":
        return isActive ? (
          <ChatSolidIcon className={className} />
        ) : (
          <ChatBubbleLeftRightIcon className={className} />
        );
      case "currency":
        return isActive ? (
          <CurrencySolidIcon className={className} />
        ) : (
          <CurrencyDollarIcon className={className} />
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

  const isItemActive = (item: NavigationItem) => {
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
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
            title="Về trang chủ"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <AcademicCapIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-primary">SkillBridge</span>
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
          {navigationItems.map((item) => {
            const isActive = isItemActive(item);
            const isExpanded = expandedItems.has(item.id);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.id} className="space-y-1">
                <div
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-700 hover:bg-secondary/10 hover:text-primary"
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
                          <span className="px-2 py-1 text-xs font-bold bg-accent text-primary rounded-full">
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
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isChildActive(child.path)
                            ? "bg-accent text-primary font-medium"
                            : "text-gray-600 hover:bg-secondary/5 hover:text-primary"
                            }`}
                        >
                          <span>{child.label}</span>
                          {child.badge && (
                            <span className="px-1.5 py-0.5 text-xs font-bold bg-primary text-white rounded-full">
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
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-secondary/10 hover:text-primary transition-all duration-200"
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

export default DashboardSidebar;
