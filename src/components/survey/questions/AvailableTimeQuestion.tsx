// Question 6: Available Time
import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon } from '@heroicons/react/24/outline';
import { AVAILABLE_TIMES } from '../../../types/survey.types';

interface AvailableTimeQuestionProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const AvailableTimeQuestion: React.FC<AvailableTimeQuestionProps> = ({
  value,
  onChange,
}) => {
  const handleToggleTime = (timeValue: string) => {
    if (value.includes(timeValue)) {
      onChange(value.filter((t) => t !== timeValue));
    } else {
      onChange([...value, timeValue]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-4 bg-yellow-100 rounded-full mb-4"
        >
          <ClockIcon className="w-12 h-12 text-yellow-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Bạn có thời gian học khi nào?
        </h2>
        <p className="text-gray-600">Chọn các khung giờ phù hợp</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {AVAILABLE_TIMES.map((time, index) => {
          const isSelected = value.includes(time.value);

          return (
            <motion.button
              key={time.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleToggleTime(time.value)}
              className={`
                p-5 rounded-xl border-2 transition-all text-center
                ${
                  isSelected
                    ? 'border-yellow-500 bg-yellow-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-yellow-300 hover:shadow-md'
                }
              `}
            >
              <div className="text-4xl mb-2">{time.icon}</div>
              <h3
                className={`
                  font-semibold text-lg mb-1
                  ${isSelected ? 'text-yellow-700' : 'text-gray-800'}
                `}
              >
                {time.label}
                {isSelected && <span className="ml-2 text-yellow-600">✓</span>}
              </h3>
              <p className="text-sm text-gray-600">{time.time}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default AvailableTimeQuestion;
