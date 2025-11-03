import React from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  AcademicCapIcon, 
  ClockIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface WelcomeScreenProps {
  onStart: () => void;
  onSkip?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onSkip }) => {
  const benefits = [
    {
      icon: SparklesIcon,
      title: 'AI Phân Tích Thông Minh',
      description: 'Hệ thống AI phân tích phong cách học tập và đề xuất gia sư phù hợp nhất',
    },
    {
      icon: AcademicCapIcon,
      title: 'Gợi Ý Cá Nhân Hóa',
      description: 'Nhận được danh sách gia sư được chọn lọc dựa trên nhu cầu riêng của bạn',
    },
    {
      icon: ClockIcon,
      title: 'Tiết Kiệm Thời Gian',
      description: 'Không cần tìm kiếm thủ công, AI sẽ làm mọi thứ cho bạn chỉ trong 2 phút',
    },
    {
      icon: CheckCircleIcon,
      title: 'Kết Quả Chính Xác',
      description: 'Độ chính xác cao với thuật toán học máy và dữ liệu thực tế',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <SparklesIcon className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold mb-2"
            >
              Khảo Sát AI Onboarding
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-purple-100"
            >
              Giúp chúng tôi hiểu bạn hơn để tìm gia sư hoàn hảo
            </motion.p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Benefits Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Survey Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
            >
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                Khảo sát này bao gồm:
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-blue-600" />
                  9 câu hỏi ngắn gọn về mục tiêu học tập
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-blue-600" />
                  Ước tính thời gian: <strong className="ml-1">2-3 phút</strong>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-blue-600" />
                  Kết quả: Danh sách 10 gia sư phù hợp nhất + Phân tích AI
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-blue-600" />
                  Bạn có thể làm lại khảo sát bất cứ lúc nào
                </li>
              </ul>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={onStart}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <SparklesIcon className="w-6 h-6" />
                <span>Bắt Đầu Khảo Sát</span>
              </button>

              {onSkip && (
                <button
                  onClick={onSkip}
                  className="px-6 py-4 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Bỏ qua (Làm sau)
                </button>
              )}
            </motion.div>
          </div>
        </div>

        {/* Privacy Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-sm text-gray-500 mt-4"
        >
          🔒 Thông tin của bạn được bảo mật và chỉ dùng để cải thiện gợi ý
        </motion.p>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
