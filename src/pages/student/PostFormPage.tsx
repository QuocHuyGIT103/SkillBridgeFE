import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import usePostStore from '../../store/post.store';
import { useSubjectStore } from '../../store/subject.store';
import type { IPostInput, IPost, TeachingTimeSlot } from '../../types';
import { toast } from 'react-hot-toast';
import { gradeLevelOptions } from '../../constants/formOptions';
import RangeSlider from '../../components/RangeSlider';
import AddressSelector from '../../components/AddressSelector';

const PostFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedPost, isLoading, error, getPostById, createPost, updatePost } = usePostStore();

  // ✅ Use subject store
  const {
    activeSubjects,
    isLoading: subjectsLoading,
    getActiveSubjects
  } = useSubjectStore();

  const isEditMode = !!id;

  interface TeachingTimeSlot {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }

  const DAYS_OF_WEEK = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];

  // ✅ Category mapping for display
  const CATEGORY_LABELS = {
    'TOAN_HOC': 'Toán học',
    'KHOA_HOC_TU_NHIEN': 'Khoa học tự nhiên',
    'VAN_HOC_XA_HOI': 'Văn học - Xã hội',
    'NGOAI_NGU': 'Ngoại ngữ',
    'KHAC': 'Khác'
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<IPostInput & {
    teachingMode: 'ONLINE' | 'OFFLINE' | 'BOTH';
    address: { province: string; district: string; ward: string; specificAddress: string };
    teachingSchedule: TeachingTimeSlot[];
    sessionDuration: number;
  }>({
    defaultValues: {
      title: '',
      content: '',
      subjects: [],
      grade_levels: [],
      location: '',
      is_online: false,
      hourly_rate: { min: 20000, max: 100000 },
      availability: '',
      requirements: '',
      teachingMode: 'BOTH',
      address: { province: '', district: '', ward: '', specificAddress: '' },
      teachingSchedule: [],
      sessionDuration: 60,
    },
  });

  const [newTimeSlot, setNewTimeSlot] = useState<TeachingTimeSlot>({
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "10:00",
  });

  // ✅ Add address key for force re-render
  const [addressKey, setAddressKey] = useState(0);

  // ✅ Load subjects on component mount
  useEffect(() => {
    getActiveSubjects();
  }, [getActiveSubjects]);

  // ✅ Convert subjects to options for Select component
  const subjectOptions = React.useMemo(() => {
    return activeSubjects.map(subject => ({
      value: subject.name, // Use name as value for backend compatibility
      label: subject.name,
      category: subject.category
    }));
  }, [activeSubjects]);

  // ✅ Group subjects by category for better UX
  const groupedSubjectOptions = React.useMemo(() => {
    if (activeSubjects.length === 0) return [];

    const grouped = activeSubjects.reduce((acc, subject) => {
      const categoryLabel = CATEGORY_LABELS[subject.category as keyof typeof CATEGORY_LABELS] || 'Khác';
      if (!acc[categoryLabel]) {
        acc[categoryLabel] = [];
      }
      acc[categoryLabel].push({
        value: subject.name,
        label: subject.name,
        category: subject.category
      });
      return acc;
    }, {} as Record<string, Array<{ value: string; label: string; category: string }>>);

    return Object.entries(grouped).map(([label, options]) => ({
      label,
      options: options.sort((a, b) => a.label.localeCompare(b.label))
    }));
  }, [activeSubjects]);

  // Lấy chi tiết bài đăng khi ở chế độ chỉnh sửa
  useEffect(() => {
    if (isEditMode && id) {
      getPostById(id);
    }
  }, [id, isEditMode, getPostById]);

  // Cập nhật form khi selectedPost thay đổi (chế độ chỉnh sửa)
  useEffect(() => {
    if (isEditMode && selectedPost && activeSubjects.length > 0) {
      const availability = selectedPost.availability || '';
      const schedule: TeachingTimeSlot[] = [];
      const daysMatch = availability.match(/^(.*?)(?:\s*\((.*?)\))?/);
      if (daysMatch) {
        const daysStr = daysMatch[1].trim();
        const days = daysStr.split(',').map(d => d.trim());
        days.forEach(day => {
          const idx = DAYS_OF_WEEK.findIndex(d => d.includes(day));
          if (idx !== -1) {
            schedule.push({ dayOfWeek: idx, startTime: '08:00', endTime: '10:00' });
          }
        });
      }

      // ✅ Validate subjects exist in current active subjects
      const validSubjects = (selectedPost.subjects || []).filter(subjectName =>
        activeSubjects.some(subject => subject.name === subjectName)
      );

      reset({
        title: selectedPost.title,
        content: selectedPost.content,
        subjects: validSubjects,
        grade_levels: selectedPost.grade_levels || [],
        location: selectedPost.location || '',
        is_online: selectedPost.is_online || false,
        hourly_rate: selectedPost.hourly_rate || { min: 20000, max: 100000 },
        availability: availability,
        requirements: selectedPost.requirements || '',
        teachingMode: selectedPost.is_online ? 'BOTH' : 'OFFLINE',
        address: {
          province: '',
          district: '',
          ward: '',
          specificAddress: selectedPost.location || '',
        },
        teachingSchedule: schedule,
        sessionDuration: 60,
      });
    }
  }, [selectedPost, isEditMode, reset, activeSubjects]);

  const teachingSchedule = watch('teachingSchedule') || [];
  const teachingMode = watch('teachingMode') || 'BOTH';
  const addressData = watch('address') || { province: '', district: '', ward: '', specificAddress: '' };

  // ✅ Reset address when teaching mode changes to ONLINE
  useEffect(() => {
    if (teachingMode === 'ONLINE') {
      setValue('address', { province: '', district: '', ward: '', specificAddress: '' });
      setAddressKey(prev => prev + 1);
    } else {
      setAddressKey(prev => prev + 1);
    }
  }, [teachingMode, setValue]);

  // Cập nhật trường availability khi teachingSchedule thay đổi
  useEffect(() => {
    if (teachingSchedule.length > 0) {
      const groupedByDay: Record<number, string[]> = {};
      teachingSchedule.forEach(slot => {
        if (!groupedByDay[slot.dayOfWeek]) groupedByDay[slot.dayOfWeek] = [];
        groupedByDay[slot.dayOfWeek].push(`${slot.startTime} - ${slot.endTime}`);
      });
      const parts = Object.entries(groupedByDay)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([dayIdx, times]) => `${DAYS_OF_WEEK[Number(dayIdx)]} (${times.join(', ')})`);
      setValue('availability', parts.join(', '));
    } else {
      setValue('availability', '');
    }
  }, [teachingSchedule, setValue]);

  // ✅ Teaching mode change handler
  const handleTeachingModeChange = (mode: 'ONLINE' | 'OFFLINE' | 'BOTH') => {
    setValue('teachingMode', mode);

    if (mode === 'ONLINE') {
      setValue('address', { province: '', district: '', ward: '', specificAddress: '' });
    }

    setAddressKey(prev => prev + 1);
  };

  // ✅ Address change handlers
  const handleAddressChange = {
    province: (provinceCode: string) => {
      setValue('address', {
        province: provinceCode,
        district: '',
        ward: '',
        specificAddress: addressData.specificAddress || '',
      });
    },
    district: (districtCode: string) => {
      setValue('address', {
        ...addressData,
        district: districtCode,
        ward: '',
      });
    },
    ward: (wardCode: string) => {
      setValue('address', {
        ...addressData,
        ward: wardCode,
      });
    },
    detail: (detailAddress: string) => {
      setValue('address', {
        ...addressData,
        specificAddress: detailAddress,
      });
    },
  };

  // Xử lý submit form
  const onSubmit = async (data: any) => {
    // Validation
    if (teachingSchedule.length === 0) {
      toast.error('Phải có ít nhất một khung giờ học');
      return;
    }

    if ((teachingMode === 'OFFLINE' || teachingMode === 'BOTH') &&
      (!data.address?.province || !data.address?.district || !data.address?.ward || !data.address?.specificAddress?.trim())) {
      toast.error('Phải điền đầy đủ thông tin địa chỉ');
      return;
    }

    const formattedData: IPostInput = {
      title: data.title,
      content: data.content,
      subjects: data.subjects, // Already using subject names
      grade_levels: data.grade_levels,
      location: data.address?.specificAddress?.trim() || '',
      is_online: data.teachingMode !== 'OFFLINE',
      hourly_rate: {
        min: Number(data.hourly_rate?.min) || 20000,
        max: Number(data.hourly_rate?.max) || 100000,
      },
      availability: data.availability,
      requirements: data.requirements,
    };

    try {
      const success = isEditMode && id
        ? await updatePost(id, formattedData)
        : await createPost(formattedData);

      if (success) {
        navigate('/student/my-posts');
      }
    } catch (err) {
      toast.error('Lỗi khi xử lý bài đăng.');
    }
  };

  const addTimeSlot = () => {
    if (newTimeSlot.startTime >= newTimeSlot.endTime) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    const hasConflict = teachingSchedule.some(
      (slot) =>
        slot.dayOfWeek === newTimeSlot.dayOfWeek &&
        !(newTimeSlot.endTime <= slot.startTime || newTimeSlot.startTime >= slot.endTime)
    );

    if (hasConflict) {
      toast.error("Khoảng thời gian này bị trùng với lịch đã có!");
      return;
    }

    const newSchedule = [...teachingSchedule, newTimeSlot].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.startTime.localeCompare(b.startTime);
    });

    setValue('teachingSchedule', newSchedule);
    setNewTimeSlot({ dayOfWeek: 1, startTime: "08:00", endTime: "10:00" });
  };

  const removeTimeSlot = (index: number) => {
    const newSchedule = teachingSchedule.filter((_, i) => i !== index);
    setValue('teachingSchedule', newSchedule);
  };

  // ✅ Show loading state for subjects
  if (subjectsLoading && activeSubjects.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-gray-600">Đang tải dữ liệu môn học...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isEditMode ? 'Chỉnh sửa yêu cầu tìm gia sư' : 'Tạo yêu cầu tìm gia sư mới'}
          </h2>
          <p className="text-gray-600">
            Tạo một yêu cầu chi tiết để thu hút gia sư phù hợp với nhu cầu của bạn.
          </p>
          {error && <p className="text-red-600 mt-2">{error}</p>}
          {isEditMode && selectedPost && selectedPost.status === 'rejected' && selectedPost.admin_note && (
            <p className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded mt-2">
              <strong>Lý do từ chối:</strong> {selectedPost.admin_note}
            </p>
          )}
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin cơ bản
          </h3>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('title', {
                required: 'Tiêu đề không được để trống',
                minLength: { value: 10, message: 'Tiêu đề phải có ít nhất 10 ký tự' },
                maxLength: { value: 200, message: 'Tiêu đề không được vượt quá 200 ký tự' },
              })}
              placeholder="VD: Tìm gia sư toán lớp 12 - Cần ôn thi đại học"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.title && <span className="text-sm text-red-600 mt-1 block">{errors.title.message}</span>}
          </div>

          {/* Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={6}
              {...register('content', {
                required: 'Nội dung không được để trống',
                maxLength: { value: 5000, message: 'Nội dung không được vượt quá 5000 ký tự' },
              })}
              placeholder="Mô tả chi tiết về nhu cầu học, mục tiêu, kinh nghiệm mong muốn của gia sư..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.content ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.content && <span className="text-sm text-red-600 mt-1 block">{errors.content.message}</span>}
          </div>

          {/* ✅ Dynamic Subjects from Store */}
          <div className="mb-4 relative z-60">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Môn học <span className="text-red-500">*</span>
            </label>
            <Controller
              name="subjects"
              control={control}
              rules={{
                required: 'Vui lòng chọn ít nhất một môn học',
                validate: (value) => value.length <= 10 || 'Không được chọn quá 10 môn học'
              }}
              render={({ field: { onChange, value } }) => (
                <Select
                  isMulti
                  options={groupedSubjectOptions.length > 0 ? groupedSubjectOptions : subjectOptions}
                  placeholder="Chọn môn học..."
                  value={subjectOptions.filter((option) => value.includes(option.value))}
                  onChange={(selected) => onChange(selected.map((option) => option.value))}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  noOptionsMessage={() => "Không tìm thấy môn học"}
                  loadingMessage={() => "Đang tải..."}
                  isLoading={subjectsLoading}
                  isDisabled={subjectsLoading || activeSubjects.length === 0}
                />
              )}
            />
            {errors.subjects && <span className="text-sm text-red-600 mt-1 block">{errors.subjects.message}</span>}

            {/* ✅ Show selected subjects info */}
            {watch('subjects')?.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Đã chọn {watch('subjects').length} môn học
              </p>
            )}

            {/* ✅ Show warning if no subjects available */}
            {!subjectsLoading && activeSubjects.length === 0 && (
              <p className="text-sm text-orange-600 mt-1">
                Không có môn học nào khả dụng. Vui lòng liên hệ admin.
              </p>
            )}
          </div>

          {/* Grade Levels */}
          <div className="mb-4 relative z-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lớp học <span className="text-red-500">*</span>
            </label>
            <Controller
              name="grade_levels"
              control={control}
              rules={{
                required: 'Vui lòng chọn ít nhất một lớp',
                validate: (value) => value.length <= 10 || 'Không được chọn quá 10 lớp'
              }}
              render={({ field: { onChange, value } }) => (
                <Select
                  isMulti
                  options={gradeLevelOptions}
                  placeholder="Chọn lớp..."
                  value={gradeLevelOptions.filter((option) => value.includes(option.value))}
                  onChange={(selected) => onChange(selected.map((option) => option.value))}
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
              )}
            />
            {errors.grade_levels && <span className="text-sm text-red-600 mt-1 block">{errors.grade_levels.message}</span>}
          </div>
        </div>

        {/* Schedule and Price */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Lịch học và học phí
          </h3>

          {/* Teaching Schedule */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lịch học trong tuần <span className="text-red-500">*</span>
            </label>

            {/* Add new time slot */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="text-sm font-medium mb-3">Thêm khung giờ học</h4>
              <div className="grid grid-cols-4 gap-3">
                <select
                  value={newTimeSlot.dayOfWeek}
                  onChange={(e) =>
                    setNewTimeSlot({
                      ...newTimeSlot,
                      dayOfWeek: Number(e.target.value),
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS_OF_WEEK.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  value={newTimeSlot.startTime}
                  onChange={(e) =>
                    setNewTimeSlot({
                      ...newTimeSlot,
                      startTime: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="time"
                  value={newTimeSlot.endTime}
                  onChange={(e) =>
                    setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Thêm
                </button>
              </div>
            </div>

            {/* Current schedule */}
            {teachingSchedule.length > 0 ? (
              <div className="space-y-2">
                {teachingSchedule.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-3 border rounded"
                  >
                    <span className="text-sm">
                      {DAYS_OF_WEEK[slot.dayOfWeek]}: {slot.startTime} - {slot.endTime}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chưa có khung giờ nào. Hãy thêm ít nhất một khung giờ.</p>
            )}
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Học phí mỗi buổi (VNĐ) <span className="text-red-500">*</span>
              </label>
              <div className="mb-2 flex justify-between text-sm text-gray-600">
                <span>{watch('hourly_rate.min')?.toLocaleString() || '20,000'}đ</span>
                <span>-</span>
                <span>{watch('hourly_rate.max')?.toLocaleString() || '100,000'}đ</span>
              </div>
              <RangeSlider
                min={20000}
                max={500000}
                step={10000}
                minValue={watch('hourly_rate.min') || 20000}
                maxValue={watch('hourly_rate.max') || 100000}
                onChange={(min, max) => {
                  setValue('hourly_rate.min', min);
                  setValue('hourly_rate.max', max);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời lượng mỗi buổi (phút) <span className="text-red-500">*</span>
              </label>
              <select
                {...register('sessionDuration', { required: 'Vui lòng chọn thời lượng' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={30}>30 phút</option>
                <option value={45}>45 phút</option>
                <option value={60}>60 phút</option>
                <option value={90}>90 phút</option>
                <option value={120}>120 phút</option>
              </select>
              {errors.sessionDuration && <span className="text-sm text-red-600 mt-1 block">{errors.sessionDuration.message}</span>}
            </div>
          </div>
        </div>

        {/* Teaching Mode and Location */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Hình thức và địa điểm học
          </h3>

          {/* Teaching Mode */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình thức học <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "ONLINE", label: "Trực tuyến", desc: "Học qua video call" },
                { value: "OFFLINE", label: "Trực tiếp", desc: "Gặp mặt tại địa điểm" },
                { value: "BOTH", label: "Cả hai", desc: "Linh hoạt theo nhu cầu" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`
                    block p-4 border rounded-lg cursor-pointer transition-colors
                    ${teachingMode === option.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"}
                  `}
                >
                  <input
                    type="radio"
                    name="teachingMode"
                    value={option.value}
                    checked={teachingMode === option.value}
                    onChange={(e) => handleTeachingModeChange(e.target.value as any)}
                    className="sr-only"
                  />
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                </label>
              ))}
            </div>
          </div>

          {/* ✅ Address with force re-render */}
          {(teachingMode === "OFFLINE" || teachingMode === "BOTH") && (
            <div className="space-y-4 mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm text-gray-700">
                Thông tin địa chỉ học
              </h4>
              <AddressSelector
                key={addressKey}
                selectedProvince={addressData.province}
                selectedDistrict={addressData.district}
                selectedWard={addressData.ward}
                detailAddress={addressData.specificAddress}
                onProvinceChange={handleAddressChange.province}
                onDistrictChange={handleAddressChange.district}
                onWardChange={handleAddressChange.ward}
                onDetailAddressChange={handleAddressChange.detail}
                isEditing={true}
                className="space-y-4"
              />
            </div>
          )}
        </div>

        {/* Requirements and Expiry */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Yêu cầu thêm
          </h3>

          {/* Requirements */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yêu cầu cho gia sư
            </label>
            <textarea
              id="requirements"
              rows={3}
              {...register('requirements', { maxLength: { value: 1000, message: 'Yêu cầu không được vượt quá 1000 ký tự' } })}
              placeholder="VD: Sinh viên năm 3, có kinh nghiệm dạy lớp 9, ưu tiên nữ..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.requirements && <span className="text-sm text-red-600 mt-1 block">{errors.requirements.message}</span>}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Yêu cầu sẽ được xem xét và phê duyệt trước khi hiển thị công khai.
            </p>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate('/student/my-posts')}
                disabled={isLoading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={isLoading || subjectsLoading || activeSubjects.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {(isLoading || subjectsLoading) && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>
                  {isEditMode ? 'Cập nhật yêu cầu' : 'Gửi yêu cầu'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostFormPage;