import React from "react";
import TutorPostSearch from "../components/tutorPost/TutorPostSearch";

const TutorSearchPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Tìm gia sư phù hợp
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Kết nối với hàng nghìn gia sư chất lượng, tìm người dạy phù hợp
                với nhu cầu học tập của bạn
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  1000+
                </div>
                <div className="text-sm text-gray-600">Gia sư đã xác thực</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  50+
                </div>
                <div className="text-sm text-gray-600">Môn học đa dạng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  95%
                </div>
                <div className="text-sm text-gray-600">Học viên hài lòng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  24/7
                </div>
                <div className="text-sm text-gray-600">Hỗ trợ trực tuyến</div>
              </div>
            </div>
          </div>

          {/* Search Component */}
          <div className="mb-12">
            <TutorPostSearch showFilters={true} compact={false} />
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Tại sao chọn SkillBridge?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Gia sư đã xác thực
                </h3>
                <p className="text-gray-600 text-sm">
                  Tất cả gia sư đều được kiểm tra kỹ lưỡng về trình độ và kinh
                  nghiệm
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Học tập hiệu quả
                </h3>
                <p className="text-gray-600 text-sm">
                  Phương pháp giảng dạy cá nhân hóa, phù hợp với từng học viên
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Giá cả hợp lý
                </h3>
                <p className="text-gray-600 text-sm">
                  Đa dạng mức giá, phù hợp với mọi điều kiện kinh tế
                </p>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Cách thức hoạt động
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Tìm kiếm</h3>
                <p className="text-sm text-gray-600">
                  Sử dụng bộ lọc để tìm gia sư phù hợp
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Xem hồ sơ</h3>
                <p className="text-sm text-gray-600">
                  Xem chi tiết thông tin và kinh nghiệm
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Liên hệ</h3>
                <p className="text-sm text-gray-600">
                  Liên hệ trực tiếp với gia sư
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  4
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Bắt đầu học
                </h3>
                <p className="text-sm text-gray-600">
                  Thỏa thuận và bắt đầu học tập
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorSearchPage;
