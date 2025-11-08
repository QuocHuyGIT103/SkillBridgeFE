import React from 'react';
import { NavLink } from 'react-router-dom';
import { Star, Quote, ArrowRight } from 'lucide-react';

const testimonials = [
	{
		name: 'Nguyễn Minh Anh',
		role: 'Học sinh lớp 12',
		subject: 'Toán học',
		rating: 5,
		content:
			'SkillBridge đã giúp mình tìm được gia sư Toán tuyệt vời. Cô giáo rất tận tâm và phương pháp dạy phù hợp với mình. Điểm số của mình đã cải thiện rõ rệt.',
		avatar: '👩‍🎓',
	},
	{
		name: 'Trần Văn Nam',
		role: 'Sinh viên đại học',
		subject: 'Tiếng Anh',
		rating: 5,
		content:
			'Hệ thống AI của SkillBridge thật tuyệt vời, đã gợi ý cho mình gia sư Tiếng Anh phù hợp hoàn hảo. Giờ mình tự tin giao tiếp tiếng Anh hơn nhiều.',
		avatar: '👨‍💼',
	},
	{
		name: 'Lê Thị Hương',
		role: 'Phụ huynh',
		subject: 'Vật lý',
		rating: 5,
		content:
			'Con mình học Vật lý với thầy qua SkillBridge, tiến bộ rất nhanh. Hệ thống thanh toán minh bạch, mình yên tâm về chất lượng và chi phí.',
		avatar: '👩‍💻',
	},
	{
		name: 'Phạm Đức Minh',
		role: 'Gia sư',
		subject: 'Hóa học',
		rating: 5,
		content:
			'Là gia sư trên SkillBridge, mình thấy nền tảng này rất chuyên nghiệp. Học sinh được ghép nối phù hợp, công cụ dạy học hiện đại và thanh toán nhanh chóng.',
		avatar: '👨‍🏫',
	},
	{
		name: 'Võ Thị Lan',
		role: 'Học sinh cấp 2',
		subject: 'Văn học',
		rating: 5,
		content:
			'Cô giáo Văn của mình trên SkillBridge dạy rất hay, giúp mình hiểu sâu hơn về văn học. Lịch học linh hoạt, phù hợp với thời gian của mình.',
		avatar: '👧',
	},
	{
		name: 'Hoàng Văn Đức',
		role: 'Sinh viên',
		subject: 'Lập trình',
		rating: 5,
		content:
			'SkillBridge giúp mình tìm được mentor lập trình xuất sắc. Từ không biết gì về code, giờ mình đã tự tin làm được những dự án thực tế.',
		avatar: '👨‍💻',
	},
];

const Testimonials: React.FC = () => {
	return (
		<section id="testimonials" className="py-20 sm:py-32 bg-gray-50">
			<div className="container mx-auto px-4">
				<div className="mx-auto max-w-2xl text-center mb-16">
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-gray-900">
						Học viên nói gì về SkillBridge
					</h2>
					<p className="text-lg text-gray-600 leading-relaxed">
						Hàng nghìn học viên và gia sư đã tin tưởng sử dụng SkillBridge
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{testimonials.map((testimonial, index) => (
						<div
							key={index}
							className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
						>
							{/* Quote Icon */}
							<div className="flex justify-between items-start mb-4">
								<Quote className="h-8 w-8 text-teal-600 opacity-20" />
								<div className="flex">
									{[...Array(testimonial.rating)].map((_, i) => (
										<Star
											key={i}
											className="h-4 w-4 fill-yellow-400 text-yellow-400"
										/>
									))}
								</div>
							</div>

							{/* Content */}
							<p className="text-gray-700 mb-6 leading-relaxed text-sm">
								"{testimonial.content}"
							</p>

							{/* Author */}
							<div className="flex items-center space-x-3">
								<div className="text-2xl">{testimonial.avatar}</div>
								<div>
									<div className="font-semibold text-gray-900 text-sm">
										{testimonial.name}
									</div>
									<div className="text-xs text-gray-600">
										{testimonial.role} • {testimonial.subject}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* CTA */}
				<div className="text-center mt-12">
					<NavLink
						to="/testimonials"
						className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
					>
						Xem thêm đánh giá
						<ArrowRight className="ml-2 h-4 w-4" />
					</NavLink>
				</div>
			</div>
		</section>
	);
};

export default Testimonials;
