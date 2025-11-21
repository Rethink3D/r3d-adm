export enum ContactTypeEnum {
  EMAIL = "EMAIL",
  PHONE = "PHONE",
  WEBSITE = "WEBSITE",
  INSTAGRAM = "INSTAGRAM",
  FACEBOOK = "FACEBOOK",
  X_TWITTER = "X_TWITTER",
  WHATSAPP = "WHATSAPP",
  MERCADO_LIVRE = "MERCADO_LIVRE",
  OLX = "OLX",
  SHOPEE = "SHOPEE",
}

export enum MakerStatusEnum {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DEACTIVATED = "DEACTIVATED",
}

export interface Contact {
  id: string;
  type: ContactTypeEnum;
  contactInfo: string;
}

export interface Image {
  id: string;
  filename: string;
  format: string;
  url: string;
  altText: string | null;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Maker {
  id: string;
  name: string;
  description: string;
  acceptsPersonalization: boolean;
  status: MakerStatusEnum;
  contacts: Contact[];
  profileImage: Image;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
  location: string;
  rating?: number;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  material: string;
  price: string;
  isPersonalizable: boolean;
  maker: Maker;
  images: Image[];
  categories: Category[];
  createdAt: string;
  deletedAt: string | null;
  popularity?: number;
}

export interface MakerPayload {
  name: string;
  description: string;
  acceptsPersonalization: boolean;
  status: MakerStatusEnum;
  contacts: {
    type: string;
    contactInfo: string;
  }[];
  categoryIds?: string[];
}

export interface ProductPayload {
  name: string;
  description: string;
  material: string;
  price: string;
  isPersonalizable: boolean;
  makerId: string;
  categoryIds?: string[];
}

