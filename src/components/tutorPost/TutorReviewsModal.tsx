import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  StarIcon as StarIconOutline,
  XMarkIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid, ClockIcon } from "@heroicons/react/24/solid";
import { classService } from "../../services/class.service";
import type {
  TutorReview,
  TutorReviewsResponse,
} from "../../services/class.service";

interface TutorReviewsModalProps {
  tutorId?: string;
  tutorName?: string;
  open: boolean;
  onClose: () => void;
}

const REVIEWS_PER_PAGE = 5;

const TutorReviewsModal: React.FC<TutorReviewsModalProps> = ({
  tutorId,
  tutorName,
  open,
  onClose,
}) => {
  const [reviews, setReviews] = useState<TutorReview[]>([]);
  const [summary, setSummary] = useState<TutorReviewsResponse["summary"] | null>(
    null
  );
  const [pagination, setPagination] =
    useState<TutorReviewsResponse["pagination"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(
    async (pageToLoad: number, append = false) => {
      if (!tutorId) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await classService.getTutorReviews(tutorId, {
          page: pageToLoad,
          limit: REVIEWS_PER_PAGE,
        });

        setSummary(response.summary);
        setPagination(response.pagination);
        setPage(pageToLoad);
        setReviews((prev) =>
          append ? [...prev, ...response.reviews] : response.reviews
        );
      } catch (err: any) {
        setError(err.message || "Không thể tải danh sách đánh giá");
      } finally {
        setLoading(false);
      }
    },
    [tutorId]
  );

  useEffect(() => {
    if (open && tutorId) {
      fetchReviews(1);
    } else if (!open) {
      setReviews([]);
      setSummary(null);
      setPagination(null);
      setPage(1);
      setError(null);
    }
  }, [open, tutorId, fetchReviews]);

  const handleLoadMore = () => {
    if (pagination?.hasNext) {
      fetchReviews(page + 1, true);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => {
      const Icon = index < Math.round(rating) ? StarIconSolid : StarIconOutline;
      return (
        <Icon
          key={index}
          className={`h-4 w-4 ${
            index < Math.round(rating) ? "text-yellow-400" : "text-gray-200"
          }`}
        />
      );
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Đánh giá từ học viên
                </p>
                <h2 className="text-lg font-semibold text-gray-900">
                  {tutorName || "Gia sư"}
                </h2>
              </div>
              <button
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                onClick={onClose}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-100 p-4 flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Điểm trung bình
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-3xl font-bold text-yellow-600">
                      {summary ? summary.averageRating.toFixed(1) : "0.0"}
                    </span>
                    <div className="flex">{renderStars(summary?.averageRating || 0)}</div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Tổng số đánh giá
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary?.totalReviews?.toLocaleString("vi-VN") || 0}
                  </p>
                </div>
                {summary?.badges?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {summary.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-3 py-1 rounded-full bg-white text-xs font-semibold text-yellow-800 border border-yellow-200 shadow-sm"
                      >
                        {badge === "TOP_RATED"
                          ? "🔥 Top Rated"
                          : badge === "HIGHLY_RATED"
                          ? "⭐ Highly Rated"
                          : badge}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {!loading && reviews.length === 0 && !error && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-8 text-center text-gray-500">
                  Chưa có đánh giá nào cho gia sư này.
                </div>
              )}

              {reviews.map((review) => (
                <div
                  key={`${review.classId}-${review.submittedAt}`}
                  className="rounded-2xl border border-gray-100 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        {review.student.avatar ? (
                          <img
                            src={review.student.avatar}
                            alt={review.student.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.student.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(review.submittedAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm font-semibold text-gray-800">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                      “{review.comment}”
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">
                      {review.classTitle}
                    </span>
                    {review.subjectName && (
                      <>
                        <span>•</span>
                        <span>{review.subjectName}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>
                      {review.completedSessions ?? 0}/{review.totalSessions ?? 0} buổi
                    </span>
                    <span>•</span>
                    <span>
                      {review.learningMode === "ONLINE"
                        ? "Online"
                        : review.learningMode === "OFFLINE"
                        ? "Offline"
                        : "N/A"}
                    </span>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center justify-center py-4 text-sm text-gray-500">
                  <ClockIcon className="w-5 h-5 mr-2 animate-spin text-blue-500" />
                  Đang tải đánh giá...
                </div>
              )}

              {pagination?.hasNext && !loading && (
                <button
                  onClick={handleLoadMore}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  Xem thêm đánh giá
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TutorReviewsModal;

