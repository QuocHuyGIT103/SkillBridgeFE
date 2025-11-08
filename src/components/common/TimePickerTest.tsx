import React, { useState } from "react";
import TimePicker24h from "./TimePicker24h";

const TimePickerTest: React.FC = () => {
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("");
  const [sessionDuration, setSessionDuration] = useState(60);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Test TimePicker Logic</h2>

      <div className="space-y-4">
        {/* Session Duration */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Thời lượng (phút)
          </label>
          <select
            value={sessionDuration}
            onChange={(e) => setSessionDuration(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
          <label className="block text-sm font-medium mb-2">Giờ bắt đầu</label>
          <TimePicker24h
            value={startTime}
            onChange={setStartTime}
            placeholder="Chọn giờ bắt đầu"
            sessionDuration={sessionDuration}
          />
        </div>

        {/* End Time - Should show calculated options */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Giờ kết thúc (Combo box)
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

        {/* Debug Info */}
        <div className="p-3 bg-gray-100 rounded text-sm">
          <div>
            <strong>Start Time:</strong> {startTime}
          </div>
          <div>
            <strong>End Time:</strong> {endTime}
          </div>
          <div>
            <strong>Duration:</strong> {sessionDuration} phút
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimePickerTest;
