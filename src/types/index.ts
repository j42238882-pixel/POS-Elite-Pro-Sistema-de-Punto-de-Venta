/**
 * POS Elite Pro - Definiciones de Tipos TypeScript
 * Modelos de datos compartidos entre Cliente, Servidor API y Netlify Functions
 */

export interface Product {
  id: number;
  name: string;
  price: number; // Precio en USD
  stock: number;
  category?: string;
  barcode?: string;
}

export interface Customer {
  id: string; // Cédula o RIF (ej: V-18.452.120 o 0 para Consumidor Final)
  name: string;
  phone?: string;
  email?: string;
}

export interface SaleItem {
  id: number;
  name: string;
  price: number; // Precio unitario en USD
  qty: number;
  subtotal: number;
}

export type PaymentMethod = 'efectivo' | 'pagomovil' | 'biopago' | 'tarjeta' | 'credito';

export interface Sale {
  id: number; // Número de ticket / factura
  date: string; // ISO o formato fecha
  time?: string;
  customer: Customer;
  items: SaleItem[];
  totalUSD: number;
  totalVES: number;
  rate: number;
  method: PaymentMethod;
  notes?: string;
  isCredit?: boolean;
  creditPaid?: boolean;
  creditAbonos?: Array<{ date: string; amountUSD: number; note: string }>;
}

export interface StoreConfig {
  storeName: string;
  exchangeRate: number; // Tasa oficial USD -> VES
  ticketWidth: '58mm' | '80mm';
  ticketFontSize: string;
  adminPinHash?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp: string;
  meta?: {
    total?: number;
    version?: string;
    environment?: string;
  };
}

export interface TeamMember {
  name: string;
  role: string;
  gitBranch: string;
  responsibilities: string[];
}
