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
  PENDING = "PENDING",
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
  cpf?: string;
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
  products?: Product[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  material: MaterialTypeEnum;
  price: string;
  discountPercentage?: number;
  isPersonalizable: boolean;
  maker: Maker;
  images: Image[];
  categories: Category[];
  createdAt: string;
  deletedAt: string | null;
  popularity?: number;
  status: ProductStatusEnum;
  type: ProductTypeEnum;
}

export enum ProductStatusEnum {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
}

export enum ProductTypeEnum {
  STANDARD = "STANDARD",
  PROMOTIONAL = "PROMOTIONAL",
}

export enum MaterialTypeEnum {
  PLA = "PLA",
  ABS = "ABS",
  PETG = "PETG",
  TPU = "TPU",
  Nylon = "Nylon",
  ASA = "ASA",
  PC = "Policarbonato",
  Resin = "Resina",
  Outro = "Outro",
}

export interface MakerPayload {
  name: string;
  cpf: string;
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
  discountPercentage?: number;
  isPersonalizable: boolean;
  makerId?: string;
  categoryIds?: string[];
  type?: ProductTypeEnum;
}

