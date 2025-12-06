import type { DevolutionResponseDTO } from "../types/types";
import { OrderStatusEnum } from "../../../types/types";
import { auth } from "../../../services/firebase";

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

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!VITE_DEVOLUTION_URL) {
    throw new Error("VITE_DEVOLUTION_API_BASE_URL não definida no .env");
  }

  const url = `${VITE_DEVOLUTION_URL}/${endpoint}`;
  
  let token = null;
  if (auth.currentUser) {
      token = await auth.currentUser.getIdToken();
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