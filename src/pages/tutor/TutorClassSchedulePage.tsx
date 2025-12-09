import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import ClassScheduleDetail from "../../components/class/ClassScheduleDetail";

const TutorClassSchedulePage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  if (!classId) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-600">Không tìm thấy lớp học</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/tutor/schedule")}
          className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Quay lại lịch học
        </button>
      </div>

      <ClassScheduleDetail classId={classId} userRole="TUTOR" />
    </div>
  );
};

export default TutorClassSchedulePage;
