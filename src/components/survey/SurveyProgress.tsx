import React from "react";
import { motion } from "framer-motion";
import { CheckIcon } from "@heroicons/react/24/solid";

interface SurveyProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
}

const SurveyProgress: React.FC<SurveyProgressProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
}) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
          />
        </div>

        {/* Step Indicators */}
        <div className="absolute -top-3 left-0 right-0 flex justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            // Check if step is in the future: index > currentStep

            return (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                    ${
                      isCompleted
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 border-purple-500"
                        : isCurrent
                        ? "bg-white border-purple-500 shadow-lg"
                        : "bg-white border-gray-300"
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-5 h-5 text-white" />
                  ) : (
                    <span
                      className={`
                        text-sm font-semibold
                        ${isCurrent ? "text-purple-600" : "text-gray-400"}
                      `}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Step Title (Optional) */}
                {stepTitles && stepTitles[index] && (
                  <div
                    className={`
                      absolute top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs
                      ${
                        isCurrent
                          ? "text-purple-600 font-semibold"
                          : "text-gray-500"
                      }
                    `}
                  >
                    {stepTitles[index]}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Progress Text */}
      <div className="flex justify-between items-center mt-12 text-sm">
        <span className="text-gray-600">
          Câu hỏi <strong className="text-purple-600">{currentStep + 1}</strong>{" "}
          / {totalSteps}
        </span>
        <span className="text-gray-600">
          <strong className="text-purple-600">{Math.round(progress)}%</strong>{" "}
          hoàn thành
        </span>
      </div>
    </div>
  );
};

export default SurveyProgress;
