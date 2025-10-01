import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePostStore from '../../store/post.store';
import type { IPost } from '../../types';
import { toast } from 'react-hot-toast';
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const StatusBadge: React.FC<{ status: IPost['status'] }> = ({ status }) => {
  const statusMap = {
    pending: { text: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
    approved: { text: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
    rejected: { text: 'Bị từ chối', color: 'bg-red-100 text-red-800' },
  };
  const { text, color } = statusMap[status];
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>{text}</span>;
};

const MyPostsPage: React.FC = () => {
  const { posts: myPosts, isLoading, fetchMyPosts, deletePost } = usePostStore();

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  const handleDelete = async (postId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài đăng này không?')) {
      const success = await deletePost(postId);
      if (success) {
        toast.success('Xóa bài đăng thành công!');
      } else {
        toast.error('Xóa bài đăng thất bại.');
      }
    }
  };

  const postsToRender = myPosts || [];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bài Đăng Của Tôi</h1>
        <button
          onClick={() => fetchMyPosts()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <ArrowPathIcon className="w-5 h-5" />
          <span>Làm mới</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-center text-gray-600 col-span-full">Đang tải...</p>
        ) : postsToRender.length > 0 ? (
          postsToRender.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                    {post.title?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{post.title}</h2>
                    <p className="text-sm text-gray-500">{post.grade_levels?.join(', ') || 'Không xác định'}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{post.content}</p>
                <div className="flex items-center justify-between mb-4">
                  <StatusBadge status={post.status} />
                  <span className="text-sm text-gray-500">{post.location} {post.is_online ? '(Online)' : ''}</span>
                </div>
                {post.status === 'rejected' && post.admin_note && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded mb-4">
                    <strong>Lý do từ chối:</strong> {post.admin_note}
                  </p>
                )}
                <div className="flex justify-end space-x-2">
                  <Link 
                    to={`/student/posts/edit/${post.id}`} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Sửa
                  </Link>
                  <button 
                    onClick={() => handleDelete(post.id)} 
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center">Bạn chưa có bài đăng nào.</p>
        )}
      </div>
    </div>
  );
};

export default MyPostsPage;