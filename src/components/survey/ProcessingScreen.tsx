import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  BeakerIcon, 
  UserGroupIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface ProcessingScreenProps {
  onComplete?: () => void;
}

const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: BeakerIcon,
      title: 'Phân tích dữ liệu',
      description: 'AI đang phân tích phong cách học tập của bạn...',
      duration: 2000,
    },
    {
      icon: UserGroupIcon,
      title: 'Tìm kiếm gia sư',
      description: 'Đang quét qua hàng trăm hồ sơ gia sư...',
      duration: 2500,
    },
    {
      icon: SparklesIcon,
      title: 'Tính toán độ phù hợp',
      description: 'Đánh giá mức độ phù hợp với từng gia sư...',
      duration: 2000,
    },
    {
      icon: CheckCircleIcon,
      title: 'Hoàn thành',
      description: 'Chuẩn bị kết quả cho bạn...',
      duration: 1500,
    },
  ];

  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, steps[currentStep].duration);

      return () => clearTimeout(timer);
    } else if (currentStep === steps.length - 1 && onComplete) {
      const completeTimer = setTimeout(() => {
        onComplete();
      }, steps[currentStep].duration);

      return () => clearTimeout(completeTimer);
    }
  }, [currentStep, onComplete]);

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Animated Icon */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="inline-block mb-8"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
                <Icon className="w-16 h-16 text-white" />
              </div>
            </motion.div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {currentStepData.title}
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-8">
              {currentStepData.description}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              />
            </div>

            {/* Step Indicator */}
            <p className="text-sm text-gray-500">
              Bước {currentStep + 1} / {steps.length}
            </p>

            {/* Animated Dots */}
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-8 flex justify-center space-x-2"
            >
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Fun Facts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-purple-200"
        >
          <p className="text-sm text-gray-600 text-center">
            💡 <strong>Bạn có biết?</strong> Hệ thống AI của chúng tôi đã giúp{' '}
            <span className="text-purple-600 font-semibold">10,000+</span> học sinh
            tìm được gia sư phù hợp!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ProcessingScreen;
