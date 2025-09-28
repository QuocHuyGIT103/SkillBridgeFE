import axiosClient from "../api/axiosClient";
import type {
  Province,
  District,
  Ward,
  AddressInfo,
  FullAddressInfo,
} from "../types/address.types";

const AddressService = {
  // Lấy danh sách tất cả tỉnh/thành phố
  getProvinces: async (): Promise<Province[]> => {
    try {
      const response = await axiosClient.get<Province[]>("/address/provinces");
      return response.data;
    } catch (error) {
      console.error("Error fetching provinces:", error);
      throw error;
    }
  },

  // Lấy danh sách quận/huyện theo tỉnh/thành phố
  getDistrictsByProvince: async (provinceCode: string): Promise<District[]> => {
    try {
      const response = await axiosClient.get<District[]>(
        `/address/provinces/${provinceCode}/districts`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching districts:", error);
      throw error;
    }
  },

  // Lấy danh sách phường/xã theo quận/huyện
  getWardsByDistrict: async (districtCode: string): Promise<Ward[]> => {
    try {
      const response = await axiosClient.get<Ward[]>(
        `/address/districts/${districtCode}/wards`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching wards:", error);
      throw error;
    }
  },

  // Lấy thông tin địa chỉ đầy đủ theo mã
  getAddressInfo: async (
    provinceCode?: string,
    districtCode?: string,
    wardCode?: string
  ): Promise<AddressInfo> => {
    try {
      const params = new URLSearchParams();
      if (provinceCode) params.append("provinceCode", provinceCode);
      if (districtCode) params.append("districtCode", districtCode);
      if (wardCode) params.append("wardCode", wardCode);

      const response = await axiosClient.get<AddressInfo>(
        `/address/info?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching address info:", error);
      throw error;
    }
  },

  // Lấy thông tin địa chỉ đầy đủ với tên
  getFullAddressInfo: async (
    provinceCode: string,
    districtCode: string,
    wardCode: string
  ): Promise<FullAddressInfo> => {
    try {
      const params = new URLSearchParams({
        provinceCode,
        districtCode,
        wardCode,
      });

      const response = await axiosClient.get<FullAddressInfo>(
        `/address/full-info?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching full address info:", error);
      throw error;
    }
  },
};

export default AddressService;
