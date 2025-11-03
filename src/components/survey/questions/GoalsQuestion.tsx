import React from 'react';
import { motion } from 'framer-motion';
import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import { LEARNING_GOALS } from '../../../types/survey.types';

interface GoalsQuestionProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const GoalsQuestion: React.FC<GoalsQuestionProps> = ({ value, onChange }) => {
  const handleToggleGoal = (goalValue: string) => {
    if (value.includes(goalValue)) {
      onChange(value.filter((g) => g !== goalValue));
    } else {
      onChange([...value, goalValue]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-4 bg-green-100 rounded-full mb-4"
        >
          <RocketLaunchIcon className="w-12 h-12 text-green-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Mục tiêu học tập của bạn?
        </h2>
        <p className="text-gray-600">
          Chọn một hoặc nhiều mục tiêu (có thể chọn nhiều)
        </p>
        <div className="mt-2 text-sm text-green-600 font-semibold">
          Đã chọn: {value.length}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {LEARNING_GOALS.map((goal, index) => {
          const isSelected = value.includes(goal.value);

          return (
            <motion.button
              key={goal.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleToggleGoal(goal.value)}
              className={`
                p-5 rounded-xl border-2 transition-all text-left
                ${
                  isSelected
                    ? 'border-green-500 bg-green-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{goal.icon}</div>
                <div className="flex-1">
                  <h3
                    className={`
                      font-semibold text-lg mb-1
                      ${isSelected ? 'text-green-700' : 'text-gray-800'}
                    `}
                  >
                    {goal.label}
                    {isSelected && (
                      <span className="ml-2 text-green-600">✓</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{goal.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default GoalsQuestion;
