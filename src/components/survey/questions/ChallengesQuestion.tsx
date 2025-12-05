import React from 'react';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { STUDY_CHALLENGES } from '../../../types/survey.types';

interface ChallengesQuestionProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const MAX_SELECTION = 3;

const ChallengesQuestion: React.FC<ChallengesQuestionProps> = ({
  value,
  onChange,
}) => {
  const toggleChallenge = (challenge: string) => {
    if (value.includes(challenge)) {
      onChange(value.filter((item) => item !== challenge));
      return;
    }

    if (value.length >= MAX_SELECTION) {
      return;
    }

    onChange([...value, challenge]);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-4 bg-red-100 rounded-full mb-4"
        >
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Bạn đang gặp khó khăn gì lớn nhất?
        </h2>
        <p className="text-gray-600">
          Chọn tối đa {MAX_SELECTION} vấn đề mô tả đúng tình trạng hiện tại để chúng tôi ghép cặp với gia sư phù hợp.
        </p>
        <div className="mt-2 text-sm text-purple-600 font-semibold">
          Đã chọn: {value.length}/{MAX_SELECTION}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {STUDY_CHALLENGES.map((challenge, index) => {
          const isSelected = value.includes(challenge.value);
          const isDisabled = !isSelected && value.length >= MAX_SELECTION;

          return (
            <motion.button
              key={challenge.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => !isDisabled && toggleChallenge(challenge.value)}
              disabled={isDisabled}
              className={`
                text-left p-4 rounded-xl border-2 transition-all
                ${
                  isSelected
                    ? 'border-red-400 bg-red-50 shadow-md'
                    : isDisabled
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-red-200 hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${isSelected ? 'text-red-600' : 'text-gray-800'}`}>
                  {challenge.label}
                </span>
                {isSelected && <span className="text-red-500 font-semibold text-sm">✓</span>}
              </div>
              <p className="mt-2 text-sm text-gray-600">{challenge.description}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ChallengesQuestion;

