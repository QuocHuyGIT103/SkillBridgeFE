import React, { useEffect } from 'react';
import TutorRequestsList from '../../components/tutor/TutorRequestsList';
import DashboardStats from '../../components/dashboard/DashboardStats';
import { useContactRequestStore } from '../../store/contactRequest.store';
import { ClockIcon, CheckCircleIcon, XCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const TutorContactRequestsPage: React.FC = () => {
  const { requests, getTutorRequests } = useContactRequestStore();

  useEffect(() => {
    getTutorRequests();
  }, [getTutorRequests]);

  const stats = [
    {
      label: 'Tổng yêu cầu',
      value: requests.length,
      icon: ChatBubbleLeftRightIcon,
      color: 'blue' as const,
      description: 'Tất cả yêu cầu nhận được',
    },
    {
      label: 'Chờ xử lý',
      value: requests.filter((r) => r.status === 'PENDING').length,
      icon: ClockIcon,
      color: 'yellow' as const,
      description: 'Cần phản hồi',
    },
    {
      label: 'Đã chấp nhận',
      value: requests.filter((r) => r.status === 'ACCEPTED').length,
      icon: CheckCircleIcon,
      color: 'green' as const,
      description: 'Đã đồng ý',
    },
    {
      label: 'Đã từ chối',
      value: requests.filter((r) => r.status === 'REJECTED').length,
      icon: XCircleIcon,
      color: 'red' as const,
      description: 'Đã từ chối',
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardStats
        title="Yêu cầu học tập"
        description="Tổng quan về các yêu cầu học tập từ học viên"
        stats={stats}
      />
      
      <TutorRequestsList />
    </div>
  );
};

export default TutorContactRequestsPage;