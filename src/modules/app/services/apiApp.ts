import type { DevolutionResponseDTO } from "../types/types";
import { OrderStatusEnum } from "../../../types/types";

const VITE_DEVOLUTION_URL = import.meta.env.VITE_DEVOLUTION_API_BASE_URL;

interface ProductToRefundDTO {
  productToDevolutionId: string;
  quantity: number;
}

interface UpdateDevolutionStatusDTO {
  devolutionId: string;
  status: OrderStatusEnum;
  products: ProductToRefundDTO[];
}

// Helper focado apenas no APP/Devoluções
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!VITE_DEVOLUTION_URL) {
    throw new Error("VITE_DEVOLUTION_API_BASE_URL não definida no .env");
  }

  const url = `${VITE_DEVOLUTION_URL}/${endpoint}`;
  
  // Token específico para operações do APP (enquanto não migra pro login Firebase real)
  const token = import.meta.env.VITE_DEV_ADMIN_FIREBASE_TOKEN;
  
  if (!token) {
    console.warn('Atenção: VITE_DEV_ADMIN_FIREBASE_TOKEN não definido.');
  }

  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Ocorreu um erro na requisição.");
  }

  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return {} as T;
  }

  return response.json();
}

/* -------------------------------------------------------------------------- */
/* DEVOLUÇÕES                                                                 */
/* -------------------------------------------------------------------------- */

export const getDevolutions = (): Promise<DevolutionResponseDTO[]> =>
  request('devolutions');

export const updateDevolutionStatus = (
  data: UpdateDevolutionStatusDTO,
): Promise<void> => {
  return request(
    `devolutions`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  );
};