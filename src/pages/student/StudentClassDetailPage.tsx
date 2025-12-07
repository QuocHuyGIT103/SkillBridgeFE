import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useClassStore } from "../../store/class.store";
import ClassStatusBadge from "../../components/common/ClassStatusBadge";
import { motion } from "framer-motion";
// Thêm import icons từ heroicons
import {
  ArrowLeftIcon,
  InformationCircleIcon,
  AcademicCapIcon, // Icon cho gia sư
  DocumentTextIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon,
  PencilSquareIcon,
  VideoCameraIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"; // Icon ngôi sao (đầy)
import RatingModal from "../../components/modals/RatingModal";

const StudentClassDetailPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { fetchClassById, currentClass, loading } = useClassStore();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [reviewDraft, setReviewDraft] = useState<{
    rating?: number;
    comment?: string;
  } | null>(null);

  useEffect(() => {
    if (classId) {
      fetchClassById(classId);
    }
  }, [classId, fetchClassById]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // --- Not Found State (Làm đẹp hơn) ---
  if (!currentClass) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
        <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-3">
            Lớp học không tồn tại
          </h2>
          <p className="text-gray-600 mb-6">
            Không thể tìm thấy thông tin lớp học này.
          </p>
          <button
            onClick={() => navigate("/student/classes")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const handleOpenReviewModal = () => {
    setReviewDraft(null);
    setShowRatingModal(true);
  };

  const handleEditReview = () => {
    if (!currentClass?.studentReview) return;
    setReviewDraft({
      rating: currentClass.studentReview.rating,
      comment: currentClass.studentReview.comment || "",
    });
    setShowRatingModal(true);
  };

  const handleCloseRatingModal = () => {
    setShowRatingModal(false);
    setReviewDraft(null);
  };

  // --- Main Detail Page ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Chi tiết lớp học</h1>
          </div>
          <button
            onClick={() => navigate("/student/classes")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại
          </button>
        </motion.div>

        {/* Main Content Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            {/* Card Header: Title, Status, Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {currentClass.title}
                </h2>
                <ClassStatusBadge status={currentClass.status} />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {/* Xem lịch học Button */}
                <Link
                  to="/student/schedule"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
                >
                  <CalendarDaysIcon className="h-5 w-5" />
                  Xem lịch học
                </Link>

                {/* Payment Button - Only show for active classes with unpaid balance */}
                {currentClass.status === "ACTIVE" &&
                  currentClass.paymentStatus !== "COMPLETED" && (
                    <button
                      onClick={() =>
                        navigate(`/student/classes/${classId}/payment`)
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
                    >
                      <BanknotesIcon className="h-5 w-5" />
                      Thanh toán
                    </button>
                  )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT: Class Info */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                    <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                    Thông tin lớp học
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-blue-100">
                      <dt className="text-sm text-gray-600">Môn học</dt>
                      <dd className="text-sm font-semibold text-gray-900">
                        {currentClass.subject?.name}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-100">
                      <dt className="text-sm text-gray-600">Hình thức</dt>
                      <dd className="text-sm">
                        {currentClass.learningMode === "ONLINE" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            <VideoCameraIcon className="h-3.5 w-3.5" />
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            <MapPinIcon className="h-3.5 w-3.5" />
                            Trực tiếp
                          </span>
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-100">
                      <dt className="text-sm text-gray-600">Tổng số buổi</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {currentClass.totalSessions} buổi
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-100">
                      <dt className="text-sm text-gray-600">Đã hoàn thành</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        <span className="text-emerald-600">{currentClass.completedSessions}</span> / {currentClass.totalSessions} buổi
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-100">
                      <dt className="text-sm text-gray-600">Giá/buổi</dt>
                      <dd className="text-sm font-bold text-blue-600">
                        {currentClass.pricePerSession?.toLocaleString("vi-VN")} VND
                      </dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-sm text-gray-600">Tổng học phí</dt>
                      <dd className="text-base font-bold text-emerald-600">
                        {currentClass.totalAmount?.toLocaleString("vi-VN")} VND
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Schedule */}
                {currentClass.schedule && (
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-100">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                      <CalendarDaysIcon className="h-5 w-5 text-purple-600" />
                      Lịch học
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <ClockIcon className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {currentClass.schedule.dayOfWeek
                              .map((day) => {
                                const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
                                return days[day];
                              })
                              .join(", ")}
                          </p>
                          <p className="text-sm text-gray-600">
                            {currentClass.schedule.startTime} - {currentClass.schedule.endTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-purple-100">
                        <CalendarDaysIcon className="h-5 w-5 text-purple-600" />
                        <div className="text-sm">
                          <span className="text-gray-600">Bắt đầu: </span>
                          <span className="font-medium text-gray-900">
                            {new Date(currentClass.startDate).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                      {currentClass.expectedEndDate && (
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="h-5 w-5 text-purple-600" />
                          <div className="text-sm">
                            <span className="text-gray-600">Kết thúc: </span>
                            <span className="font-medium text-gray-900">
                              {new Date(currentClass.expectedEndDate).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: Tutor Info */}
              <div className="space-y-6">
                {/* Tutor Info */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                    <AcademicCapIcon className="h-5 w-5 text-emerald-600" />
                    Thông tin gia sư
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    {currentClass.tutorId?.avatar_url ? (
                      <img
                        src={currentClass.tutorId.avatar_url}
                        alt={currentClass.tutorId.full_name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-emerald-200"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-emerald-200 flex items-center justify-center">
                        <AcademicCapIcon className="h-7 w-7 text-emerald-700" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        {currentClass.tutorId?.full_name}
                      </p>
                      <p className="text-sm text-emerald-600">Gia sư</p>
                    </div>
                  </div>
                  <dl className="space-y-2">
                    <div className="flex justify-between py-2 border-t border-emerald-100">
                      <dt className="text-sm text-emerald-700">Email</dt>
                      <dd className="text-sm text-gray-900">
                        {currentClass.tutorId?.email}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-t border-emerald-100">
                      <dt className="text-sm text-emerald-700">Số điện thoại</dt>
                      <dd className="text-sm text-gray-900">
                        {currentClass.tutorId?.phone_number || "Không có"}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Location - OFFLINE */}
                {currentClass.learningMode === "OFFLINE" && currentClass.location && (
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border border-red-100">
                    <h3 className="text-base font-semibold text-gray-900 mb-3 inline-flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5 text-red-600" />
                      Địa điểm học
                    </h3>
                    <p className="text-gray-900 text-sm">{currentClass.location.address}</p>
                  </div>
                )}

                {/* Online Meeting Link */}
                {currentClass.learningMode === "ONLINE" && currentClass.onlineInfo?.meetingLink && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
                    <h3 className="text-base font-semibold text-gray-900 mb-3 inline-flex items-center gap-2">
                      <VideoCameraIcon className="h-5 w-5 text-blue-600" />
                      Học trực tuyến
                    </h3>
                    <a
                      href={currentClass.onlineInfo.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium text-sm shadow-md hover:shadow-lg"
                    >
                      <VideoCameraIcon className="h-5 w-5" />
                      Tham gia lớp học Online
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Description Section */}
            {currentClass.description && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 mb-3 inline-flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                  Mô tả lớp học
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {currentClass.description}
                  </p>
                </div>
              </div>
            )}

            {/* Review Section */}
            {currentClass.status === "COMPLETED" && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                  <StarIcon className="h-5 w-5 text-yellow-500" />
                  Đánh giá của bạn
                </h3>
                {currentClass.studentReview ? (
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) =>
                          i < (currentClass.studentReview?.rating || 0) ? (
                            <StarIconSolid
                              key={i}
                              className="w-5 h-5 text-yellow-400"
                            />
                          ) : (
                            <StarIcon
                              key={i}
                              className="w-5 h-5 text-gray-300"
                            />
                          )
                        )}
                        <span className="ml-2 text-sm font-medium text-gray-600">
                          {currentClass.studentReview.rating}/5
                        </span>
                      </div>
                      <button
                        onClick={handleEditReview}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Chỉnh sửa
                      </button>
                    </div>
                    {currentClass.studentReview.comment && (
                      <p className="text-gray-700 italic text-sm">
                        "{currentClass.studentReview.comment}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-5 rounded-xl text-center border border-gray-100">
                    <p className="text-gray-600 mb-4 text-sm">
                      Bạn chưa đánh giá lớp học này.
                    </p>
                    <button
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl hover:from-yellow-600 hover:to-amber-600 transition-all font-semibold text-sm shadow-md"
                      onClick={handleOpenReviewModal}
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                      Đánh giá ngay
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Rating Modal */}
        {classId && (
          <RatingModal
            classId={classId}
            classTitle={currentClass.title}
            tutorName={currentClass.tutorId?.full_name}
            open={showRatingModal}
            initialRating={reviewDraft?.rating}
            initialComment={reviewDraft?.comment}
            onClose={handleCloseRatingModal}
          />
        )}
      </div>
    </div>
  );
};

export default StudentClassDetailPage;
