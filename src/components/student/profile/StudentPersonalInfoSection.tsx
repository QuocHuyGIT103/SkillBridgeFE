import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import {
  UserIcon,
  PhotoIcon,
  XMarkIcon,
  PencilIcon,
  CheckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import { useStudentProfileStore } from "../../../store/studentProfile.store";
import AddressSelector from "../../AddressSelector";
import type {
  StudentPersonalInfoUpdate,
  StudentDashboardUser,
} from "../../../types/student.types";

interface StudentPersonalInfoSectionProps {
  user: StudentDashboardUser | null;
}

const StudentPersonalInfoSection: React.FC<StudentPersonalInfoSectionProps> = ({
  user,
}) => {
  const { updatePersonalInfo, isUpdatingPersonal } = useStudentProfileStore();
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); // ✅ Thêm state editing mode

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<StudentPersonalInfoUpdate>({
    defaultValues: {
      full_name: user?.full_name || "",
      phone_number: user?.phone_number || "",
      gender: user?.gender || undefined,
      date_of_birth: user?.date_of_birth
        ? new Date(user.date_of_birth).toISOString().split("T")[0]
        : "",
      address: user?.address || "",
      structured_address: user?.structured_address || undefined,
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      const formData = {
        full_name: user.full_name,
        phone_number: user.phone_number || "",
        gender: user.gender,
        date_of_birth: user.date_of_birth
          ? new Date(user.date_of_birth).toISOString().split("T")[0]
          : "",
        address: user.address || "",
        structured_address: user.structured_address,
      };

      reset(formData);

      // Set avatar preview
      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url);
      }
    }
  }, [user, reset]);

  // ✅ Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditing && isDirty) {
      // If there are unsaved changes, ask for confirmation
      const confirmDiscard = window.confirm(
        "Bạn có thay đổi chưa được lưu. Bạn có muốn hủy bỏ các thay đổi?"
      );
      if (!confirmDiscard) return;

      // Reset form to original values
      if (user) {
        reset({
          full_name: user.full_name,
          phone_number: user.phone_number || "",
          gender: user.gender,
          date_of_birth: user.date_of_birth
            ? new Date(user.date_of_birth).toISOString().split("T")[0]
            : "",
          address: user.address || "",
          structured_address: user.structured_address,
        });
      }
      setSelectedAvatar(null);
      setAvatarPreview(user?.avatar_url || null);
    }

    setIsEditing(!isEditing);
  };

  // Handle avatar selection
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file hình ảnh");
        return;
      }

      setSelectedAvatar(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedAvatar(null);
    setAvatarPreview(user?.avatar_url || null);
  };

  // Handle address change
  const handleProvinceChange = (provinceCode: string) => {
    const currentStructured = watch("structured_address") || {};
    setValue("structured_address", {
      ...currentStructured,
      province_code: provinceCode,
      district_code: "",
      ward_code: "",
    });
  };

  const handleDistrictChange = (districtCode: string) => {
    const currentStructured = watch("structured_address") || {};
    setValue("structured_address", {
      ...currentStructured,
      district_code: districtCode,
      ward_code: "",
    });
  };

  const handleWardChange = (wardCode: string) => {
    const currentStructured = watch("structured_address") || {};
    setValue("structured_address", {
      ...currentStructured,
      ward_code: wardCode,
    });
  };

  const handleDetailAddressChange = (detailAddress: string) => {
    const currentStructured = watch("structured_address") || {};
    setValue("structured_address", {
      ...currentStructured,
      detail_address: detailAddress,
    });
    setValue("address", detailAddress);
  };

  // Handle form submission
  const onSubmit = async (data: StudentPersonalInfoUpdate) => {
    try {
      const updateData: StudentPersonalInfoUpdate = {
        ...data,
        avatar_file: selectedAvatar || undefined,
      };

      await updatePersonalInfo(updateData);
      toast.success("Cập nhật thông tin cá nhân thành công!");
      setSelectedAvatar(null);
      setIsEditing(false); // ✅ Exit edit mode after successful save
    } catch (error: any) {
      toast.error(error.message || "Cập nhật thông tin thất bại");
    }
  };

  // ✅ Format display values
  const formatGender = (gender?: string) => {
    const genderOptions = [
      { value: "male", label: "Nam" },
      { value: "female", label: "Nữ" },
      { value: "other", label: "Khác" },
    ];
    return (
      genderOptions.find((opt) => opt.value === gender)?.label ||
      "Chưa cập nhật"
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa cập nhật";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatAddress = () => {
    if (user?.address) return user.address;
    if (user?.structured_address?.detail_address)
      return user.structured_address.detail_address;
    return "Chưa cập nhật";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      {/* ✅ Header with edit toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <UserIcon className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">
            Thông tin cá nhân
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleEditToggle}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <XCircleIcon className="w-5 h-5" />
                <span>Hủy</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleEditToggle}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PencilIcon className="w-5 h-5" />
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        /* ✅ EDIT MODE - Form */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                {selectedAvatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              <label className="mt-3 cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <PhotoIcon className="w-4 h-4 inline mr-2" />
                Chọn ảnh
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1 text-center">
                JPG, PNG. Tối đa 5MB
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên *
              </label>
              <input
                {...register("full_name", {
                  required: "Vui lòng nhập họ và tên",
                  minLength: {
                    value: 2,
                    message: "Họ và tên phải có ít nhất 2 ký tự",
                  },
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập họ và tên"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                {...register("phone_number", {
                  pattern: {
                    value: /^(\+84|0)[3|5|7|8|9][0-9]{8}$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                })}
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0123456789"
              />
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone_number.message}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới tính
              </label>
              <select
                {...register("gender")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày sinh
              </label>
              <input
                {...register("date_of_birth")}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ
            </label>
            <AddressSelector
              selectedProvince={
                watch("structured_address")?.province_code || ""
              }
              selectedDistrict={
                watch("structured_address")?.district_code || ""
              }
              selectedWard={watch("structured_address")?.ward_code || ""}
              detailAddress={watch("structured_address")?.detail_address || ""}
              onProvinceChange={handleProvinceChange}
              onDistrictChange={handleDistrictChange}
              onWardChange={handleWardChange}
              onDetailAddressChange={handleDetailAddressChange}
              isEditing={true}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleEditToggle}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!isDirty || isUpdatingPersonal}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckIcon className="w-5 h-5" />
              <span>{isUpdatingPersonal ? "Đang lưu..." : "Lưu thay đổi"}</span>
            </button>
          </div>
        </form>
      ) : (
        /* ✅ VIEW MODE - Display Information */
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Information Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên
              </label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                {user?.full_name || "Chưa cập nhật"}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                {user?.phone_number || "Chưa cập nhật"}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới tính
              </label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                {formatGender(user?.gender)}
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày sinh
              </label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                {formatDate(user?.date_of_birth)}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                {user?.email || "Chưa cập nhật"}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                {formatAddress()}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StudentPersonalInfoSection;
