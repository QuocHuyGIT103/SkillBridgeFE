import React, { useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface InfoTooltipProps {
  content: string;
  children: React.ReactNode;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center space-x-1"
      >
        {children}
        <InformationCircleIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
      </div>

      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg z-10 max-w-xs">
          <div className="whitespace-normal">{content}</div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
