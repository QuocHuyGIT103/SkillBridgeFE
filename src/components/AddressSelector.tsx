import React, { useState, useEffect } from "react";
import { ChevronDownIcon, MapPinIcon } from "@heroicons/react/24/outline";
import AddressService from "../services/address.service";
import type {
  Province,
  District,
  Ward,
  AddressSelectorProps,
} from "../types/address.types";

const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedProvince,
  selectedDistrict,
  selectedWard,
  detailAddress,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  onDetailAddressChange,
  isEditing = false,
  className = "",
  provinceInfo,
  districtInfo,
  wardInfo,
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading((prev) => ({ ...prev, provinces: true }));
      try {
        const response = await AddressService.getProvinces();
        console.log("Provinces response:", response);
        console.log("Response type:", typeof response);
        console.log("Response keys:", Object.keys(response));
        console.log("Is array:", Array.isArray(response));

        // Check if response is directly an array or has success/data structure
        if (Array.isArray(response)) {
          console.log(
            "Setting provinces (direct array):",
            response.length,
            "items"
          );
          setProvinces(response);
        } else if (response.success && response.data) {
          console.log(
            "Setting provinces (success/data):",
            response.data.length,
            "items"
          );
          setProvinces(response.data);
        } else {
          console.log("Unexpected response format:", response);
        }
      } catch (error) {
        console.error("Error fetching provinces:", error);
      } finally {
        setLoading((prev) => ({ ...prev, provinces: false }));
      }
    };

    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        setLoading((prev) => ({ ...prev, districts: true }));
        try {
          const response = await AddressService.getDistrictsByProvince(
            selectedProvince
          );
          console.log("Districts response:", response);
          if (response.success && response.data) {
            console.log("Setting districts:", response.data.length, "items");
            setDistricts(response.data);
          }
        } catch (error) {
          console.error("Error fetching districts:", error);
        } finally {
          setLoading((prev) => ({ ...prev, districts: false }));
        }
      };

      fetchDistricts();
    } else {
      setDistricts([]);
    }
  }, [selectedProvince]);

  // Fetch wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        setLoading((prev) => ({ ...prev, wards: true }));
        try {
          const response = await AddressService.getWardsByDistrict(
            selectedDistrict
          );
          console.log("Wards response:", response);
          if (response.success && response.data) {
            console.log("Setting wards:", response.data.length, "items");
            setWards(response.data);
          }
        } catch (error) {
          console.error("Error fetching wards:", error);
        } finally {
          setLoading((prev) => ({ ...prev, wards: false }));
        }
      };

      fetchWards();
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  const getSelectedProvinceName = () => {
    if (provinceInfo) return provinceInfo.name;
    return provinces.find((p) => p.code === selectedProvince)?.name || "";
  };

  const getSelectedDistrictName = () => {
    if (districtInfo) return districtInfo.name;
    return districts.find((d) => d.code === selectedDistrict)?.name || "";
  };

  const getSelectedWardName = () => {
    if (wardInfo) return wardInfo.name;
    return wards.find((w) => w.code === selectedWard)?.name || "";
  };

  if (!isEditing) {
    // Display mode - compact version
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-start space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <MapPinIcon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {selectedProvince && selectedDistrict && selectedWard ? (
              <div>
                <p className="font-medium">
                  {getSelectedWardName()}, {getSelectedDistrictName()},{" "}
                  {getSelectedProvinceName()}
                </p>
                {detailAddress && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {detailAddress}
                  </p>
                )}
              </div>
            ) : (
              <span>Chưa cập nhật</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Debug: Log current state
  console.log("AddressSelector state:", {
    provinces: provinces.length,
    districts: districts.length,
    wards: wards.length,
    loading,
    selectedProvince,
    selectedDistrict,
    selectedWard,
  });

  // Edit mode - compact version
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Province and District in one row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Province */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Tỉnh/Thành phố
          </label>
          <div className="relative">
            <select
              value={selectedProvince || ""}
              onChange={(e) => onProvinceChange(e.target.value)}
              disabled={loading.provinces}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">
                {loading.provinces ? "Đang tải..." : "Chọn tỉnh/thành phố"}
              </option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
              {/* Debug info */}
              {provinces.length === 0 && !loading.provinces && (
                <option value="" disabled>
                  Không có dữ liệu
                </option>
              )}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* District */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Quận/Huyện
          </label>
          <div className="relative">
            <select
              value={selectedDistrict || ""}
              onChange={(e) => onDistrictChange(e.target.value)}
              disabled={!selectedProvince || loading.districts}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-700"
            >
              <option value="">
                {loading.districts
                  ? "Đang tải..."
                  : !selectedProvince
                  ? "Chọn tỉnh trước"
                  : "Chọn quận/huyện"}
              </option>
              {districts.map((district) => (
                <option key={district.code} value={district.code}>
                  {district.name}
                </option>
              ))}
              {/* Debug info */}
              {districts.length === 0 &&
                !loading.districts &&
                selectedProvince && (
                  <option value="" disabled>
                    Không có dữ liệu quận/huyện
                  </option>
                )}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Ward and Detail Address in one row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Ward */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Phường/Xã
          </label>
          <div className="relative">
            <select
              value={selectedWard || ""}
              onChange={(e) => onWardChange(e.target.value)}
              disabled={!selectedDistrict || loading.wards}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-700"
            >
              <option value="">
                {loading.wards
                  ? "Đang tải..."
                  : !selectedDistrict
                  ? "Chọn quận trước"
                  : "Chọn phường/xã"}
              </option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.code}>
                  {ward.name}
                </option>
              ))}
              {/* Debug info */}
              {wards.length === 0 && !loading.wards && selectedDistrict && (
                <option value="" disabled>
                  Không có dữ liệu phường/xã
                </option>
              )}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Detail Address */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Địa chỉ chi tiết
          </label>
          <input
            type="text"
            value={detailAddress || ""}
            onChange={(e) => onDetailAddressChange(e.target.value)}
            placeholder="Số nhà, tên đường..."
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>
    </div>
  );
};

export default AddressSelector;
