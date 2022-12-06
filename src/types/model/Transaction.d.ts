import { AddressModel, CartModel } from ".";

export type TransactionModel = {
  id?: string;
  invoice?: string;
  invoice_url?: string;
  paymentcode?: string;
  status?: TransactionStatus;
  payment_status?: TransactionPaymentStatus;
  order_at?: string;
  cart_items?: CartModel[];
  address?: AddressModel;
  payment_method?: PaymentMethodType;
  price_total?: number;
  price_courier?: number;
  grand_total?: number;
  payment_picture?: any;
  logs?: TransactionLog[];
  totalbelanja?: number;
  orderno?: string;
  orderstatus?: TransactionStatus;
  ordertgl?: string;
  methodid?: string;
  methodds?: string;
  currds?: string;
  password?: string;
  nm_store?: string;
};

type TransactionStatus = 'nklunas' | 'nplunas' | 'npfullpay' | 'npprogress' | 'open' | 'confirm' | 'do' | 'sudahbayar' | 'belumbayar' | 'expire';

type TransactionPaymentStatus = 'pending' | 'unpaid' | 'paid' | 'reject';

export type PaymentMethodType = {
  id?: number, 
  label?: string;
  image?: string;
  nama?: string;
  remark?: string;
  type?: string;
  payment_name?: string;
  payment_type?: string;
  howtobuy?: any;
};

export type MidtransModelVA = {
  transaction_id?: string, 
  order_id?: string;
  merchant_id?: string;
  gross_amount?: string;
  currency?: string;
  payment_type?: string;
  transaction_time?: string;
  transaction_status?: string;
  va_number?: any;
  bank?: string;
};

export type TransactionLog = {
  date?: string;
  description?: string;
};

export type InvoiceType = {
  url: string;
};

export { TransactionStatus, TransactionPaymentStatus };
