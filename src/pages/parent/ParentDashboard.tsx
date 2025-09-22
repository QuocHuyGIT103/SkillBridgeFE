import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  PlusIcon,
  AcademicCapIcon,
  ChartBarIcon,
  EyeIcon,
  TrashIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { useStudentStore } from '../../store/student.store';
import CreateStudentModal from '../../components/parent/CreateStudentModal';
import StudentDetailsModal from '../../components/parent/StudentDetailsModal';

const ParentDashboard: React.FC = () => {
  const {
    students,
    stats,
    loading,
    error,
    fetchStudents,
    fetchStudentStats,
    deleteStudent,
    resetPassword,
    setSelectedStudent,
    clearError
  } = useStudentStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudentLocal, setSelectedStudentLocal] = useState<any>(null);

  // ✅ Memoize fetch functions để tránh re-render
  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        fetchStudents(),
        fetchStudentStats()
      ]);
    } catch (error) {
      console.error(' Error loading dashboard data:', error);
    }
  }, [fetchStudents, fetchStudentStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ✅ Safe event handlers với error handling
  const handleViewStudent = useCallback((student: any) => {
    try {
      setSelectedStudentLocal(student);
      setSelectedStudent(student);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error viewing student:', error);
      alert('Có lỗi xảy ra khi xem chi tiết học viên');
    }
  }, [setSelectedStudent]);

  const handleDeleteStudent = useCallback(async (studentId: string) => {
    try {
      if (!studentId) {
        return;
      }

      const confirmed = window.confirm('Bạn có chắc chắn muốn xóa hồ sơ học viên này?');
      if (!confirmed) return;
      await deleteStudent(studentId);
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa học viên. Vui lòng thử lại.');
    }
  }, [deleteStudent]);

  const handleResetPassword = useCallback(async (studentId: string) => {
    try {
      if (!studentId) {
        return;
      }

      const confirmed = window.confirm('Bạn có muốn tạo lại mật khẩu cho học viên này?');
      if (!confirmed) return;
      const result = await resetPassword(studentId);
      
      if (result?.temp_password) {
        alert(`Mật khẩu mới: ${result.temp_password}\nVui lòng lưu lại và chuyển cho học viên.`);
      } else {
        throw new Error('Không nhận được mật khẩu mới từ server');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.');
    }
  }, [resetPassword]);

  const handleOpenCreateModal = useCallback(() => {
    try {
      setShowCreateModal(true);
    } catch (error) {
      console.error('Error opening create modal:', error);
    }
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    try {
      setShowCreateModal(false);
    } catch (error) {
    }
  }, []);

  const handleCloseDetailsModal = useCallback(() => {
    try {
      setShowDetailsModal(false);
      setSelectedStudentLocal(null);
      setSelectedStudent(null);
    } catch (error) {
    }
  }, [setSelectedStudent]);

  // ✅ Render loading state
  if (loading && (!students || students.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý học viên</h1>
          <p className="text-gray-600 mt-1">Quản lý hồ sơ các con em của bạn</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-lg"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Thêm học viên</span>
        </motion.button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-red-800 font-medium">Có lỗi xảy ra</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={() => {
                  clearError();
                  loadData(); // Retry loading data
                }}
                className="text-red-600 hover:text-red-800 text-sm font-medium mt-2"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Tổng học viên</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_students || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <AcademicCapIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_students || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Môn học</p>
                <p className="text-2xl font-bold text-gray-900">{stats.by_subject?.length || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Danh sách học viên</h2>
        </div>
        
        {(!students || students.length === 0) ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có học viên nào</h3>
            <p className="text-gray-600 mb-6">Hãy tạo hồ sơ đầu tiên cho con em của bạn.</p>
            <button
              onClick={handleOpenCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Tạo hồ sơ học viên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Học viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lớp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Môn học
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, index) => (
                  <motion.tr
                    key={student.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {student.avatar_url ? (
                            <img className="h-10 w-10 rounded-full" src={student.avatar_url} alt="" />
                          ) : (
                            <span className="text-sm font-medium text-gray-700">
                              {student.full_name?.charAt(0) || '?'}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.full_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{student.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.grade || 'Chưa cập nhật'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.subjects && student.subjects.length > 0 
                        ? student.subjects.slice(0, 2).join(', ') + (student.subjects.length > 2 ? '...' : '')
                        : 'Chưa chọn'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewStudent(student)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Xem chi tiết"
                          disabled={loading}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(student.id)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-colors"
                          title="Đặt lại mật khẩu"
                          disabled={loading || !student.id}
                        >
                          <KeyIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Xóa"
                          disabled={loading || !student.id}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateStudentModal 
        show={showCreateModal} 
        onClose={handleCloseCreateModal} 
      />
      
      <StudentDetailsModal
        show={showDetailsModal}
        onClose={handleCloseDetailsModal}
        student={selectedStudentLocal}
      />
    </div>
  );
};

export default ParentDashboard;