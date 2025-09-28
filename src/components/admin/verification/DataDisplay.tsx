import React from "react";
import {
  AcademicCapIcon,
  DocumentTextIcon,
  TrophyIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

interface DataDisplayProps {
  data: any;
  type: "EDUCATION" | "CERTIFICATE" | "ACHIEVEMENT";
  title: string;
  className?: string;
}

const DataDisplay: React.FC<DataDisplayProps> = ({
  data,
  type,
  title,
  className = "",
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Không có";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getEducationLevel = (level: string) => {
    switch (level) {
      case "HIGH_SCHOOL":
        return "Trung học phổ thông";
      case "COLLEGE":
        return "Cao đẳng";
      case "UNIVERSITY":
        return "Đại học";
      case "MASTER":
        return "Thạc sĩ";
      case "PHD":
        return "Tiến sĩ";
      default:
        return level;
    }
  };

  const getAchievementLevel = (level: string) => {
    switch (level) {
      case "INTERNATIONAL":
        return "Quốc tế";
      case "NATIONAL":
        return "Quốc gia";
      case "REGIONAL":
        return "Khu vực";
      case "LOCAL":
        return "Địa phương";
      case "INSTITUTIONAL":
        return "Cơ sở";
      default:
        return level;
    }
  };

  const getAchievementType = (type: string) => {
    switch (type) {
      case "COMPETITION":
        return "Cuộc thi";
      case "SCHOLARSHIP":
        return "Học bổng";
      case "RESEARCH":
        return "Nghiên cứu";
      case "PUBLICATION":
        return "Xuất bản";
      case "OTHER":
        return "Khác";
      default:
        return type;
    }
  };

  const renderEducationData = () => (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <AcademicCapIcon className="w-5 h-5 text-blue-600" />
        <h6 className="font-semibold text-gray-900">{title}</h6>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cấp độ học vấn
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
            {getEducationLevel(data.level)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trường học
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
            {data.school || "Không có"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chuyên ngành
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
            {data.major || "Không có"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thời gian học
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
            {data.startYear} - {data.endYear}
          </p>
        </div>
      </div>

      {data.imgUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hình ảnh bằng cấp
          </label>
          <div className="flex items-center space-x-2">
            <PhotoIcon className="w-4 h-4 text-gray-600" />
            <a
              href={data.imgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Xem hình ảnh
            </a>
          </div>
        </div>
      )}
    </div>
  );

  const renderCertificateData = () => (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <DocumentTextIcon className="w-5 h-5 text-green-600" />
        <h6 className="font-semibold text-gray-900">{title}</h6>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên chứng chỉ
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
            {data.name || "Không có"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tổ chức cấp
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
            {data.issuingOrganization || "Không có"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày cấp
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
            {formatDate(data.issueDate)}
          </p>
        </div>

        {data.expiryDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày hết hạn
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
              {formatDate(data.expiryDate)}
            </p>
          </div>
        )}
      </div>

      {data.description && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
            {data.description}
          </p>
        </div>
      )}

      {data.imageUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hình ảnh chứng chỉ
          </label>
          <div className="flex items-center space-x-2">
            <PhotoIcon className="w-4 h-4 text-gray-600" />
            <a
              href={data.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Xem hình ảnh
            </a>
          </div>
        </div>
      )}
    </div>
  );

  const renderAchievementData = () => (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <TrophyIcon className="w-5 h-5 text-yellow-600" />
        <h6 className="font-semibold text-gray-900">{title}</h6>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên thành tích
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
            {data.name || "Không có"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cấp độ
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
            {getAchievementLevel(data.level)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loại thành tích
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
            {getAchievementType(data.type)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lĩnh vực
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
            {data.field || "Không có"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày đạt được
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
            {formatDate(data.achievedDate)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tổ chức trao
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
            {data.awardingOrganization || "Không có"}
          </p>
        </div>
      </div>

      {data.description && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
            {data.description}
          </p>
        </div>
      )}

      {data.imgUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hình ảnh thành tích
          </label>
          <div className="flex items-center space-x-2">
            <PhotoIcon className="w-4 h-4 text-gray-600" />
            <a
              href={data.imgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Xem hình ảnh
            </a>
          </div>
        </div>
      )}
    </div>
  );

  switch (type) {
    case "EDUCATION":
      return renderEducationData();
    case "CERTIFICATE":
      return renderCertificateData();
    case "ACHIEVEMENT":
      return renderAchievementData();
    default:
      return <div>Loại dữ liệu không được hỗ trợ</div>;
  }
};

export default DataDisplay;

