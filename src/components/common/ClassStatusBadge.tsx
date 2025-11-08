import React from 'react';

interface ClassStatusBadgeProps {
  status: string;
}

const ClassStatusBadge: React.FC<ClassStatusBadgeProps> = ({ status }) => {
  let badgeClass = '';
  let statusText = '';

  switch (status) {
    case 'ACTIVE':
      badgeClass = 'bg-green-100 text-green-800';
      statusText = 'Đang hoạt động';
      break;
    case 'PENDING':
      badgeClass = 'bg-yellow-100 text-yellow-800';
      statusText = 'Chờ xác nhận';
      break;
    case 'COMPLETED':
      badgeClass = 'bg-blue-100 text-blue-800';
      statusText = 'Đã hoàn thành';
      break;
    case 'CANCELLED':
      badgeClass = 'bg-red-100 text-red-800';
      statusText = 'Đã hủy';
      break;
    default:
      badgeClass = 'bg-gray-100 text-gray-800';
      statusText = 'Không xác định';
  }

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}`}>
      {statusText}
    </span>
  );
};

export default ClassStatusBadge;