import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePostStore from '../../store/post.store.ts';
import {
  ArrowLeftIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const StatusBadge: React.FC<{ status: 'pending' | 'approved' | 'rejected' }> = ({ status }) => {
    const statusMap = {
      pending: { text: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
      approved: { text: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
      rejected: { text: 'Bị từ chối', color: 'bg-red-100 text-red-800' },
    };
    const { text, color } = statusMap[status] || { text: 'Không rõ', color: 'bg-gray-100 text-gray-800'};
    return <span className={`px-2.5 py-1 text-sm font-medium rounded-full ${color}`}>{text}</span>;
};

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 w-6 h-6 mt-1 text-gray-500">{icon}</div>
        <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-base text-gray-900 font-semibold">{value}</p>
        </div>
    </div>
);


const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedPost, isLoading, error, getPostById } = usePostStore();

  useEffect(() => {
    if (id) {
      getPostById(id);
    }
  }, [id, getPostById]);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-600">Đang tải chi tiết bài đăng...</div>;
  }

  if (error || !selectedPost) {
    return (
        <div className="p-8 text-center bg-white rounded-lg shadow-md max-w-lg mx-auto mt-10">
            <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-red-500" />
            <h2 className="mt-4 text-xl font-bold text-gray-800">Không tìm thấy bài đăng</h2>
            <p className="mt-2 text-gray-600">{error || 'Bài đăng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.'}</p>
            <button
                onClick={() => navigate(-1)}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center mx-auto"
            >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Quay lại
            </button>
        </div>
    );
  }
  
  const { title, content, status, subjects, grade_levels, hourly_rate, availability, requirements, location, is_online, admin_note, created_at } = selectedPost;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
                        <div className="mt-2 flex items-center gap-4 flex-wrap">
                            <StatusBadge status={status} />
                            <p className="text-sm text-gray-500">
                                Tạo ngày: {new Date(created_at).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex-shrink-0 flex items-center"
                    >
                         <ArrowLeftIcon className="w-5 h-5 mr-2" />
                         <span>Quay lại</span>
                    </button>
                </div>
                {status === 'rejected' && admin_note && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                            <strong className="font-semibold">Lý do từ chối:</strong> {admin_note}
                        </p>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-6 space-y-8">
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Yêu cầu chi tiết</h2>
                    <div className="space-y-4">
                        <DetailItem icon={<BookOpenIcon />} label="Môn học" value={(subjects || []).join(', ')} />
                        <DetailItem icon={<AcademicCapIcon />} label="Lớp/Trình độ" value={(grade_levels || []).join(', ')} />
                        {requirements && (
                            <DetailItem icon={<ChatBubbleBottomCenterTextIcon />} label="Yêu cầu thêm cho gia sư" value={requirements} />
                        )}
                        <div className="prose prose-sm text-gray-700 max-w-none bg-gray-50 p-4 rounded-md border">
                            <p className="font-semibold text-gray-500">Mô tả chi tiết:</p>
                            <p>{content}</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Lịch học và chi phí</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailItem 
                            icon={<CurrencyDollarIcon />} 
                            label="Học phí mong muốn (mỗi buổi)" 
                            value={`${(hourly_rate?.min || 0).toLocaleString('vi-VN')}đ - ${(hourly_rate?.max || 0).toLocaleString('vi-VN')}đ`} 
                        />
                         <DetailItem 
                            icon={<ClockIcon />} 
                            label="Lịch học dự kiến" 
                            value={availability || 'Linh hoạt'} 
                        />
                    </div>
                </section>
                
                 <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Địa điểm</h2>
                    <DetailItem 
                        icon={<MapPinIcon />} 
                        label="Hình thức & Địa điểm" 
                        value={is_online && !location ? 'Chỉ học trực tuyến (Online)' : is_online ? `Linh hoạt Online & Trực tiếp tại: ${location}` : `Học trực tiếp tại: ${location}`} 
                    />
                </section>

            </div>
        </div>
    </div>
  );
};

export default PostDetailPage;

