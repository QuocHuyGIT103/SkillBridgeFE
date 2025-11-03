import React from 'react';
import { motion } from 'framer-motion';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { TEACHING_MODES } from '../../../types/survey.types';

interface TeachingModeQuestionProps {
  value: string;
  onChange: (value: string) => void;
}

const TeachingModeQuestion: React.FC<TeachingModeQuestionProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-4 bg-indigo-100 rounded-full mb-4"
        >
          <GlobeAltIcon className="w-12 h-12 text-indigo-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Hình thức học bạn mong muốn?
        </h2>
        <p className="text-gray-600">Chọn một hình thức học tập</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {TEACHING_MODES.map((mode, index) => {
          const isSelected = value === mode.value;

          return (
            <motion.button
              key={mode.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onChange(mode.value)}
              className={`
                p-6 rounded-xl border-2 transition-all text-center
                ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                }
              `}
            >
              <div className="text-5xl mb-3">{mode.icon}</div>
              <h3
                className={`
                  font-semibold text-lg mb-2
                  ${isSelected ? 'text-indigo-700' : 'text-gray-800'}
                `}
              >
                {mode.label}
              </h3>
              <p className="text-sm text-gray-600">{mode.description}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default TeachingModeQuestion;
