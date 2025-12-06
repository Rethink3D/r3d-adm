import { auth } from "../../../services/firebase";
import type {
  Category,
  Image,
  Maker,
  MakerPayload,
  Product,
  ProductPayload,
  ProductStatusEnum,
} from "../types/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL não definida no .env");
  }

  const url = `${API_BASE_URL}/${endpoint}`;
  
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
/* MAKERS                                                                     */
/* -------------------------------------------------------------------------- */

export const getMakersForAdmin = async (): Promise<Maker[]> => {
    const makers = await request<Maker[]>("maker/admin/list"); 
    return makers; 
};

export const getMakerByIdForAdmin = async (id: string): Promise<Maker> => {
    const maker = await request<Maker>(`maker/admin/${id}`);
    return {
        ...maker,
        location: "São Luís",
    };
};

export const getMakerById = async (id: string): Promise<Maker> => {
  const maker = await request<Maker>(`maker/${id}`);
  return {
    ...maker,
    location: "São Luís",
  };
};

export const createMaker = (data: MakerPayload): Promise<Maker> =>
  request("maker", { method: "POST", body: JSON.stringify(data) });

export const updateMaker = (
  id: string,
  data: Partial<MakerPayload>
): Promise<Maker> =>
  request(`maker/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteMaker = (id: string): Promise<void> =>
  request(`maker/${id}`, { method: "DELETE" });

export const mergeMakers = (sourceId: string, targetId: string): Promise<void> => {
    return request("maker/merge", {
        method: "POST",
        body: JSON.stringify({ sourceId, targetId }),
    });
};

/* -------------------------------------------------------------------------- */
/* PRODUTOS                                                                   */
/* -------------------------------------------------------------------------- */

export const getProducts = (): Promise<Product[]> => request("product");

export const getProductById = (id: string): Promise<Product> =>
  request(`product/${id}`);

export const createProduct = (data: ProductPayload): Promise<Product> =>
  request("product", { method: "POST", body: JSON.stringify(data) });

export const updateProduct = (
  id: string,
  data: Partial<ProductPayload>
): Promise<Product> =>
  request(`product/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteProduct = (id: string): Promise<void> =>
  request(`product/${id}`, { method: "DELETE" });

export const updateProductStatus = (
  id: string,
  status: ProductStatusEnum
): Promise<Product> => {
  return request(`product/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

/* -------------------------------------------------------------------------- */
/* CATEGORIAS                                                                 */
/* -------------------------------------------------------------------------- */

export const getCategories = (): Promise<Category[]> => request("category");

export const createCategory = (data: {
  name: string;
  description?: string;
}): Promise<Category> =>
  request("category", { method: "POST", body: JSON.stringify(data) });

/* -------------------------------------------------------------------------- */
/* IMAGENS                                                                    */
/* -------------------------------------------------------------------------- */

export const uploadProductImage = (
  productId: string,
  file: File
): Promise<Image> => {
  const formData = new FormData();
  formData.append("file", file);
  return request(`image/product/${productId}`, {
    method: "POST",
    body: formData,
  });
};

export const uploadMakerProfileImage = (
  makerId: string,
  file: File
): Promise<Image> => {
  const formData = new FormData();
  formData.append("file", file);
  return request(`image/maker/${makerId}/profile`, {
    method: "POST",
    body: formData,
  });
};

export const deleteImage = (imageId: string): Promise<void> => {
  return request(`image/${imageId}`, { method: "DELETE" });
};