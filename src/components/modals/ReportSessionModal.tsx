import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  VideoCameraIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import sessionReportService from "../../services/sessionReport.service";
import type { ReportPriority } from "../../types/sessionReport.types";

interface ReportSessionModalProps {
  classId: string;
  sessionNumber: number;
  sessionDate: string;
  sessionDuration: number;
  onClose: () => void;
  onSuccess: () => void;
}

const ReportSessionModal: React.FC<ReportSessionModalProps> = ({
  classId,
  sessionNumber,
  sessionDate,
  sessionDuration,
  onClose,
  onSuccess,
}) => {
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<ReportPriority>("MEDIUM");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const timeRemaining = sessionReportService.getReportTimeRemaining(
    sessionDate,
    sessionDuration
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file count
    if (evidenceFiles.length + files.length > 5) {
      toast.error("Bạn chỉ có thể tải lên tối đa 5 tệp bằng chứng");
      return;
    }

    // Validate file size (20MB each)
    const invalidFiles = files.filter((file) => file.size > 20 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error("Mỗi tệp không được vượt quá 20MB");
      return;
    }

    setEvidenceFiles((prev) => [...prev, ...files]);

    // Reset input
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <PhotoIcon className="w-5 h-5 text-blue-500" />;
    } else if (file.type.startsWith("video/")) {
      return <VideoCameraIcon className="w-5 h-5 text-purple-500" />;
    } else {
      return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error("Vui lòng mô tả vấn đề");
      return;
    }

    if (description.trim().length < 10) {
      toast.error("Mô tả phải có ít nhất 10 ký tự");
      return;
    }

    if (description.trim().length > 2000) {
      toast.error("Mô tả không được vượt quá 2000 ký tự");
      return;
    }

    setLoading(true);

    try {
      await sessionReportService.createReport(
        {
          classId,
          sessionNumber,
          reportedAgainst: "TUTOR",
          description: description.trim(),
          priority,
        },
        evidenceFiles
      );

      toast.success("Báo cáo đã được gửi thành công!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Create report error:", error);
      toast.error(error.message || "Không thể gửi báo cáo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    {
      value: "LOW",
      label: "Thấp",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
    {
      value: "MEDIUM",
      label: "Trung bình",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      value: "HIGH",
      label: "Cao",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      value: "CRITICAL",
      label: "Khẩn cấp",
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">
                Báo cáo buổi học #{sessionNumber}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Warning Banner */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-6 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <span className="font-semibold">Lưu ý:</span> Bạn chỉ có thể
                  báo cáo <span className="font-bold">1 lần duy nhất</span> cho
                  mỗi buổi học.
                  {timeRemaining > 0 && (
                    <span>
                      {" "}
                      Còn <span className="font-bold">
                        {timeRemaining} giờ
                      </span>{" "}
                      để báo cáo.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]"
          >
            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mô tả vấn đề <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Vui lòng mô tả chi tiết vấn đề xảy ra trong buổi học..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                maxLength={2000}
              />
              <p className="text-sm text-gray-500 mt-1 text-right">
                {description.length}/2000 ký tự
              </p>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mức độ ưu tiên
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value as ReportPriority)}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      priority === option.value
                        ? `${option.bgColor} border-current ${option.color}`
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Evidence Files */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bằng chứng (tối đa 5 tệp)
              </label>

              {/* Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={evidenceFiles.length >= 5}
                className="w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center space-y-2"
              >
                <CloudArrowUpIcon className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {evidenceFiles.length >= 5
                    ? "Đã đạt giới hạn 5 tệp"
                    : "Nhấp để tải lên ảnh, video hoặc tài liệu"}
                </span>
                <span className="text-xs text-gray-500">
                  Hỗ trợ: JPG, PNG, MP4, PDF... (tối đa 20MB/tệp)
                </span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* File List */}
              {evidenceFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {evidenceFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {getFileIcon(file)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="ml-3 p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                loading || !description.trim() || description.trim().length < 10
              }
              className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Đang gửi...</span>
                </>
              ) : (
                <span>Gửi báo cáo</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReportSessionModal;
