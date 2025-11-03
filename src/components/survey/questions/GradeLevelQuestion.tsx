import React from 'react';
import { motion } from 'framer-motion';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { GRADE_LEVELS } from '../../../types/survey.types';

interface GradeLevelQuestionProps {
  value: string;
  onChange: (value: string) => void;
}

const GradeLevelQuestion: React.FC<GradeLevelQuestionProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-4 bg-purple-100 rounded-full mb-4"
        >
          <AcademicCapIcon className="w-12 h-12 text-purple-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Bạn đang học lớp nào?
        </h2>
        <p className="text-gray-600">
          Chọn cấp độ học tập hiện tại của bạn
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {GRADE_LEVELS.map((level, index) => (
          <motion.button
            key={level.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onChange(level.value)}
            className={`
              p-4 rounded-xl border-2 transition-all text-center
              ${
                value === level.value
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
              }
            `}
          >
            <div
              className={`
                text-3xl mb-2
                ${value === level.value ? 'scale-110' : ''}
                transition-transform
              `}
            >
              🎓
            </div>
            <div
              className={`
                font-semibold
                ${value === level.value ? 'text-purple-600' : 'text-gray-700'}
              `}
            >
              {level.label}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default GradeLevelQuestion;
