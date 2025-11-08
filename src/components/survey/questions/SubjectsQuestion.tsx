import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpenIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSubjectStore } from '../../../store/subject.store';

interface SubjectsQuestionProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const SubjectsQuestion: React.FC<SubjectsQuestionProps> = ({
  value,
  onChange,
}) => {
  const { subjects, isLoading, getActiveSubjects } = useSubjectStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (subjects.length === 0) {
      getActiveSubjects();
    }
  }, [subjects.length, getActiveSubjects]);

  const handleToggleSubject = (subjectName: string) => {
    if (value.includes(subjectName)) {
      onChange(value.filter((s) => s !== subjectName));
    } else {
      if (value.length < 5) {
        onChange([...value, subjectName]);
      }
    }
  };

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-4 bg-blue-100 rounded-full mb-4"
        >
          <BookOpenIcon className="w-12 h-12 text-blue-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Bạn cần học môn gì?
        </h2>
        <p className="text-gray-600">
          Chọn 1-5 môn học bạn muốn tìm gia sư
        </p>
        <div className="mt-2 text-sm text-purple-600 font-semibold">
          Đã chọn: {value.length}/5
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm môn học..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Subjects Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải môn học...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
          {filteredSubjects.map((subject, index) => {
            const isSelected = value.includes(subject.name);
            const isDisabled = !isSelected && value.length >= 5;

            return (
              <motion.button
                key={subject._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => !isDisabled && handleToggleSubject(subject.name)}
                disabled={isDisabled}
                className={`
                  p-3 rounded-lg border-2 transition-all text-sm font-medium
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                      : isDisabled
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:shadow-sm'
                  }
                `}
              >
                {subject.name}
                {isSelected && (
                  <span className="ml-1 text-blue-600">✓</span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {filteredSubjects.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          Không tìm thấy môn học "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default SubjectsQuestion;
