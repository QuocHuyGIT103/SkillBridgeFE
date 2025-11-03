// Question 8: Learning Pace
import React from 'react';
import { motion } from 'framer-motion';
import { BoltIcon } from '@heroicons/react/24/outline';
import { LEARNING_PACES } from '../../../types/survey.types';

interface LearningPaceQuestionProps {
  value: string;
  onChange: (value: string) => void;
}

const LearningPaceQuestion: React.FC<LearningPaceQuestionProps> = ({
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
          <BoltIcon className="w-12 h-12 text-orange-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Tốc độ học của bạn?
        </h2>
        <p className="text-gray-600">Đánh giá khả năng tiếp thu kiến thức</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {LEARNING_PACES.map((pace, index) => {
          const isSelected = value === pace.value;

          return (
            <motion.button
              key={pace.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onChange(pace.value)}
              className={`
                p-6 rounded-xl border-2 transition-all text-left
                ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{pace.icon}</div>
                <div className="flex-1">
                  <h3
                    className={`
                      font-semibold text-lg mb-1
                      ${isSelected ? 'text-orange-700' : 'text-gray-800'}
                    `}
                  >
                    {pace.label}
                  </h3>
                  <p className="text-sm text-gray-600">{pace.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPaceQuestion;
