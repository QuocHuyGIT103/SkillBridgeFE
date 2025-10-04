export interface Province {
  code: string;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  code_name: string;
  administrative_unit_id: number;
  administrative_region_id: number;
}

export interface District {
  code: string;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  code_name: string;
  province_code: string;
  administrative_unit_id: number;
}

export interface Ward {
  code: string;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  code_name: string;
  district_code: string;
  administrative_unit_id: number;
}

export interface StructuredAddress {
  province_code?: string;
  district_code?: string;
  ward_code?: string;
  detail_address?: string;
  // Populated address info from backend (added to fix TypeScript errors)
  province_info?: Province;
  district_info?: District;
  ward_info?: Ward;
}

// Extended interface for backend response
export interface StructuredAddressWithInfo extends StructuredAddress {
  province_info?: Province;
  district_info?: District;
  ward_info?: Ward;
}

export interface AddressInfo {
  province?: Province;
  district?: District;
  ward?: Ward;
}

export interface FullAddressInfo {
  province: Province;
  district: District;
  ward: Ward;
  full_address: string;
}

export interface AddressSelectorProps {
  selectedProvince?: string;
  selectedDistrict?: string;
  selectedWard?: string;
  detailAddress?: string;
  onProvinceChange: (provinceCode: string) => void;
  onDistrictChange: (districtCode: string) => void;
  onWardChange: (wardCode: string) => void;
  onDetailAddressChange: (detailAddress: string) => void;
  isEditing?: boolean;
  className?: string;
  // For display mode - populated address info from backend
  provinceInfo?: Province;
  districtInfo?: District;
  wardInfo?: Ward;
}
