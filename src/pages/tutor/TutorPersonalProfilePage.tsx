import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserCircleIcon,
  CameraIcon,
  DocumentTextIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  IdentificationIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { useTutorProfileStore } from "../../store/tutorProfile.store";
import { useAutoFocusOnError } from "../../hooks/useAutoFocusOnError";
import toast from "react-hot-toast";

interface PersonalInfo {
  full_name: string;
  email: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  address: string;
  portrait_image: File | null;
  cccd_images: File[];
  // New introduction fields
  headline: string;
  introduction: string;
  teaching_experience?: string;
  student_levels?: string;
  video_intro_link?: string;
}

const TutorPersonalProfilePage: React.FC = () => {
  // Zustand store
  const {
    profileData,
    isLoading,
    isUpdatingPersonal,
    isUpdatingIntroduction,
    isUploadingCCCD,
    error,
    validationErrors,
    fetchProfile,
    updatePersonalInfo,
    updateIntroduction,
    uploadCCCDImages,
    deleteCCCDImage,
    clearError,
  } = useTutorProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<PersonalInfo>({
    full_name: "",
    email: "",
    phone_number: "",
    gender: "",
    date_of_birth: "",
    address: "",
    portrait_image: null,
    cccd_images: [],
    headline: "",
    introduction: "",
    teaching_experience: "",
    student_levels: "",
    video_intro_link: "",
  });

  const portraitInputRef = useRef<HTMLInputElement>(null);
  const cccdInputRef = useRef<HTMLInputElement>(null);

  // Auto focus on validation error
  useAutoFocusOnError(validationErrors);

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update editedInfo when profileData changes
  useEffect(() => {
    if (profileData) {
      const user = profileData.user;
      const profile = profileData.profile;

      setEditedInfo({
        full_name: user?.full_name || "",
        email: user?.email || "",
        phone_number: user?.phone_number || "",
        gender: user?.gender || "",
        date_of_birth: user?.date_of_birth
          ? new Date(user.date_of_birth).toISOString().split("T")[0]
          : "",
        address: user?.address || "",
        portrait_image: null,
        cccd_images: [],
        headline: profile?.headline || "",
        introduction: profile?.introduction || "",
        teaching_experience: profile?.teaching_experience || "",
        student_levels: profile?.student_levels || "",
        video_intro_link: profile?.video_intro_link || "",
      });
    }
  }, [profileData]);

  // Handle errors with toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset to original data from profileData
      if (profileData) {
        const user = profileData.user;
        const profile = profileData.profile;

        setEditedInfo({
          full_name: user?.full_name || "",
          email: user?.email || "",
          phone_number: user?.phone_number || "",
          gender: user?.gender || "",
          date_of_birth: user?.date_of_birth
            ? new Date(user.date_of_birth).toISOString().split("T")[0]
            : "",
          address: user?.address || "",
          portrait_image: null,
          cccd_images: [],
          headline: profile?.headline || "",
          introduction: profile?.introduction || "",
          teaching_experience: profile?.teaching_experience || "",
          student_levels: profile?.student_levels || "",
          video_intro_link: profile?.video_intro_link || "",
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      // Update personal info
      await updatePersonalInfo({
        full_name: editedInfo.full_name,
        phone_number: editedInfo.phone_number,
        gender: editedInfo.gender as "male" | "female" | "other",
        date_of_birth: editedInfo.date_of_birth,
        address: editedInfo.address,
        avatar_file: editedInfo.portrait_image || undefined,
      });

      // Update introduction
      await updateIntroduction({
        headline: editedInfo.headline,
        introduction: editedInfo.introduction,
        teaching_experience: editedInfo.teaching_experience,
        student_levels: editedInfo.student_levels,
        video_intro_link: editedInfo.video_intro_link,
      });

      setIsEditing(false);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const handleInputChange = (field: keyof PersonalInfo, value: string) => {
    setEditedInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePortraitUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditedInfo((prev) => ({ ...prev, portrait_image: file }));
    }
  };

  const handleCCCDUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      try {
        const success = await uploadCCCDImages(files);
        if (success) {
          toast.success(`Tải ${files.length} ảnh CCCD thành công!`);
        }
        // Reset input
        if (cccdInputRef.current) {
          cccdInputRef.current.value = "";
        }
      } catch (error: any) {
        // Error will be shown via the error useEffect
      }
    }
  };

  const removeCCCDImage = async (imageUrl: string) => {
    try {
      const success = await deleteCCCDImage(imageUrl);
      if (success) {
        toast.success("Xóa ảnh CCCD thành công!");
      }
    } catch (error: any) {
      // Error will be shown via the error useEffect
    }
  };

  const getImageUrl = (file: File | null) => {
    return file ? URL.createObjectURL(file) : null;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Đang tải hồ sơ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-primary">Hồ sơ của tôi</h1>
            <p className="text-secondary mt-2">
              Quản lý thông tin cá nhân và tài khoản của bạn
            </p>
          </div>
          <div className="flex space-x-3">
            {!isEditing ? (
              <button
                onClick={handleEditToggle}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Chỉnh sửa</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isUpdatingPersonal || isUpdatingIntroduction}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingPersonal || isUpdatingIntroduction ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Lưu</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleEditToggle}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>Hủy</span>
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-6"
        >
          {/* Header với border frame */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <UserCircleIcon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Thông tin cá nhân
              </h2>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Portrait Section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden border-4 border-accent">
                  {editedInfo.portrait_image ? (
                    <img
                      src={getImageUrl(editedInfo.portrait_image)!}
                      alt="Portrait"
                      className="w-full h-full object-cover"
                    />
                  ) : profileData?.user?.avatar_url ? (
                    <img
                      src={profileData.user.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-20 h-20 text-secondary" />
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => portraitInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <CameraIcon className="w-5 h-5" />
                  </button>
                )}
                <input
                  ref={portraitInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePortraitUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-secondary mt-2 text-center">
                Ảnh chân dung
              </p>
            </div>

            {/* Basic Info */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Họ và tên
                </label>
                {isEditing ? (
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={editedInfo.full_name}
                    onChange={(e) =>
                      handleInputChange("full_name", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-accent/20 rounded-lg">
                    <UserCircleIcon className="w-5 h-5 text-secondary" />
                    <span className="text-gray-900 dark:text-gray-100">
                      {profileData?.user?.full_name || "Chưa cập nhật"}
                    </span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <EnvelopeIcon className="w-5 h-5 text-secondary" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {profileData?.user?.email || "Chưa cập nhật"}
                  </span>
                  <span className="text-xs text-gray-500">
                    (Không thể thay đổi)
                  </span>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Giới tính
                </label>
                {isEditing ? (
                  <select
                    id="gender"
                    name="gender"
                    value={editedInfo.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-accent/20 rounded-lg">
                    <UserCircleIcon className="w-5 h-5 text-secondary" />
                    <span className="text-gray-900 dark:text-gray-100">
                      {profileData?.user?.gender === "male"
                        ? "Nam"
                        : profileData?.user?.gender === "female"
                        ? "Nữ"
                        : profileData?.user?.gender === "other"
                        ? "Khác"
                        : "Chưa cập nhật"}
                    </span>
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Số điện thoại
                </label>
                {isEditing ? (
                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    value={editedInfo.phone_number}
                    onChange={(e) =>
                      handleInputChange("phone_number", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-accent/20 rounded-lg">
                    <PhoneIcon className="w-5 h-5 text-secondary" />
                    <span className="text-gray-900 dark:text-gray-100">
                      {profileData?.user?.phone_number || "Chưa cập nhật"}
                    </span>
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ngày sinh
                </label>
                {isEditing ? (
                  <input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={editedInfo.date_of_birth}
                    onChange={(e) =>
                      handleInputChange("date_of_birth", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-accent/20 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-secondary" />
                    <span className="text-gray-900 dark:text-gray-100">
                      {profileData?.user?.date_of_birth
                        ? new Date(
                            profileData.user.date_of_birth
                          ).toLocaleDateString("vi-VN")
                        : "Chưa cập nhật"}
                    </span>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Địa chỉ
                </label>
                {isEditing ? (
                  <textarea
                    id="address"
                    name="address"
                    value={editedInfo.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Nhập địa chỉ đầy đủ..."
                  />
                ) : (
                  <div className="flex items-start space-x-2 px-4 py-2 bg-accent/20 rounded-lg min-h-[80px]">
                    <MapPinIcon className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-gray-100">
                      {profileData?.user?.address || "Chưa cập nhật"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Introduction Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-6"
        >
          {/* Header với border frame */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Giới thiệu bản thân
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            {/* Attractive Headline */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/10 rounded-lg p-4 border-l-4 border-primary">
              <div className="flex items-center space-x-2 mb-3">
                <SparklesIcon className="w-5 h-5 text-primary" />
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Dòng tiêu đề lôi cuốn *
                </label>
              </div>
              <p className="text-xs text-gray-500 mb-3 italic">
                Viết một dòng tiêu đề lôi cuốn, bắt mắt để gây ấn tượng với học
                viên.
              </p>
              {isEditing ? (
                <input
                  id="headline"
                  name="headline"
                  type="text"
                  value={editedInfo.headline || ""}
                  onChange={(e) =>
                    handleInputChange("headline", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  placeholder="VD: Gia sư Toán học với 5+ năm kinh nghiệm, giúp học sinh đạt điểm cao"
                  maxLength={100}
                />
              ) : (
                <div className="px-4 py-3 bg-white rounded-lg border border-primary/20">
                  <p className="text-gray-900 dark:text-gray-100 text-lg font-medium">
                    {profileData?.profile?.headline || "Chưa có tiêu đề"}
                  </p>
                </div>
              )}
            </div>

            {/* Personal Introduction */}
            <div className="bg-gradient-to-r from-secondary/5 to-accent/5 rounded-lg p-4 border-l-4 border-secondary">
              <div className="flex items-center space-x-2 mb-3">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-secondary" />
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Giới thiệu về bản thân *
                </label>
              </div>
              {isEditing ? (
                <textarea
                  id="introduction"
                  name="introduction"
                  value={editedInfo.introduction || ""}
                  onChange={(e) =>
                    handleInputChange("introduction", e.target.value)
                  }
                  rows={6}
                  className="w-full px-4 py-3 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white"
                  placeholder="Hãy chia sẻ về bản thân, sở thích, phương pháp giảng dạy, mục tiêu hướng dẫn học sinh..."
                />
              ) : (
                <div className="px-4 py-3 bg-white rounded-lg border border-secondary/20 min-h-[120px]">
                  <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                    {profileData?.profile?.introduction || "Chưa có giới thiệu"}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Teaching Experience */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg p-4 border-l-4 border-green-500">
                <div className="flex items-center space-x-2 mb-3">
                  <AcademicCapIcon className="w-5 h-5 text-green-600" />
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Kinh nghiệm giảng dạy{" "}
                    <span className="text-gray-400 font-normal">
                      (Tùy chọn)
                    </span>
                  </label>
                </div>
                {isEditing ? (
                  <textarea
                    id="teaching_experience"
                    name="teaching_experience"
                    value={editedInfo.teaching_experience || ""}
                    onChange={(e) =>
                      handleInputChange("teaching_experience", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white"
                    placeholder="Mô tả kinh nghiệm giảng dạy, các thành tích đáng chú ý..."
                  />
                ) : (
                  <div className="px-4 py-3 bg-white rounded-lg border border-green-200 min-h-[100px]">
                    <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                      {profileData?.profile?.teaching_experience ||
                        "Chưa cập nhật"}
                    </p>
                  </div>
                )}
              </div>

              {/* Student Levels */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center space-x-2 mb-3">
                  <UserGroupIcon className="w-5 h-5 text-blue-600" />
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Trình độ học viên nhận giảng dạy{" "}
                    <span className="text-gray-400 font-normal">
                      (Tùy chọn)
                    </span>
                  </label>
                </div>
                {isEditing ? (
                  <textarea
                    id="student_levels"
                    name="student_levels"
                    value={editedInfo.student_levels || ""}
                    onChange={(e) =>
                      handleInputChange("student_levels", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white"
                    placeholder="VD: Học sinh THCS, THPT, sinh viên đại học..."
                  />
                ) : (
                  <div className="px-4 py-3 bg-white rounded-lg border border-blue-200 min-h-[100px]">
                    <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                      {profileData?.profile?.student_levels || "Chưa cập nhật"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Video Introduction Link */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center space-x-2 mb-3">
                <VideoCameraIcon className="w-5 h-5 text-purple-600" />
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Link video giới thiệu về bản thân{" "}
                  <span className="text-gray-400 font-normal">(Tùy chọn)</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Gợi ý: YouTube, Google Drive, Vimeo hoặc các nền tảng video khác
              </p>
              {isEditing ? (
                <input
                  id="video_intro_link"
                  name="video_intro_link"
                  type="url"
                  value={editedInfo.video_intro_link || ""}
                  onChange={(e) =>
                    handleInputChange("video_intro_link", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  placeholder="https://youtube.com/watch?v=..."
                />
              ) : (
                <div className="px-4 py-3 bg-white rounded-lg border border-purple-200">
                  {profileData?.profile?.video_intro_link ? (
                    <a
                      href={profileData.profile.video_intro_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 font-medium flex items-center space-x-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      <span>Xem video giới thiệu</span>
                    </a>
                  ) : (
                    <span className="text-gray-500">
                      Chưa có video giới thiệu
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* CCCD Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
        >
          {/* Header với border frame */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <IdentificationIcon className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Căn cước công dân (CCCD)
                </h2>
              </div>
              {isEditing && (
                <button
                  onClick={() => cccdInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  <span>Thêm ảnh CCCD</span>
                </button>
              )}
            </div>
            <input
              ref={cccdInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleCCCDUpload}
              className="hidden"
            />
          </div>

          {/* CCCD Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profileData?.profile?.cccd_images &&
            profileData.profile.cccd_images.length > 0 ? (
              profileData.profile.cccd_images.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-[16/10] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-accent/30">
                    <img
                      src={imageUrl}
                      alt={`CCCD ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.png"; // Fallback image
                      }}
                    />
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removeCCCDImage(imageUrl)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isUploadingCCCD}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <IdentificationIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Chưa có hình ảnh CCCD nào được tải lên</p>
                {isEditing && (
                  <button
                    onClick={() => cccdInputRef.current?.click()}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Tải ảnh CCCD
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TutorPersonalProfilePage;
