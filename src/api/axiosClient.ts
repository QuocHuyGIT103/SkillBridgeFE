import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

class AxiosClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: "http://localhost:3000/api/v1", // Change this to match your backend URL
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // ✅ Log response để debug
        console.log("✅ API Response:", {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });

        // Any status code that lies within the range of 2xx
        return response.data;
      },
      (error: AxiosError) => {
        // Handle error responses
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const errorData = error.response.data as any;
          return Promise.reject({
            success: false,
            message: errorData.message || "Đã xảy ra lỗi",
            data: errorData.data,
            status: error.response.status,
          });
        } else if (error.request) {
          // The request was made but no response was received
          return Promise.reject({
            success: false,
            message: "Không thể kết nối đến máy chủ",
            data: null,
          });
        } else {
          // Something happened in setting up the request that triggered an Error
          return Promise.reject({
            success: false,
            message: error.message || "Đã xảy ra lỗi",
            data: null,
          });
        }
      }
    );
  }

  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.instance.get<any, ApiResponse<T>>(url, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.instance.post<any, ApiResponse<T>>(url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.instance.put<any, ApiResponse<T>>(url, data, config);
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.instance.delete<any, ApiResponse<T>>(url, config);
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.instance.patch<any, ApiResponse<T>>(url, data, config);
  }
}

const axiosClient = new AxiosClient();
export default axiosClient;
