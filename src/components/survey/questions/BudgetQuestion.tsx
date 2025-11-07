// Question 7: Budget Range
import React from 'react';
import { motion } from 'framer-motion';
import { BanknotesIcon } from '@heroicons/react/24/outline';

interface BudgetQuestionProps {
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
}

const BudgetQuestion: React.FC<BudgetQuestionProps> = ({ value, onChange }) => {
  const budgetRanges = [
    { min: 50000, max: 100000, label: '50k - 100k', color: 'green' },
    { min: 100000, max: 200000, label: '100k - 200k', color: 'blue' },
    { min: 200000, max: 300000, label: '200k - 300k', color: 'purple' },
    { min: 300000, max: 500000, label: '300k - 500k', color: 'pink' },
    { min: 500000, max: 1000000, label: '500k - 1M', color: 'red' },
  ];

  const isSelected = (range: typeof budgetRanges[0]) => {
    return value.min === range.min && value.max === range.max;
  };

  const getColorClasses = (color: string, selected: boolean) => {
    const colors = {
      green: selected
        ? 'border-green-500 bg-green-50 text-green-700'
        : 'border-gray-200 bg-white hover:border-green-300',
      blue: selected
        ? 'border-blue-500 bg-blue-50 text-blue-700'
        : 'border-gray-200 bg-white hover:border-blue-300',
      purple: selected
        ? 'border-purple-500 bg-purple-50 text-purple-700'
        : 'border-gray-200 bg-white hover:border-purple-300',
      pink: selected
        ? 'border-pink-500 bg-pink-50 text-pink-700'
        : 'border-gray-200 bg-white hover:border-pink-300',
      red: selected
        ? 'border-red-500 bg-red-50 text-red-700'
        : 'border-gray-200 bg-white hover:border-red-300',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-4 bg-emerald-100 rounded-full mb-4"
        >
          <BanknotesIcon className="w-12 h-12 text-emerald-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Ngân sách của bạn?
        </h2>
        <p className="text-gray-600">Chọn mức học phí phù hợp (VNĐ/buổi)</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetRanges.map((range, index) => {
          const selected = isSelected(range);

          return (
            <motion.button
              key={range.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => onChange({ min: range.min, max: range.max })}
              className={`
                p-6 rounded-xl border-2 transition-all text-center
                ${getColorClasses(range.color, selected)}
                ${selected ? 'shadow-lg' : 'hover:shadow-md'}
              `}
            >
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-bold text-xl mb-1">{range.label}</h3>
              <p className="text-xs text-gray-600">VNĐ/buổi</p>
            </motion.button>
          );
        })}
      </div>

      {/* Custom Range */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200"
      >
        <h4 className="font-semibold text-gray-800 mb-4 text-center">
          Hoặc tùy chỉnh ngân sách
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tối thiểu (VNĐ)
            </label>
            <input
              type="number"
              value={value.min}
              onChange={(e) => onChange({ ...value, min: Number(e.target.value) })}
              min="50000"
              max="1000000"
              step="10000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tối đa (VNĐ)
            </label>
            <input
              type="number"
              value={value.max}
              onChange={(e) => onChange({ ...value, max: Number(e.target.value) })}
              min="50000"
              max="1000000"
              step="10000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BudgetQuestion;
