import { OrderStatusEnum } from "../../../types/types";

export type DevolutionImage = string;

export interface DevolutionMaker { 
  phone: string;
  email: string;
  name: string;
  imageUrl: string;
}

export interface DevolutionProduct {
  id: string;
  name: string;
  price: string;
  maker: DevolutionMaker;
}

export interface DevolutionProductItem {
  id: string;
  quantity: number;
  approvedQuantity: number | null;
  price: string;
  product: DevolutionProduct;
}

export interface DevolutionResponseDTO {
  id: string;
  orderId: string;
  reason: string;
  contact: string;
  creationTime: Date;
  products: DevolutionProductItem[];
  images: DevolutionImage[];
  orderStatus: OrderStatusEnum | null;
}