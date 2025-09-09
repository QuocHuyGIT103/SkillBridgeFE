import React from 'react';
import { Brain, Shield, Video, CreditCard, MessageSquare, Calendar, Star, Users, BookOpen } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: "AI Gợi ý thông minh",
    description: "Hệ thống AI phân tích nhu cầu học tập và gợi ý gia sư phù hợp nhất với từng học viên.",
  },
  {
    icon: Shield,
    title: "Blockchain minh bạch",
    description: "Hợp đồng học tập được lưu trữ trên Blockchain, đảm bảo minh bạch và không thể chỉnh sửa.",
  },
  {
    icon: Video,
    title: "Học trực tuyến",
    description: "Lớp học trực tuyến chất lượng cao với công cụ tương tác và chia sẻ màn hình.",
  },
  {
    icon: CreditCard,
    title: "Thanh toán an toàn",
    description: "Hệ thống thanh toán tích hợp với nhiều phương thức, bảo mật tuyệt đối.",
  },
  {
    icon: MessageSquare,
    title: "Chat thời gian thực",
    description: "Trao đổi trực tiếp với gia sư qua chat, chia sẻ tài liệu và hỗ trợ 24/7.",
  },
  {
    icon: Calendar,
    title: "Quản lý lịch học",
    description: "Đặt lịch linh hoạt, nhận thông báo và đồng bộ với calendar cá nhân.",
  },
  {
    icon: Star,
    title: "Đánh giá chất lượng",
    description: "Hệ thống đánh giá minh bạch giúp học viên chọn gia sư phù hợp.",
  },
  {
    icon: Users,
    title: "Cộng đồng học tập",
    description: "Kết nối với cộng đồng học viên, chia sẻ kinh nghiệm và tài liệu học tập.",
  },
  {
    icon: BookOpen,
    title: "Thư viện tài liệu",
    description: "Kho tài liệu phong phú với bài giảng, bài tập và tài liệu tham khảo.",
  },
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 sm:py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-gray-900">Tính năng nổi bật</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            SkillBridge mang đến trải nghiệm học tập hiện đại với công nghệ tiên tiến
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
                  <feature.icon className="h-5 w-5 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;