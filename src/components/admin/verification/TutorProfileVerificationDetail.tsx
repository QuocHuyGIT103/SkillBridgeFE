import React from "react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface TutorProfileVerificationDetailProps {
  detail: any;
  requestType: string;
}

const TutorProfileVerificationDetail: React.FC<
  TutorProfileVerificationDetailProps
> = ({ detail, requestType }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatAddress = (userInfo: any) => {
    if (!userInfo?.structured_address)
      return userInfo?.address || "Chưa cập nhật";

    const { province_info, district_info, ward_info, detail_address } =
      userInfo.structured_address;
    const parts = [
      detail_address,
      ward_info?.name,
      district_info?.name,
      province_info?.name,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case "NEW":
        return "bg-blue-50 border-blue-200";
      case "UPDATE":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getRequestTypeText = (type: string) => {
    switch (type) {
      case "NEW":
        return "Đăng ký mới";
      case "UPDATE":
        return "Cập nhật";
      default:
        return type;
    }
  };

  const renderUserInfo = (userInfo: any, title: string) => (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
        <UserIcon className="w-5 h-5 text-blue-600" />
        <span>{title}</span>
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <UserIcon className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Họ và tên</p>
              <p className="text-sm text-gray-900">
                {userInfo?.fullName || "Chưa cập nhật"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Email</p>
              <p className="text-sm text-gray-900">
                {userInfo?.email || "Chưa cập nhật"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <PhoneIcon className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Số điện thoại</p>
              <p className="text-sm text-gray-900">
                {userInfo?.phoneNumber || "Chưa cập nhật"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Ngày sinh</p>
              <p className="text-sm text-gray-900">
                {userInfo?.dateOfBirth
                  ? formatDate(userInfo.dateOfBirth)
                  : "Chưa cập nhật"}
              </p>
            </div>
          </div>
        </div>

        {/* Address Info */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <MapPinIcon className="w-4 h-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Địa chỉ</p>
              <p className="text-sm text-gray-900">{formatAddress(userInfo)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <UserIcon className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Giới tính</p>
              <p className="text-sm text-gray-900">
                {userInfo?.gender === "male"
                  ? "Nam"
                  : userInfo?.gender === "female"
                  ? "Nữ"
                  : userInfo?.gender === "other"
                  ? "Khác"
                  : "Chưa cập nhật"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTutorProfileInfo = (profileData: any, title: string) => (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
        <AcademicCapIcon className="w-5 h-5 text-green-600" />
        <span>{title}</span>
      </h4>

      <div className="space-y-4">
        {/* Headline */}
        {profileData?.headline && (
          <div className="bg-gradient-to-r from-primary/5 to-accent/10 rounded-lg p-4 border-l-4 border-primary">
            <div className="flex items-center space-x-2 mb-2">
              <DocumentTextIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-gray-700">
                Dòng tiêu đề
              </span>
            </div>
            <p className="text-gray-900 font-medium">{profileData.headline}</p>
          </div>
        )}

        {/* Introduction */}
        {profileData?.introduction && (
          <div className="bg-gradient-to-r from-secondary/5 to-accent/5 rounded-lg p-4 border-l-4 border-secondary">
            <div className="flex items-center space-x-2 mb-2">
              <DocumentTextIcon className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-gray-700">
                Giới thiệu
              </span>
            </div>
            <p className="text-gray-900 whitespace-pre-wrap">
              {profileData.introduction}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Teaching Experience */}
          {profileData?.teaching_experience && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-500">
              <div className="flex items-center space-x-2 mb-2">
                <AcademicCapIcon className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  Kinh nghiệm giảng dạy
                </span>
              </div>
              <p className="text-gray-900 text-sm whitespace-pre-wrap">
                {profileData.teaching_experience}
              </p>
            </div>
          )}

          {/* Student Levels */}
          {profileData?.student_levels && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center space-x-2 mb-2">
                <UserGroupIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Trình độ học viên
                </span>
              </div>
              <p className="text-gray-900 text-sm whitespace-pre-wrap">
                {profileData.student_levels}
              </p>
            </div>
          )}
        </div>

        {/* Video Introduction */}
        {profileData?.video_intro_link && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-l-4 border-purple-500">
            <div className="flex items-center space-x-2 mb-3">
              <VideoCameraIcon className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">
                Video giới thiệu
              </span>
            </div>
            <a
              href={profileData.video_intro_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-800 font-medium"
            >
              <VideoCameraIcon className="w-4 h-4" />
              <span>Xem video giới thiệu</span>
            </a>
          </div>
        )}

        {/* CCCD Images */}
        {profileData?.cccd_images && profileData.cccd_images.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border-l-4 border-orange-500">
            <div className="flex items-center space-x-2 mb-3">
              <IdentificationIcon className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">
                Ảnh CCCD ({profileData.cccd_images.length})
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {profileData.cccd_images.map(
                (imageUrl: string, index: number) => (
                  <div key={index} className="relative group">
                    <div className="aspect-[16/10] bg-gray-100 rounded-lg overflow-hidden border-2 border-orange-200">
                      <img
                        src={imageUrl}
                        alt={`CCCD ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(imageUrl, "_blank")}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white rounded-full p-2">
                          <DocumentTextIcon className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`border-2 rounded-lg p-6 ${getRequestTypeColor(requestType)}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Thông tin gia sư - {getRequestTypeText(requestType)}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getRequestTypeColor(
            requestType
          )}`}
        >
          {getRequestTypeText(requestType)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information */}
        <div className="space-y-4">
          {renderUserInfo(
            detail.target?.userInfo || detail.dataSnapshot?.userInfo,
            "Thông tin cá nhân"
          )}
        </div>

        {/* Tutor Profile Information */}
        <div className="space-y-4">
          {renderTutorProfileInfo(
            detail.target || detail.dataSnapshot,
            "Thông tin gia sư"
          )}
        </div>
      </div>

      {/* Additional Info for UPDATE requests */}
      {requestType === "UPDATE" && detail.target && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <DocumentTextIcon className="w-5 h-5 text-yellow-600" />
            <span>Thông tin hiện tại (để so sánh)</span>
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {renderUserInfo(
                detail.target.userInfo,
                "Thông tin cá nhân hiện tại"
              )}
            </div>

            <div className="space-y-4">
              {renderTutorProfileInfo(
                detail.target,
                "Thông tin gia sư hiện tại"
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorProfileVerificationDetail;

