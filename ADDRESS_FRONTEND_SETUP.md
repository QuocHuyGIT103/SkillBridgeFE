# Hướng dẫn sử dụng chức năng địa chỉ Việt Nam - Frontend

## Tổng quan

Frontend đã được cập nhật để hỗ trợ chức năng chọn địa chỉ Việt Nam với các combo box cho tỉnh/thành phố, quận/huyện, phường/xã và địa chỉ chi tiết.

## Các thành phần đã tạo

### 1. Types (`src/types/address.types.ts`)

- `Province`: Interface cho tỉnh/thành phố
- `District`: Interface cho quận/huyện
- `Ward`: Interface cho phường/xã
- `StructuredAddress`: Interface cho địa chỉ có cấu trúc
- `AddressSelectorProps`: Props cho component AddressSelector

### 2. Service (`src/services/address.service.ts`)

- `getProvinces()`: Lấy danh sách tỉnh/thành phố
- `getDistrictsByProvince(provinceCode)`: Lấy quận/huyện theo tỉnh
- `getWardsByDistrict(districtCode)`: Lấy phường/xã theo quận/huyện
- `getAddressInfo()`: Lấy thông tin địa chỉ theo mã
- `getFullAddressInfo()`: Lấy thông tin địa chỉ đầy đủ

### 3. Component (`src/components/AddressSelector.tsx`)

Component chính để chọn địa chỉ với các tính năng:

- Hiển thị 3 combo box: Tỉnh/Thành phố, Quận/Huyện, Phường/Xã
- Tự động load dữ liệu khi chọn tỉnh/quận
- Hiển thị địa chỉ chi tiết
- Hỗ trợ cả chế độ chỉnh sửa và hiển thị

### 4. Store (`src/store/tutorProfile.store.ts`)

Đã được cập nhật để hỗ trợ:

- `structured_address` trong User interface
- `structured_address` trong PersonalInfoUpdate interface

### 5. Page (`src/pages/tutor/TutorPersonalProfilePage.tsx`)

Đã được cập nhật để:

- Sử dụng AddressSelector thay vì textarea địa chỉ
- Quản lý state cho structured_address
- Lưu và hiển thị địa chỉ có cấu trúc

## Cách sử dụng

### 1. Import component

```typescript
import AddressSelector from "../../components/AddressSelector";
import type { StructuredAddress } from "../../types/address.types";
```

### 2. Sử dụng trong component

```typescript
const [structuredAddress, setStructuredAddress] = useState<StructuredAddress>({
  province_code: "",
  district_code: "",
  ward_code: "",
  detail_address: "",
});

<AddressSelector
  selectedProvince={structuredAddress.province_code}
  selectedDistrict={structuredAddress.district_code}
  selectedWard={structuredAddress.ward_code}
  detailAddress={structuredAddress.detail_address}
  onProvinceChange={(provinceCode) => {
    setStructuredAddress((prev) => ({
      ...prev,
      province_code: provinceCode,
      district_code: "",
      ward_code: "",
    }));
  }}
  onDistrictChange={(districtCode) => {
    setStructuredAddress((prev) => ({
      ...prev,
      district_code: districtCode,
      ward_code: "",
    }));
  }}
  onWardChange={(wardCode) => {
    setStructuredAddress((prev) => ({
      ...prev,
      ward_code: wardCode,
    }));
  }}
  onDetailAddressChange={(detailAddress) => {
    setStructuredAddress((prev) => ({
      ...prev,
      detail_address: detailAddress,
    }));
  }}
  isEditing={isEditing}
/>;
```

## API Endpoints được sử dụng

- `GET /api/v1/address/provinces` - Lấy danh sách tỉnh/thành phố
- `GET /api/v1/address/provinces/:provinceCode/districts` - Lấy quận/huyện
- `GET /api/v1/address/districts/:districtCode/wards` - Lấy phường/xã

## Cấu trúc dữ liệu

### StructuredAddress

```typescript
interface StructuredAddress {
  province_code?: string; // Mã tỉnh/thành phố
  district_code?: string; // Mã quận/huyện
  ward_code?: string; // Mã phường/xã
  detail_address?: string; // Địa chỉ chi tiết
}
```

### Response từ API

```typescript
// Province
{
  code: "01",
  name: "Hà Nội",
  name_en: "Ha Noi",
  full_name: "Thành phố Hà Nội",
  // ...
}

// District
{
  code: "001",
  name: "Ba Đình",
  province_code: "01",
  // ...
}

// Ward
{
  code: "00001",
  name: "Phúc Xá",
  district_code: "001",
  // ...
}
```

## Tính năng

### 1. Chế độ chỉnh sửa

- Hiển thị 3 combo box để chọn địa chỉ
- Tự động load dữ liệu khi chọn tỉnh/quận
- Reset quận/xã khi thay đổi tỉnh/quận
- Textarea cho địa chỉ chi tiết

### 2. Chế độ hiển thị

- Hiển thị địa chỉ đầy đủ: "Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
- Hiển thị địa chỉ chi tiết nếu có
- Hiển thị "Chưa cập nhật" nếu chưa có dữ liệu

### 3. Loading states

- Hiển thị trạng thái loading khi fetch dữ liệu
- Disable combo box khi đang loading
- Xử lý lỗi khi không thể load dữ liệu

## Lưu ý

1. **Dependencies**: Cần đảm bảo backend đã chạy và có dữ liệu địa chỉ
2. **Error handling**: Component có xử lý lỗi cơ bản, hiển thị trong console
3. **Performance**: Dữ liệu được cache trong component state
4. **Validation**: Cần thêm validation phía frontend nếu cần

## Troubleshooting

### Lỗi không load được dữ liệu

- Kiểm tra backend có chạy không
- Kiểm tra API endpoints có hoạt động không
- Kiểm tra console để xem lỗi chi tiết

### Lỗi TypeScript

- Đảm bảo đã import đúng types
- Kiểm tra interface StructuredAddress có đúng không

### Lỗi hiển thị

- Kiểm tra props được truyền đúng không
- Kiểm tra state management có đúng không

## Phát triển tiếp

### Phase 2: Tích hợp bản đồ

- Thêm Google Maps API
- Chọn địa chỉ trực tiếp trên bản đồ
- Geocoding để chuyển đổi tọa độ thành địa chỉ

### Cải tiến

- Thêm tìm kiếm địa chỉ
- Cache dữ liệu địa chỉ
- Validation địa chỉ chi tiết hơn
- Hiển thị loading skeleton
