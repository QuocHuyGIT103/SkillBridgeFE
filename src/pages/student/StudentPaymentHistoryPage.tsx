import React from "react";
import PaymentHistoryList from "../../components/student/PaymentHistoryList";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const StudentPaymentHistoryPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Lịch sử thanh toán
          </h1>
          <button
            onClick={() => navigate("/student/classes")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại
          </button>
        </div>

        {/* Payment History Component */}
        <PaymentHistoryList />
      </div>
    </div>
  );
};

export default StudentPaymentHistoryPage;
