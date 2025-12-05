import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import usePostStore from '../../store/post.store';
import type { IPost } from '../../types';
import { toast } from 'react-hot-toast';
import { 
    ArrowPathIcon, 
    EyeIcon, 
    PencilIcon, 
    TrashIcon, 
    PlusIcon,
    AcademicCapIcon,
    BookOpenIcon,
    CalendarDaysIcon,
    InformationCircleIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";
import { AISmartSearchButton } from '../../components/ai';

// ==================== CONSTANTS ====================
const ITEMS_PER_PAGE = 6;

const STATUS_CONFIG = {
  all: {
    label: 'Tất cả',
    icon: '📋',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    activeGradient: 'from-blue-500 to-indigo-500',
  },
  approved: {
    label: 'Đã duyệt',
    icon: '✅',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    activeGradient: 'from-emerald-500 to-green-500',
  },
  pending: {
    label: 'Chờ duyệt',
    icon: '⏳',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    activeGradient: 'from-amber-500 to-orange-500',
  },
  rejected: {
    label: 'Bị từ chối',
    icon: '❌',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    activeGradient: 'from-red-500 to-rose-500',
  },
};

// ==================== COMPONENTS ====================
const StatusBadge: React.FC<{ status: IPost['status']; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const config = {
    pending: { 
      text: 'Chờ duyệt', 
      className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30',
      icon: ClockIcon,
    },
    approved: { 
      text: 'Đã duyệt', 
      className: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-500/30',
      icon: CheckCircleIcon,
    },
    rejected: { 
      text: 'Bị từ chối', 
      className: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-500/30',
      icon: XCircleIcon,
    },
  };
  
  const statusInfo = config[status] || { 
    text: 'Không rõ', 
    className: 'bg-gray-500 text-white',
    icon: InformationCircleIcon,
  };
  const Icon = statusInfo.icon;
  
  const sizeClasses = size === 'sm' 
    ? 'px-2.5 py-1 text-xs gap-1' 
    : 'px-3 py-1.5 text-xs gap-1.5';
  
  return (
    <span className={`inline-flex items-center font-bold rounded-full shadow-lg ${sizeClasses} ${statusInfo.className}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {statusInfo.text}
    </span>
  );
};

const PostCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-1.5 bg-gradient-to-r from-gray-200 to-gray-300"></div>
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-start gap-3">
        <div className="h-6 bg-gray-200 rounded-lg flex-1"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-12 bg-gray-200 rounded-lg"></div>
      <div className="flex gap-2">
        <div className="h-9 bg-gray-200 rounded-lg flex-1"></div>
        <div className="h-9 bg-gray-200 rounded-lg flex-1"></div>
        <div className="h-9 bg-gray-200 rounded-lg flex-1"></div>
      </div>
    </div>
  </div>
);

const EmptyState: React.FC = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16 px-8 bg-white rounded-2xl border-2 border-dashed border-gray-200"
  >
    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
      <DocumentTextIcon className="w-10 h-10 text-blue-600" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">Bạn chưa có bài đăng nào</h3>
    <p className="text-gray-500 mb-8 max-w-md mx-auto">
      Hãy tạo một yêu cầu tìm gia sư để nhận được sự hỗ trợ tốt nhất từ các gia sư trên hệ thống.
    </p>
    <Link 
      to="/student/posts/create" 
      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg shadow-blue-500/25"
    >
      <PlusIcon className="w-5 h-5"/>
      Tạo yêu cầu tìm gia sư
    </Link>
  </motion.div>
);

// ==================== MAIN COMPONENT ====================
const MyPostsPage: React.FC = () => {
  const { posts: myPosts, isLoading, error, fetchMyPosts, deletePost } = usePostStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery]);

  const handleDelete = (postId: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-medium text-gray-800">Bạn có chắc chắn muốn xóa bài đăng này không?</p>
        <div className="flex gap-3">
          <button
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold transition-colors shadow-sm"
            onClick={() => {
              toast.dismiss(t.id);
              deletePost(postId); 
            }}
          >
            Xác nhận Xóa
          </button>
          <button
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-semibold transition-colors"
            onClick={() => toast.dismiss(t.id)}
          >
            Hủy
          </button>
        </div>
      </div>
    ));
  };

  // Filter posts
  const filteredPosts = useMemo(() => {
    return (myPosts || []).filter(post => {
      const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
      const matchesSearch = !searchQuery || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [myPosts, filterStatus, searchQuery]);

  // Pagination
  const paginatedData = useMemo(() => {
    const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const posts = filteredPosts.slice(startIndex, endIndex);
    
    return {
      posts,
      totalPages,
      totalItems: filteredPosts.length,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    };
  }, [filteredPosts, currentPage]);

  // Status counts
  const statusCounts = useMemo(() => ({
    all: myPosts?.length || 0,
    approved: myPosts?.filter(p => p.status === 'approved').length || 0,
    pending: myPosts?.filter(p => p.status === 'pending').length || 0,
    rejected: myPosts?.filter(p => p.status === 'rejected').length || 0,
  }), [myPosts]);

  const getStatusBarColor = (status: string) => {
    switch (status) {
      case 'approved': return 'from-emerald-400 via-green-500 to-emerald-600';
      case 'pending': return 'from-amber-400 via-orange-500 to-amber-600';
      case 'rejected': return 'from-red-400 via-rose-500 to-red-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ==================== HEADER ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Bài Đăng Của Tôi
                </h1>
              </div>
              <p className="text-gray-600 ml-14">
                Quản lý các yêu cầu tìm gia sư của bạn
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link 
                to="/student/posts/create" 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                <PlusIcon className="w-5 h-5"/>
                Tạo yêu cầu mới
              </Link>
              <button
                onClick={() => fetchMyPosts()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium shadow-sm"
                disabled={isLoading}
              >
                <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Làm mới</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ==================== FILTER TABS ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                const count = statusCounts[key as keyof typeof statusCounts];
                const isActive = filterStatus === key;
                
                return (
                  <button
                    key={key}
                    onClick={() => setFilterStatus(key)}
                    className={`
                      relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                      ${isActive 
                        ? `bg-gradient-to-r ${config.activeGradient} text-white shadow-md` 
                        : `${config.bgColor} ${config.color} hover:shadow-sm border ${config.borderColor}`
                      }
                    `}
                  >
                    <span className="text-base">{config.icon}</span>
                    <span>{config.label}</span>
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-bold
                      ${isActive ? 'bg-white/25 text-white' : 'bg-white text-gray-700'}
                    `}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ==================== SEARCH & INFO BAR ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài đăng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-sm"
            />
          </div>
          
          {filteredPosts.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2.5 rounded-xl border border-gray-100">
              <span>Hiển thị</span>
              <span className="font-bold text-blue-600">{paginatedData.posts.length}</span>
              <span>trong</span>
              <span className="font-bold text-gray-900">{paginatedData.totalItems}</span>
              <span>bài đăng</span>
            </div>
          )}
        </motion.div>

        {/* ==================== ERROR ==================== */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-200 flex items-center gap-3"
          >
            <XCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* ==================== CONTENT ==================== */}
        {isLoading && !myPosts?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <PostCardSkeleton key={i} />)}
          </div>
        ) : paginatedData.posts.length > 0 ? (
          <>
            {/* Posts Grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {paginatedData.posts.map((post, index) => (
                  <motion.div 
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col"
                  >
                    {/* Status Bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${getStatusBarColor(post.status)}`}></div>
                    
                    <div className="p-5 flex flex-col flex-1">
                      {/* Header: Title + Status */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <h2 className="font-bold text-base text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors flex-1 leading-snug">
                          {post.title}
                        </h2>
                        <StatusBadge status={post.status} size="sm" />
                      </div>
                      
                      {/* Key Info - Highlighted */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-3 border border-purple-100">
                          <div className="flex items-center gap-2 mb-1">
                            <AcademicCapIcon className="w-4 h-4 text-purple-600"/>
                            <span className="text-xs font-medium text-purple-600">Lớp</span>
                          </div>
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {post.grade_levels?.join(', ') || 'Chưa rõ'}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-100">
                          <div className="flex items-center gap-2 mb-1">
                            <BookOpenIcon className="w-4 h-4 text-blue-600"/>
                            <span className="text-xs font-medium text-blue-600">Môn học</span>
                          </div>
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {post.subjects?.join(', ') || 'Chưa rõ'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Date */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <CalendarDaysIcon className="w-4 h-4"/>
                        <span>Ngày tạo: <span className="font-medium text-gray-700">{new Date(post.created_at).toLocaleDateString('vi-VN')}</span></span>
                      </div>
                      
                      {/* Content Preview */}
                      {post.content && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed flex-1">
                          {post.content}
                        </p>
                      )}
                      
                      {/* Rejection Note */}
                      {post.status === 'rejected' && post.admin_note && (
                        <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-100">
                          <div className="flex items-start gap-2">
                            <InformationCircleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"/>
                            <div className="text-xs">
                              <p className="font-bold text-red-700 mb-0.5">Lý do từ chối:</p>
                              <p className="text-red-600 line-clamp-2">{post.admin_note}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Spacer */}
                      <div className="flex-grow"></div>
                      
                      {/* AI Button for approved posts */}
                      {post.status === 'approved' && (
                        <div className="mb-3">
                          <AISmartSearchButton 
                            postId={post.id}
                            variant="secondary"
                            size="sm"
                            fullWidth
                          />
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <Link 
                          to={`/student/posts/${post.id}`} 
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-2 text-xs bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all font-medium"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                          Chi tiết
                        </Link>

                        <Link 
                          to={`/student/posts/edit/${post.id}`} 
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-2 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all font-medium"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                          Sửa
                        </Link>

                        <button 
                          onClick={() => handleDelete(post.id)} 
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-2 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all font-medium"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* ==================== PAGINATION ==================== */}
            {paginatedData.totalPages > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                {/* Info */}
                <p className="text-sm text-gray-600">
                  Trang <span className="font-bold text-gray-900">{currentPage}</span> / <span className="font-bold text-gray-900">{paginatedData.totalPages}</span>
                </p>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={!paginatedData.hasPrev}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>

                  {Array.from({ length: paginatedData.totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (paginatedData.totalPages <= 5) return true;
                      if (page === 1 || page === paginatedData.totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, idx, arr) => {
                      const showEllipsis = idx > 0 && arr[idx - 1] !== page - 1;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`
                              min-w-[40px] h-10 rounded-lg font-medium text-sm transition-all
                              ${currentPage === page
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                : 'border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                              }
                            `}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(paginatedData.totalPages, prev + 1))}
                    disabled={!paginatedData.hasNext}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Per Page Info */}
                <p className="text-sm text-gray-500">
                  {ITEMS_PER_PAGE} bài/trang
                </p>
              </motion.div>
            )}
          </>
        ) : (myPosts?.length || 0) === 0 ? (
          <EmptyState />
        ) : (
          /* No Results from Filter */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-white rounded-2xl border border-gray-100"
          >
            <FunnelIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Không tìm thấy bài đăng</h3>
            <p className="text-gray-500 mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <button
              onClick={() => {
                setFilterStatus('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Xóa bộ lọc
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyPostsPage;
