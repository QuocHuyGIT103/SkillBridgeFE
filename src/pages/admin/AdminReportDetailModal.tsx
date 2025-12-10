import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  DocumentIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import adminSessionReportService from '../../services/admin/sessionReport.admin.service';
import type { SessionReport, ReportStatus, ReportDecision } from '../../types/sessionReport.types';

interface AdminReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: SessionReport;
  onReportUpdated: () => void;
}

const AdminReportDetailModal: React.FC<AdminReportDetailModalProps> = ({
  isOpen,
  onClose,
  report,
  onReportUpdated,
}) => {
  const [updating, setUpdating] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [resolveData, setResolveData] = useState({
    decision: '' as ReportDecision | '',
    message: '',
  });
  const [noteText, setNoteText] = useState('');

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DISMISSED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="w-5 h-5" />;
      case 'UNDER_REVIEW':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'RESOLVED':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'DISMISSED':
        return <XCircleIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: ReportStatus) => {
    const statusMap = {
      PENDING: 'Chờ xử lý',
      UNDER_REVIEW: 'Đang xem xét',
      RESOLVED: 'Đã giải quyết',
      DISMISSED: 'Đã bác bỏ',
    };
    return statusMap[status] || status;
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <PhotoIcon className="w-5 h-5 text-blue-600" />;
      case 'VIDEO':
        return <VideoCameraIcon className="w-5 h-5 text-purple-600" />;
      case 'DOCUMENT':
        return <DocumentIcon className="w-5 h-5 text-green-600" />;
      default:
        return <DocumentIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleUpdateStatus = async (newStatus: 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED') => {
    try {
      setUpdating(true);
      await adminSessionReportService.updateReportStatus(report._id, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      onReportUpdated();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
  };

  const handleResolve = async () => {
    if (!resolveData.decision || !resolveData.message.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setUpdating(true);
      await adminSessionReportService.resolveReport(report._id, {
        decision: resolveData.decision,
        message: resolveData.message,
      });
      toast.success('Đã giải quyết báo cáo');
      onReportUpdated();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Không thể giải quyết báo cáo');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      toast.error('Vui lòng nhập ghi chú');
      return;
    }

    try {
      setUpdating(true);
      await adminSessionReportService.addNote(report._id, { note: noteText });
      toast.success('Đã thêm ghi chú');
      setNoteText('');
      setShowNoteForm(false);
      onReportUpdated();
    } catch (error: any) {
      toast.error(error.message || 'Không thể thêm ghi chú');
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Chi tiết báo cáo - Buổi #{report.sessionNumber}
              </h2>
              <p className="text-sm text-white/90 mt-1">
                ID: {report._id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors cursor-pointer"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-160px)]">
            {/* Status & Priority */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}>
                  {getStatusIcon(report.status)}
                  {getStatusText(report.status)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  report.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                  report.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  report.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  Mức độ: {report.priority === 'CRITICAL' ? 'Khẩn cấp' : report.priority === 'HIGH' ? 'Cao' : report.priority === 'MEDIUM' ? 'Trung bình' : 'Thấp'}
                </span>
              </div>
            </div>

            {/* Reporter Info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Thông tin người báo cáo</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Tên:</span>
                  <span className="ml-2 text-blue-900">{report.reportedBy.userName}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Vai trò:</span>
                  <span className="ml-2 text-blue-900">
                    {report.reportedBy.role === 'STUDENT' ? 'Học viên' : 'Gia sư'}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Ngày tạo:</span>
                  <span className="ml-2 text-blue-900">
                    {format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Báo cáo về:</span>
                  <span className="ml-2 text-blue-900">
                    {report.reportedAgainst === 'STUDENT' ? 'Học viên' : 'Gia sư'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Nội dung báo cáo</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-800 whitespace-pre-wrap">{report.description}</p>
              </div>
            </div>

            {/* Evidence */}
            {report.evidence.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Bằng chứng ({report.evidence.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.evidence.map((evidence, index) => (
                    <a
                      key={index}
                      href={evidence.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      {getEvidenceIcon(evidence.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {evidence.fileName || `Bằng chứng ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(evidence.uploadedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {report.adminNotes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Ghi chú từ Admin ({report.adminNotes.length})
                </h3>
                <div className="space-y-2">
                  {report.adminNotes.map((note) => (
                    <div key={note._id} className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-gray-900">{note.adminName}</span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(note.createdAt), 'dd/MM HH:mm', { locale: vi })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{note.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution */}
            {report.resolution && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Kết quả xử lý</h3>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-green-900">Quyết định:</span>
                      <span className="ml-2 text-green-800">
                        {report.resolution.decision}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-green-900">Người xử lý:</span>
                      <span className="ml-2 text-green-800">{report.resolution.resolverName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-900">Thời gian:</span>
                      <span className="ml-2 text-green-800">
                        {format(new Date(report.resolution.resolvedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-green-900">Thông báo:</span>
                      <p className="mt-1 text-green-800">{report.resolution.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add Note Form */}
            {showNoteForm && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Thêm ghi chú</h3>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Nhập ghi chú..."
                />
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleAddNote}
                    disabled={updating}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {updating ? 'Đang lưu...' : 'Lưu ghi chú'}
                  </button>
                  <button
                    onClick={() => {
                      setShowNoteForm(false);
                      setNoteText('');
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Resolve Form */}
            {showResolveForm && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Giải quyết báo cáo</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quyết định
                    </label>
                    <select
                      value={resolveData.decision}
                      onChange={(e) => setResolveData({ ...resolveData, decision: e.target.value as ReportDecision })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn quyết định</option>
                      <option value="STUDENT_FAULT">Lỗi của học viên</option>
                      <option value="TUTOR_FAULT">Lỗi của gia sư</option>
                      <option value="BOTH_FAULT">Lỗi của cả hai</option>
                      <option value="NO_FAULT">Không có lỗi</option>
                      <option value="DISMISSED">Bác bỏ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thông báo gửi cho người dùng
                    </label>
                    <textarea
                      value={resolveData.message}
                      onChange={(e) => setResolveData({ ...resolveData, message: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                      placeholder="Nhập thông báo..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResolve}
                      disabled={updating}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {updating ? 'Đang xử lý...' : 'Xác nhận giải quyết'}
                    </button>
                    <button
                      onClick={() => {
                        setShowResolveForm(false);
                        setResolveData({ decision: '', message: '' });
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!showNoteForm && report.status !== 'RESOLVED' && report.status !== 'DISMISSED' && (
                <button
                  onClick={() => setShowNoteForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  Thêm ghi chú
                </button>
              )}
              {report.status === 'PENDING' && (
                <button
                  onClick={() => handleUpdateStatus('UNDER_REVIEW')}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Bắt đầu xem xét
                </button>
              )}
              {!showResolveForm && report.status === 'UNDER_REVIEW' && (
                <button
                  onClick={() => setShowResolveForm(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Giải quyết báo cáo
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminReportDetailModal;
