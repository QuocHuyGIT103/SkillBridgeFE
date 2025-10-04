import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import usePostStore from '../../store/post.store';
import type { IPostInput, IPost } from '../../types';
import { toast } from 'react-hot-toast';
import { subjectOptions, gradeLevelOptions, availabilityOptions, timeOfDayOptions } from '../../constants/formOptions';
import RangeSlider from '../../components/RangeSlider';

const PostFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedPost, isLoading, error, getPostById, createPost, updatePost } = usePostStore();

  const isEditMode = !!id; // Cờ để xác định chế độ chỉnh sửa hay tạo mới

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<IPostInput>({
    defaultValues: {
      title: '',
      content: '',
      subjects: [],
      grade_levels: [],
      location: '',
      is_online: false,
      hourly_rate: { min: 0, max: 0 },
      availability: '',
      requirements: '',
      expiry_date: '',
    },
  });

  // Lấy chi tiết bài đăng khi ở chế độ chỉnh sửa
  useEffect(() => {
    if (isEditMode && id) {
      getPostById(id);
    }
  }, [id, isEditMode, getPostById]);

  // Cập nhật form khi selectedPost thay đổi (chế độ chỉnh sửa)
  // Cập nhật useEffect để phân tích availability khi load dữ liệu từ backend
  useEffect(() => {
    if (isEditMode && selectedPost) {
      // Phân tích chuỗi availability để lấy ngày và thời gian
      let selectedDaysArray: string[] = [];
      let selectedTimesArray: string[] = [];
      
      const availability = (selectedPost as any).availability || '';
      
      if (availability) {
        // Kiểm tra nếu có định dạng "ngày (thời gian)"
        const match = availability.match(/^(.*?)\s*\((.*?)\)$/);
        
        if (match) {
          // Trường hợp có cả ngày và thời gian
          selectedDaysArray = match[1].split(', ').map((day: string) => day.trim());
          selectedTimesArray = match[2].split(', ').map((time: string) => time.trim());
        } else if (availability.includes('Các buổi')) {
          // Trường hợp chỉ có thời gian  
          selectedTimesArray = availability.replace('Các buổi ', '').split(', ').map((time: string) => time.trim());
        } else {
          // Trường hợp chỉ có ngày
          selectedDaysArray = availability.split(', ').map((day: string) => day.trim());
        }
      }

      reset({
        title: selectedPost.title,
        content: selectedPost.content,
        subjects: selectedPost.subjects,
        grade_levels: selectedPost.grade_levels,
        location: selectedPost.location || '',
        is_online: selectedPost.is_online || false,
        hourly_rate: selectedPost.hourly_rate || { min: 0, max: 0 },
        availability: (selectedPost as any).availability || '',
        requirements: (selectedPost as any).requirements || '',
        expiry_date: (selectedPost as any).expiry_date
          ? new Date((selectedPost as any).expiry_date).toISOString().split('T')[0]
          : '',
        selectedDays: selectedDaysArray,
        selectedTimes: selectedTimesArray,
      });
    }
  }, [selectedPost, isEditMode, reset]);

  // Xử lý submit form
  const onSubmit = async (data: IPostInput) => {
    const formattedData = {
      ...data,
      hourly_rate: {
        min: Number(data.hourly_rate?.min) || 0,
        max: Number(data.hourly_rate?.max) || 0,
      },
      expiry_date: data.expiry_date || undefined,
    };

    try {
      let success: boolean;
      if (isEditMode && id) {
        success = await updatePost(id, formattedData);
      } else {
        success = await createPost(formattedData);
      }

      if (success) {
        toast.success(isEditMode ? 'Cập nhật bài đăng thành công!' : 'Tạo bài đăng thành công! Chờ admin duyệt.');
        navigate('/student/my-posts');
      } else {
        toast.error(error || (isEditMode ? 'Cập nhật bài đăng thất bại.' : 'Tạo bài đăng thất bại.'));
      }
    } catch (err) {
      toast.error('Lỗi khi xử lý bài đăng.');
    }
  };

  // Theo dõi giá trị của các trường lịch học
  const selectedDays = watch('selectedDays') || [];
  const selectedTimes = watch('selectedTimes') || [];

  // Cập nhật trường availability khi selectedDays hoặc selectedTimes thay đổi
  useEffect(() => {
    if (selectedDays.length > 0 && selectedTimes.length > 0) {
      const daysText = selectedDays.join(', ');
      const timesText = selectedTimes.join(', ');
      setValue('availability', `${daysText} (${timesText})`);
    } else if (selectedDays.length > 0) {
      setValue('availability', selectedDays.join(', '));
    } else if (selectedTimes.length > 0) {
      setValue('availability', `Các buổi ${selectedTimes.join(', ')}`);
    } else {
      setValue('availability', '');
    }
  }, [selectedDays, selectedTimes, setValue]);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
        {isEditMode ? 'Chỉnh Sửa Yêu Cầu Tìm Gia Sư' : 'Tạo Yêu Cầu Tìm Gia Sư'}
      </h1>

      {isLoading && <p className="text-center text-gray-600">Đang tải...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {isEditMode && selectedPost && selectedPost.status === 'rejected' && selectedPost.admin_note && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
          <strong>Lý do từ chối:</strong> {selectedPost.admin_note}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề
          </label>
          <input
            id="title"
            type="text"
            {...register('title', {
              required: 'Tiêu đề không được để trống',
              maxLength: { value: 200, message: 'Tiêu đề không được vượt quá 200 ký tự' },
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Nội dung chi tiết
          </label>
          <textarea
            id="content"
            rows={6}
            {...register('content', {
              required: 'Nội dung không được để trống',
              maxLength: { value: 5000, message: 'Nội dung không được vượt quá 5000 ký tự' },
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.content && <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>}
        </div>

        <div>
          <label htmlFor="subjects" className="block text-sm font-medium text-gray-700 mb-1">
            Môn học
          </label>
          <Controller
            name="subjects"
            control={control}
            rules={{ required: 'Vui lòng chọn ít nhất một môn học', validate: (value) => value.length <= 10 || 'Không được chọn quá 10 môn học' }}
            render={({ field: { onChange, value } }) => (
              <Select
                isMulti
                options={subjectOptions}
                placeholder="Chọn môn học..."
                value={subjectOptions.filter((option) => value.includes(option.value))}
                onChange={(selected) => onChange(selected.map((option) => option.value))}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            )}
          />
          {errors.subjects && <p className="text-red-600 text-sm mt-1">{errors.subjects.message}</p>}
        </div>

        <div>
          <label htmlFor="grade_levels" className="block text-sm font-medium text-gray-700 mb-1">
            Lớp
          </label>
          <Controller
            name="grade_levels"
            control={control}
            rules={{ required: 'Vui lòng chọn ít nhất một lớp', validate: (value) => value.length <= 10 || 'Không được chọn quá 10 lớp' }}
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
          {errors.grade_levels && <p className="text-red-600 text-sm mt-1">{errors.grade_levels.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Địa điểm
            </label>
            <input
              id="location"
              type="text"
              {...register('location', { maxLength: { value: 200, message: 'Địa điểm không được vượt quá 200 ký tự' } })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="VD: Cầu Giấy, Hà Nội"
            />
            {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>}
          </div>
        </div>
          
        {/* Trường availability ẩn để lưu giá trị kết hợp */}
        <input type="hidden" {...register('availability')} />
        
        {/* Thay thế input text bằng 2 Select cho ngày và thời gian */}
        <div className="relative z-40">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lịch học dự kiến
          </label>
          <div className="space-y-3">
            <Controller
              name="selectedDays"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <Select
                  isMulti
                  options={availabilityOptions}
                  placeholder="Chọn ngày học..."
                  value={availabilityOptions.filter((option) => field.value?.includes(option.value))}
                  onChange={(selected) => field.onChange(selected.map((option) => option.value))}
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
              )}
            />
            
            <Controller
              name="selectedTimes"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <Select
                  isMulti
                  options={timeOfDayOptions}
                  placeholder="Chọn thời gian trong ngày..."
                  value={timeOfDayOptions.filter((option) => field.value?.includes(option.value))}
                  onChange={(selected) => field.onChange(selected.map((option) => option.value))}
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-8 relative z-30">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Học phí/buổi
            </label>
            <div className="mb-2 flex justify-between">
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
            
            {/* Hiển thị lỗi nếu có */}
            {errors.hourly_rate?.min && <p className="text-red-600 text-sm mt-1">{errors.hourly_rate.min.message}</p>}
            {errors.hourly_rate?.max && <p className="text-red-600 text-sm mt-1">{errors.hourly_rate.max.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
            Yêu cầu cho gia sư
          </label>
          <textarea
            id="requirements"
            rows={3}
            {...register('requirements', { maxLength: { value: 1000, message: 'Yêu cầu không được vượt quá 1000 ký tự' } })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="VD: Sinh viên năm 3, có kinh nghiệm dạy lớp 9..."
          />
          {errors.requirements && <p className="text-red-600 text-sm mt-1">{errors.requirements.message}</p>}
        </div>

        <div>
          <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700 mb-1">
            Ngày hết hạn
          </label>
          <input
            id="expiry_date"
            type="date"
            {...register('expiry_date')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.expiry_date && <p className="text-red-600 text-sm mt-1">{errors.expiry_date.message}</p>}
        </div>

        <div className="flex items-center gap-4">
          <input id="is_online" type="checkbox" {...register('is_online')} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
          <label htmlFor="is_online" className="text-sm font-medium text-gray-700">
            Nhận dạy trực tuyến
          </label>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/student/my-posts')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'Đang xử lý...' : isEditMode ? 'Cập nhật' : 'Gửi yêu cầu'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostFormPage;