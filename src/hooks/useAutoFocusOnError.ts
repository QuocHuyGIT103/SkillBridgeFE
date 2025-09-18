import { useEffect, useRef } from "react";

// Mapping giữa field names và input IDs/names
const FIELD_TO_INPUT_ID: Record<string, string> = {
  full_name: "full_name",
  phone_number: "phone_number",
  gender: "gender",
  date_of_birth: "date_of_birth",
  address: "address",
  headline: "headline",
  introduction: "introduction",
  teaching_experience: "teaching_experience",
  student_levels: "student_levels",
  video_intro_link: "video_intro_link",
};

export const useAutoFocusOnError = (
  validationErrors: Array<{ field: string; message: string }> | null
) => {
  const focusAttempted = useRef(false);

  useEffect(() => {
    if (
      validationErrors &&
      validationErrors.length > 0 &&
      !focusAttempted.current
    ) {
      // Focus vào field có lỗi đầu tiên
      const firstErrorField = validationErrors[0].field;
      const inputId = FIELD_TO_INPUT_ID[firstErrorField];

      if (inputId) {
        // Timeout để đảm bảo DOM đã được render
        setTimeout(() => {
          const element =
            document.getElementById(inputId) ||
            (document.querySelector(`[name="${inputId}"]`) as HTMLElement);

          if (element) {
            element.focus();
            // Scroll đến element nếu cần
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });

            // Thêm highlight effect
            element.classList.add("focus-error");
            setTimeout(() => {
              element.classList.remove("focus-error");
            }, 2000);
          }
        }, 100);

        focusAttempted.current = true;
      }
    }

    // Reset flag khi errors thay đổi
    if (!validationErrors) {
      focusAttempted.current = false;
    }
  }, [validationErrors]);
};
