import React, { useState } from "react";
import TimePicker24h from "./TimePicker24h";

const TimePickerDemo: React.FC = () => {
  const [sessionDuration, setSessionDuration] = useState(60);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Demo TimePicker24h - Tính năng thông minh
      </h2>

      <div className="space-y-6">
        {/* Session Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thời lượng mỗi buổi (phút)
          </label>
          <select
            value={sessionDuration}
            onChange={(e) => setSessionDuration(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={30}>30 phút</option>
            <option value={45}>45 phút</option>
            <option value={60}>60 phút</option>
            <option value={90}>90 phút</option>
            <option value={120}>120 phút</option>
          </select>
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thời gian bắt đầu
          </label>
          <TimePicker24h
            value={startTime}
            onChange={setStartTime}
            placeholder="Chọn giờ bắt đầu"
            sessionDuration={sessionDuration}
          />
        </div>

        {/* End Time with Smart Suggestions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thời gian kết thúc (có đề xuất thông minh)
          </label>
          <TimePicker24h
            value={endTime}
            onChange={setEndTime}
            placeholder="Chọn giờ kết thúc"
            sessionDuration={sessionDuration}
            startTimeValue={startTime}
            isEndTime={true}
          />
        </div>

        {/* Current Selection Display */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">
            Thông tin hiện tại:
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              Thời lượng:{" "}
              <span className="font-medium">{sessionDuration} phút</span>
            </div>
            <div>
              Bắt đầu: <span className="font-medium">{startTime}</span>
            </div>
            <div>
              Kết thúc: <span className="font-medium">{endTime}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Hướng dẫn sử dụng:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Chọn thời lượng buổi học (30-120 phút)</li>
            <li>• Chọn thời gian bắt đầu</li>
            <li>
              • Combo box giờ kết thúc sẽ tự động hiển thị các thời gian được
              tính toán dựa trên giờ bắt đầu + thời lượng
            </li>
            <li>
              • Ví dụ: 8:00 bắt đầu + 60 phút = combo box sẽ có 9:00, 10:00,
              11:00, 12:00... (đến trước 23:00)
            </li>
            <li>
              • Tất cả combo box có kích thước đồng nhất và hiển thị
              sáng/tối/đêm
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimePickerDemo;
