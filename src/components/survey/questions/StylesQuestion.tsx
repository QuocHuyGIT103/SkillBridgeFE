// Question 5: Teaching Styles
import React from 'react';
import { motion } from 'framer-motion';
import { PaintBrushIcon } from '@heroicons/react/24/outline';
import { TEACHING_STYLES } from '../../../types/survey.types';

interface StylesQuestionProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const StylesQuestion: React.FC<StylesQuestionProps> = ({ value, onChange }) => {
  const handleToggleStyle = (styleValue: string) => {
    if (value.includes(styleValue)) {
      onChange(value.filter((s) => s !== styleValue));
    } else {
      onChange([...value, styleValue]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-4 bg-pink-100 rounded-full mb-4"
        >
          <PaintBrushIcon className="w-12 h-12 text-pink-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Phong cách dạy bạn ưa thích?
        </h2>
        <p className="text-gray-600">Chọn một hoặc nhiều phong cách</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {TEACHING_STYLES.map((style, index) => {
          const isSelected = value.includes(style.value);

          return (
            <motion.button
              key={style.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleToggleStyle(style.value)}
              className={`
                p-5 rounded-xl border-2 transition-all text-left
                ${
                  isSelected
                    ? 'border-pink-500 bg-pink-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{style.icon}</div>
                <div className="flex-1">
                  <h3
                    className={`
                      font-semibold text-lg mb-1
                      ${isSelected ? 'text-pink-700' : 'text-gray-800'}
                    `}
                  >
                    {style.label}
                    {isSelected && <span className="ml-2 text-pink-600">✓</span>}
                  </h3>
                  <p className="text-sm text-gray-600">{style.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default StylesQuestion;
