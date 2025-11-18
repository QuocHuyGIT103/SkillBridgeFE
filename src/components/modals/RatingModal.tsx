import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    StarIcon as StarIconOutline,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useClassStore } from '../../store/class.store';

interface RatingModalProps {
    classId: string;
    classTitle?: string;
    tutorName?: string;
    open: boolean;
    onClose: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
    classId,
    classTitle,
    tutorName,
    open,
    onClose,
}) => {
    const { addReview } = useClassStore();
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!rating) {
            // Đơn giản: chặn nếu chưa chọn sao
            return;
        }

        try {
            setSubmitting(true);
            await addReview(classId, rating, comment.trim());
            onClose();
            // Reset state sau khi đóng (lần mở sau sẽ sạch)
            setRating(0);
            setHoverRating(0);
            setComment('');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md rounded-xl bg-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Đánh giá lớp học
                                </h2>
                                {classTitle && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {classTitle}
                                        {tutorName ? ` • ${tutorName}` : ''}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-5">
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-800 mb-2">
                                    Bạn hài lòng với lớp học này ở mức nào?
                                </p>
                                <div className="flex items-center justify-center gap-1.5">
                                    {[1, 2, 3, 4, 5].map((value) => {
                                        const isActive =
                                            (hoverRating || rating) && value <= (hoverRating || rating);
                                        const Icon = isActive ? StarIconSolid : StarIconOutline;
                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                className="p-1"
                                                onMouseEnter={() => setHoverRating(value)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(value)}
                                            >
                                                <Icon
                                                    className={`h-8 w-8 ${isActive
                                                            ? 'text-yellow-400'
                                                            : 'text-gray-300 hover:text-yellow-300'
                                                        } transition-colors`}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    {rating ? `${rating}/5 sao` : 'Chọn số sao để đánh giá'}
                                </p>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Nhận xét (không bắt buộc)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    maxLength={1000}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                    placeholder="Hãy chia sẻ cảm nhận của bạn về buổi học, phong cách giảng dạy của gia sư, v.v..."
                                />
                                <div className="mt-1 text-right text-xs text-gray-400">
                                    {comment.length}/1000
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting || !rating}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                            >
                                {submitting && (
                                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-white" />
                                )}
                                <span>{submitting ? 'Đang gửi...' : 'Gửi đánh giá'}</span>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RatingModal;


