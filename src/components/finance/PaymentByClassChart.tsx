import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";

interface PaymentByClassData {
  classId: string;
  className: string;
  tutorName?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  progress: number;
}

interface PaymentByClassChartProps {
  data: PaymentByClassData[];
  onClassClick?: (classId: string) => void;
}

const COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
];

const PaymentByClassChart: React.FC<PaymentByClassChartProps> = ({
  data,
  onClassClick,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4"></h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          Chưa có dữ liệu thanh toán
        </div>
      </div>
    );
  }

  // Prepare data for pie chart
  const chartData = data.map((item, index) => ({
    name: item.className,
    tutorName: item.tutorName,
    value: item.totalAmount,
    classId: item.classId,
    paid: item.paidAmount,
    unpaid: item.remainingAmount,
    progress: item.progress,
    color: COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-1">{data.name}</p>
          {data.tutorName && (
            <p className="text-xs text-gray-500 mb-2">
              Gia sư: {data.tutorName}
            </p>
          )}
          <p className="text-sm text-gray-600">
            Tổng:{" "}
            <span className="font-medium">
              {data.value.toLocaleString("vi-VN")} VNĐ
            </span>
          </p>
          <p className="text-sm text-green-600">
            Đã thanh toán: {data.paid.toLocaleString("vi-VN")} VNĐ
          </p>
          <p className="text-sm text-red-600">
            Còn lại: {data.unpaid.toLocaleString("vi-VN")} VNĐ
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${data.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tiến độ: {data.progress.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📊 Phân bổ thanh toán theo lớp
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            onClick={(data) => {
              if (onClassClick) {
                onClassClick(data.classId);
              }
            }}
            className="cursor-pointer"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-sm text-gray-700">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Class details list */}
      <div className="mt-6 space-y-3">
        {chartData.map((item) => {
          const isFullyPaid = item.progress >= 100 || item.unpaid === 0;
          return (
            <div
              key={item.classId}
              className={`p-3 rounded-lg border border-gray-100 transition-all ${
                onClassClick && !isFullyPaid
                  ? "cursor-pointer hover:border-gray-300 hover:shadow-sm"
                  : ""
              } ${isFullyPaid ? "bg-green-50 border-green-200" : ""}`}
              onClick={() =>
                !isFullyPaid && onClassClick && onClassClick(item.classId)
              }
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm">
                        {item.name}
                      </span>
                      {isFullyPaid && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
                          ✓ Đã thanh toán
                        </span>
                      )}
                    </div>
                    {item.tutorName && (
                      <span className="text-xs text-gray-500 block">
                        Gia sư: {item.tutorName}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-700 ml-2 flex-shrink-0">
                  {item.value.toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">
                  {item.progress.toFixed(1)}% hoàn thành
                </span>
                <span className="text-xs text-gray-500">
                  Còn lại: {item.unpaid.toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PaymentByClassChart;
