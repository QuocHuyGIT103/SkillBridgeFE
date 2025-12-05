import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon } from '@heroicons/react/24/outline';

interface StudyFrequencyQuestionProps {
  value: number;
  onChange: (value: number) => void;
}

const FREQUENCY_OPTIONS = [
  { value: 1, label: '1 buổi / tuần', description: 'Ôn nhẹ, duy trì kiến thức' },
  { value: 2, label: '2 buổi / tuần', description: 'Tăng tốc đều, theo sát chương trình' },
  { value: 3, label: '3 buổi / tuần', description: 'Tập trung vượt mục tiêu ngắn hạn' },
  { value: 4, label: '4 buổi / tuần', description: 'Nước rút cho kỳ thi hoặc mất gốc nặng' },
  { value: 5, label: '5+ buổi / tuần', description: 'Luyện chuyên sâu, mục tiêu cao' },
];

const StudyFrequencyQuestion: React.FC<StudyFrequencyQuestionProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-4 bg-orange-100 rounded-full mb-4"
        >
          <ClockIcon className="w-12 h-12 text-orange-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Bạn muốn học bao nhiêu buổi mỗi tuần?
        </h2>
        <p className="text-gray-600">
          Thông tin này giúp chúng tôi lọc các gia sư sẵn sàng đáp ứng tần suất bạn mong muốn.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {FREQUENCY_OPTIONS.map((option, index) => {
          const isSelected = value === option.value;

          return (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onChange(option.value)}
              className={`
                w-full text-left p-4 rounded-xl border-2 transition-all
                ${isSelected ? 'border-orange-500 bg-orange-50 shadow-lg' : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'}
              `}
            >
              <div className="flex items-baseline justify-between">
                <span className={`text-lg font-semibold ${isSelected ? 'text-orange-600' : 'text-gray-800'}`}>
                  {option.label}
                </span>
                {isSelected && <span className="text-orange-500 font-semibold text-sm">Đã chọn</span>}
              </div>
              <p className="mt-2 text-sm text-gray-600">{option.description}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default StudyFrequencyQuestion;

