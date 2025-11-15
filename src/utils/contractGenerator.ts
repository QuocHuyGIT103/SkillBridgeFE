// Utility functions for generating contract-specific data

/**
 * Generate unique contract code
 * Format: HĐ-YYYYMMDD-XXXX (HĐ = Hợp Đồng)
 * @returns Contract code string
 */
export const generateContractCode = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Generate 4 random characters (A-Z, 0-9)
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomCode = "";
  for (let i = 0; i < 4; i++) {
    randomCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return `HĐ-${year}${month}${day}-${randomCode}`;
};

/**
 * Generate standard contract terms and conditions
 * @param params - Contract parameters
 * @returns Contract terms string
 */
export const generateContractTerms = (params: {
  tutorName: string;
  studentName: string;
  subjectName: string;
  totalSessions: number;
  pricePerSession: number;
  learningMode: "ONLINE" | "OFFLINE";
}): string => {
  const {
    tutorName,
    studentName,
    subjectName,
    totalSessions,
    pricePerSession,
    learningMode,
  } = params;

  const terms = `ĐIỀU KHOẢN HỢP ĐỒNG GIẢNG DẠY

1. CÁC BÊN THAM GIA HỢP ĐỒNG
- Bên A (Gia sư): ${tutorName}
- Bên B (Học viên): ${studentName}
- Môn học: ${subjectName}

2. NỘI DUNG HỢP ĐỒNG
- Tổng số buổi học: ${totalSessions} buổi
- Hình thức: ${
    learningMode === "ONLINE"
      ? "Học trực tuyến (Online)"
      : "Học trực tiếp (Offline)"
  }
- Học phí mỗi buổi: ${new Intl.NumberFormat("vi-VN").format(
    pricePerSession
  )} VNĐ

3. TRÁCH NHIỆM CỦA GIA SƯ (BÊN A)
- Chuẩn bị giáo án và tài liệu giảng dạy phù hợp với trình độ học viên
- Đảm bảo chất lượng giảng dạy theo đúng nội dung đã cam kết
- Đúng giờ và đầy đủ các buổi học theo lịch đã thỏa thuận
- Theo dõi và đánh giá quá trình học tập của học viên
${
  learningMode === "ONLINE"
    ? "- Đảm bảo kết nối internet ổn định và thiết bị học tập đầy đủ"
    : "- Đến đúng địa điểm học đã thỏa thuận"
}

4. TRÁCH NHIỆM CỦA HỌC VIÊN (BÊN B)
- Tham gia đầy đủ và đúng giờ các buổi học
- Chuẩn bị đầy đủ dụng cụ học tập cần thiết
- Hoàn thành bài tập được giao sau mỗi buổi học
- Thanh toán học phí đầy đủ và đúng hạn theo thỏa thuận
${
  learningMode === "ONLINE"
    ? "- Đảm bảo kết nối internet ổn định và môi trường học tập phù hợp"
    : "- Chuẩn bị địa điểm học phù hợp"
}

5. ĐIỀU KHOẢN THANH TOÁN
- Học phí được thanh toán theo lịch trình đã thỏa thuận
- Trong trường hợp nghỉ học có lý do chính đáng, phải thông báo trước ít nhất 24 giờ
- Các buổi học bị nghỉ có lý do sẽ được bù vào thời gian khác

6. ĐIỀU KHOẢN HUỶ HỢP ĐỒNG
- Mỗi bên có quyền đơn phương chấm dứt hợp đồng với thông báo trước 7 ngày
- Trong trường hợp huỷ hợp đồng, các buổi học đã thực hiện sẽ được thanh toán đầy đủ
- Các buổi học chưa thực hiện sẽ được hoàn tiền theo tỷ lệ đã thỏa thuận

7. ĐIỀU KHOẢN KHÁC
- Hai bên cam kết thực hiện đúng các điều khoản đã thỏa thuận
- Mọi thắc mắc và tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng
- Hợp đồng có hiệu lực kể từ ngày học viên xác nhận phê duyệt

Hợp đồng này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.`;

  return terms;
};

/**
 * Generate contract title for display
 * @param params - Contract parameters
 * @returns Contract title
 */
export const generateContractTitle = (params: {
  contractCode: string;
  subjectName: string;
  studentName: string;
}): string => {
  const { contractCode, subjectName, studentName } = params;
  return `${contractCode} - ${subjectName} - ${studentName}`;
};
