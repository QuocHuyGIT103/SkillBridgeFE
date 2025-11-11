import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import usePostStore from "../../store/post.store";
import {
  ArrowLeftIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  BookOpenIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 w-6 h-6 mt-1 text-gray-500">{icon}</div>
    <div className="ml-3">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-base text-gray-900 font-semibold">{value}</p>
    </div>
  </div>
);

const TutorStudentPostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedPost, isLoading, error, getPostById } = usePostStore();

  useEffect(() => {
    if (id) getPostById(id);
  }, [id, getPostById]);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-600">Đang tải chi tiết...</div>;
  }

  if (error || !selectedPost) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow-md max-w-lg mx-auto mt-10">
        <h2 className="mt-2 text-xl font-bold text-gray-800">Không tìm thấy bài đăng</h2>
        <p className="mt-1 text-gray-600">
          {error || "Bài đăng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
        </p>
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

  const { title, content, subjects, grade_levels, hourly_rate, availability, location, is_online, author_id } =
    selectedPost as any;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
            <div className="mt-2 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden ring-1 ring-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                {(() => {
                  const src =
                    (author_id as any)?.avatar_url ||
                    (author_id as any)?.avatarUrl ||
                    author_id?.avatar ||
                    "";
                  if (src) {
                    return <img src={src} alt="avatar" className="w-full h-full object-cover" />;
                  }
                  const name = author_id?.full_name || "";
                  const initials = name
                    .split(" ")
                    .map((p: string) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "U";
                  return <span>{initials}</span>;
                })()}
              </div>
              <div className="text-sm text-gray-600 truncate">Người đăng: {author_id?.full_name || "N/A"}</div>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link
              to={`/tutor/posts/student/${id}/request`}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Gửi đề nghị dạy
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <ArrowLeftIcon className="w-5 h-5 inline mr-2" />
              Quay lại
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Mô tả</h2>
            <div className="prose prose-sm text-gray-700 max-w-none bg-gray-50 p-4 rounded-md border">
              <p>{content}</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Yêu cầu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem icon={<BookOpenIcon />} label="Môn học" value={(subjects || []).join(", ")} />
              <DetailItem icon={<AcademicCapIcon />} label="Lớp/Trình độ" value={(grade_levels || []).join(", ")} />
              <DetailItem
                icon={<CurrencyDollarIcon />}
                label="Học phí mong muốn"
                value={`${(hourly_rate?.min || 0).toLocaleString("vi-VN")}đ - ${(hourly_rate?.max || 0).toLocaleString("vi-VN")}đ`}
              />
              <DetailItem icon={<ClockIcon />} label="Thời gian" value={availability || "Linh hoạt"} />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Hình thức & Địa điểm</h2>
            <DetailItem
              icon={<MapPinIcon />}
              label="Hình thức"
              value={is_online ? "Online hoặc linh hoạt" : "Học trực tiếp"}
            />
            {location && <div className="mt-2 text-gray-700">{location}</div>}
          </section>
        </div>
      </div>
    </div>
  );
};

export default TutorStudentPostDetailPage;


