import axios from "axios";
import type { ComponentMaterial, PageData, PageSchema } from "@/types";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export const materialApi = {
  getAll: (): Promise<{ success: boolean; data: ComponentMaterial[] }> =>
    api.get("/materials"),

  getByCategory: (
    category: string
  ): Promise<{ success: boolean; data: ComponentMaterial[] }> =>
    api.get(`/materials/${category}`),
};

export const pageApi = {
  create: (
    name: string,
    isTemplate?: boolean
  ): Promise<{ success: boolean; data: PageData }> =>
    api.post("/pages", { name, isTemplate }),

  getList: (
    template?: boolean
  ): Promise<{ success: boolean; data: PageData[] }> =>
    api.get("/pages", { params: { template } }),

  getById: (id: string): Promise<{ success: boolean; data: PageData }> =>
    api.get(`/pages/${id}`),

  update: (
    id: string,
    updates: Partial<PageData>
  ): Promise<{ success: boolean; data: PageData }> =>
    api.put(`/pages/${id}`, updates),

  delete: (id: string): Promise<{ success: boolean }> =>
    api.delete(`/pages/${id}`),

  publish: (id: string): Promise<{ success: boolean; data: PageData }> =>
    api.post(`/pages/${id}/publish`),

  duplicate: (
    id: string,
    name: string
  ): Promise<{ success: boolean; data: PageData }> =>
    api.post(`/pages/${id}/duplicate`, { name }),
};
