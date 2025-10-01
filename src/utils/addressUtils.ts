// Utility functions for address formatting and mapping
// TODO: This should be replaced with proper backend population of address names

export interface AddressInfo {
  province?: string;
  district?: string;
  ward?: string;
  specificAddress?: string;
}

/**
 * Format address for display
 * This is a temporary solution until backend properly populates address names
 */
export const formatAddressDisplay = (
  address: AddressInfo,
  includeSpecific: boolean = true
): string => {
  if (!address) return "";

  const parts: string[] = [];

  if (includeSpecific && address.specificAddress) {
    parts.push(address.specificAddress);
  }

  if (address.ward) {
    parts.push(getAddressName(address.ward, "ward"));
  }

  if (address.district) {
    parts.push(getAddressName(address.district, "district"));
  }

  if (address.province) {
    parts.push(getAddressName(address.province, "province"));
  }

  return parts.join(", ");
};

/**
 * Get address name from code
 * This is a simplified mapping - ideally should come from address service
 */
const getAddressName = (
  code: string,
  type: "province" | "district" | "ward"
): string => {
  // Common Vietnam address mappings
  const addressMap: Record<string, Record<string, string>> = {
    province: {
      "79": "TP. Hồ Chí Minh",
      "01": "Hà Nội",
      "48": "Đà Nẵng",
      "92": "Cần Thơ",
      "31": "Hải Phòng",
    },
    district: {
      "760": "Quận 1",
      "769": "Quận 2",
      "770": "Quận 3",
      "771": "Quận 4",
      "772": "Quận 5",
      "773": "Quận 6",
      "774": "Quận 7",
      "775": "Quận 8",
      "778": "Quận 11",
      "783": "Quận Bình Thạnh",
      "784": "Quận Gò Vấp",
      "785": "Quận Phú Nhuận",
      "786": "Quận Tân Bình",
      "787": "Quận Tân Phú",
    },
    ward: {
      "26734": "Phường Bến Nghé",
      "26737": "Phường Bến Thành",
      "26740": "Phường Cầu Kho",
      "26743": "Phường Cầu Ông Lãnh",
      "26746": "Phường Cô Giang",
    },
  };

  return addressMap[type][code] || code; // Fallback to code if name not found
};

/**
 * Format short address for cards/lists
 */
export const formatShortAddress = (address: AddressInfo): string => {
  if (!address) return "";

  const district = address.district
    ? getAddressName(address.district, "district")
    : "";
  const province = address.province
    ? getAddressName(address.province, "province")
    : "";

  if (district && province) {
    return `${district}, ${province}`;
  } else if (province) {
    return province;
  }

  return address.province || ""; // Fallback to code
};

/**
 * Get province name from code
 */
export const getProvinceName = (provinceCode: string): string => {
  const provinceMap: Record<string, string> = {
    "79": "TP. Hồ Chí Minh",
    "01": "Hà Nội",
    "48": "Đà Nẵng",
    "92": "Cần Thơ",
    "31": "Hải Phòng",
    "77": "Bà Rịa - Vũng Tàu",
    "74": "Bình Dương",
    "75": "Đồng Nai",
    "83": "Long An",
    // Add more provinces as needed
  };

  return provinceMap[provinceCode] || provinceCode;
};

/**
 * Get district name from code
 */
export const getDistrictName = (districtCode: string): string => {
  const districtMap: Record<string, string> = {
    // Ho Chi Minh City districts
    "760": "Quận 1",
    "769": "Quận 2",
    "770": "Quận 3",
    "771": "Quận 4",
    "772": "Quận 5",
    "773": "Quận 6",
    "774": "Quận 7",
    "775": "Quận 8",
    "778": "Quận 11",
    "783": "Quận Bình Thạnh",
    "784": "Quận Gò Vấp",
    "785": "Quận Phú Nhuận",
    "786": "Quận Tân Bình",
    "787": "Quận Tân Phú",
    // Add more districts as needed
  };

  return districtMap[districtCode] || districtCode;
};
