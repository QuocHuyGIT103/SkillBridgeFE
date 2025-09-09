# SkillBridge Frontend

Dự án Frontend được xây dựng với ReactJS, TypeScript, HeroUI và Tailwind CSS.

## 🛠️ Công nghệ sử dụng

- **ReactJS 19** - Thư viện JavaScript để xây dựng giao diện người dùng
- **TypeScript** - Ngôn ngữ lập trình có type safety
- **HeroUI** - Thư viện component UI hiện đại (kế thừa từ NextUI)
- **Tailwind CSS** - Framework CSS utility-first
- **Vite** - Build tool nhanh và hiện đại
- **Framer Motion** - Thư viện animation

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js >= 18.0.0
- npm hoặc yarn

### Các bước cài đặt

1. **Cài đặt dependencies**
   ```bash
   npm install
   ```

2. **Chạy dự án ở chế độ development**
   ```bash
   npm run dev
   ```

3. **Build dự án cho production**
   ```bash
   npm run build
   ```

4. **Preview bản build**
   ```bash
   npm run preview
   ```

## 📁 Cấu trúc dự án

```
src/
├── components/          # Các React components
│   ├── layout/         # Layout components (Header, Footer, etc.)
│   └── ui/            # UI components có thể tái sử dụng
├── types/             # TypeScript type definitions
├── utils/            # Utility functions và constants
├── App.tsx          # Main App component
├── main.tsx        # Entry point
└── index.css       # Global styles
```

## 🎨 Styling

Dự án sử dụng kết hợp giữa:
- **Tailwind CSS** cho utility classes
- **HeroUI** cho các components có sẵn
- **CSS Variables** cho theming

## 📱 Responsive Design

Dự án được thiết kế responsive với các breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 🔧 Scripts có sẵn

- `npm run dev` - Chạy development server
- `npm run build` - Build cho production
- `npm run preview` - Preview bản build
- `npm run lint` - Chạy ESLint
```
