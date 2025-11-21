import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { motion } from "framer-motion";

interface MonthlyTrendData {
  month: string;
  amount: number;
}

interface MonthlyPaymentTrendProps {
  data: MonthlyTrendData[];
}

const MonthlyPaymentTrend: React.FC<MonthlyPaymentTrendProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Xu hướng thanh toán theo tháng
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          Chưa có dữ liệu thanh toán
        </div>
      </div>
    );
  }

  // Format month display (YYYY-MM -> Tháng MM/YYYY)
  const formattedData = data.map((item) => {
    const [year, month] = item.month.split("-");
    return {
      ...item,
      monthDisplay: `Th${month}/${year.slice(2)}`,
      fullMonth: `Tháng ${month}/${year}`,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-1">{data.fullMonth}</p>
          <p className="text-sm text-blue-600">
            Thanh toán:{" "}
            <span className="font-medium">
              {data.amount.toLocaleString("vi-VN")} VNĐ
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate trend
  const totalPaid = data.reduce((sum, item) => sum + item.amount, 0);
  const avgPerMonth = totalPaid / data.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            📈 Xu hướng thanh toán theo tháng
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Trung bình:{" "}
            <span className="font-medium text-blue-600">
              {avgPerMonth.toLocaleString("vi-VN")} VNĐ/tháng
            </span>
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="monthDisplay"
            tick={{ fontSize: 12 }}
            stroke="#9CA3AF"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#9CA3AF"
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAmount)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-600 font-medium">
            Tổng đã thanh toán
          </p>
          <p className="text-lg font-bold text-blue-700 mt-1">
            {totalPaid.toLocaleString("vi-VN")}
          </p>
          <p className="text-xs text-blue-500">VNĐ</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-green-600 font-medium">Số tháng</p>
          <p className="text-lg font-bold text-green-700 mt-1">{data.length}</p>
          <p className="text-xs text-green-500">tháng</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-xs text-purple-600 font-medium">TB/tháng</p>
          <p className="text-lg font-bold text-purple-700 mt-1">
            {(avgPerMonth / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-purple-500">VNĐ</p>
        </div>
      </div>
    </motion.div>
  );
};

export default MonthlyPaymentTrend;
