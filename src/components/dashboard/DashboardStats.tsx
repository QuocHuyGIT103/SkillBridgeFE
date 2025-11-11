import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

export interface StatItem {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'indigo' | 'pink' | 'orange';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

interface DashboardStatsProps {
  title?: string;
  description?: string;
  stats: StatItem[];
  className?: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  title,
  description,
  stats,
  className = '',
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-200',
      value: 'text-blue-600',
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      border: 'border-green-200',
      value: 'text-green-600',
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      value: 'text-yellow-600',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      border: 'border-purple-200',
      value: 'text-purple-600',
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      border: 'border-red-200',
      value: 'text-red-600',
    },
    indigo: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      value: 'text-indigo-600',
    },
    pink: {
      bg: 'bg-pink-100',
      text: 'text-pink-600',
      border: 'border-pink-200',
      value: 'text-pink-600',
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      border: 'border-orange-200',
      value: 'text-orange-600',
    },
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const colorClass = colorClasses[stat.color];
          const Icon = stat.icon || ChartBarIcon;

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${colorClass.border} bg-gradient-to-br from-white to-${stat.color}-50 hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${colorClass.bg}`}>
                  <Icon className={`w-5 h-5 ${colorClass.text}`} />
                </div>
                {stat.trend && (
                  <div className={`flex items-center text-xs ${
                    stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend.isPositive ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                    )}
                    <span>{Math.abs(stat.trend.value)}%</span>
                  </div>
                )}
              </div>
              
              <div className="mt-2">
                <p className={`text-2xl font-bold ${colorClass.value} mb-1`}>
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {stat.label}
                </p>
                {stat.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.description}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardStats;

