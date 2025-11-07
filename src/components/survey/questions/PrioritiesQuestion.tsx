// Question 9: Priorities
import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { PRIORITIES } from '../../../types/survey.types';

interface PrioritiesQuestionProps {
  value: {
    experience: number;
    qualification: number;
    communication: number;
    price: number;
    location: number;
  };
  onChange: (value: any) => void;
}

const PrioritiesQuestion: React.FC<PrioritiesQuestionProps> = ({
  value,
  onChange,
}) => {
  const handleRatingChange = (key: string, rating: number) => {
    onChange({ ...value, [key]: rating });
  };

  const StarRating: React.FC<{
    label: string;
    description: string;
    value: number;
    onChange: (rating: number) => void;
  }> = ({ label, description, value, onChange }) => {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-semibold text-gray-800">{label}</h4>
            <p className="text-xs text-gray-600">{description}</p>
          </div>
          <span className="text-sm font-bold text-purple-600">{value}/5</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => onChange(rating)}
              className="transition-transform hover:scale-110"
            >
              {rating <= value ? (
                <StarSolidIcon className="w-8 h-8 text-yellow-400" />
              ) : (
                <StarIcon className="w-8 h-8 text-gray-300 hover:text-yellow-300" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-4 bg-purple-100 rounded-full mb-4"
        >
          <StarIcon className="w-12 h-12 text-purple-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Ưu tiên của bạn là gì?
        </h2>
        <p className="text-gray-600">
          Đánh giá mức độ quan trọng từ 1 đến 5 sao
        </p>
      </div>

      <div className="space-y-4">
        {PRIORITIES.map((priority, index) => (
          <motion.div
            key={priority.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StarRating
              label={priority.label}
              description={priority.description}
              value={value[priority.key as keyof typeof value]}
              onChange={(rating) => handleRatingChange(priority.key, rating)}
            />
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Càng đánh giá cao một yếu tố, AI sẽ càng ưu tiên
          tìm gia sư phù hợp với tiêu chí đó.
        </p>
      </div>
    </div>
  );
};

export default PrioritiesQuestion;
