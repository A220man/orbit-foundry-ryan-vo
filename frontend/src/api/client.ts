import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type {
  APIResponse,
  PaginatedResponse,
  PluginRead,
  PluginDetail,
  PluginCreate,
  PluginUpdate,
  HarnessRead,
  HealthResponse,
} from "./types";
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("access_token");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  async health(): Promise<APIResponse<HealthResponse>> {
    const response = await this.client.get<APIResponse<HealthResponse>>("/health");
    return response.data;
  }

  async listPlugins(params?: {
    page?: number;
    page_size?: number;
    category?: string;
    search?: string;
    is_external?: boolean;
  }): Promise<APIResponse<PaginatedResponse<PluginRead>>> {
    const response = await this.client.get<APIResponse<PaginatedResponse<PluginRead>>>("/plugins", { params });
    return response.data;
  }

  async getPlugin(id: number): Promise<APIResponse<PluginDetail>> {
    const response = await this.client.get<APIResponse<PluginDetail>>(`/plugins/${id}`);
    return response.data;
  }

  async getPluginByName(name: string): Promise<APIResponse<PluginDetail>> {
    const response = await this.client.get<APIResponse<PluginDetail>>(`/plugins/by-name/${name}`);
    return response.data;
  }

  async createPlugin(data: PluginCreate): Promise<APIResponse<PluginRead>> {
    const response = await this.client.post<APIResponse<PluginRead>>("/plugins", data);
    return response.data;
  }

  async updatePlugin(id: number, data: PluginUpdate): Promise<APIResponse<PluginRead>> {
    const response = await this.client.put<APIResponse<PluginRead>>(`/plugins/${id}`, data);
    return response.data;
  }

  async deletePlugin(id: number): Promise<APIResponse<null>> {
    const response = await this.client.delete<APIResponse<null>>(`/plugins/${id}`);
    return response.data;
  }

  async listHarnesses(): Promise<APIResponse<PaginatedResponse<HarnessRead>>> {
    const response = await this.client.get<APIResponse<PaginatedResponse<HarnessRead>>>("/harnesses");
    return response.data;
  }

  async getHarness(id: number): Promise<APIResponse<HarnessRead>> {
    const response = await this.client.get<APIResponse<HarnessRead>>(`/harnesses/${id}`);
    return response.data;
  }
}

export const api = new ApiClient();