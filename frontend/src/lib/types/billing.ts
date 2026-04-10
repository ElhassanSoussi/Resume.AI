export type PaymentRead = {
  id: string;
  user_id: string;
  resume_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  amount: number;
  currency: string;
  status: string;
  product_type: string;
  created_at: string;
};

export type ResumePaymentStatus = {
  resume_id: string;
  paid: boolean;
  export_ready: boolean;
  status: string;
  payment_id: string | null;
  product_type: string | null;
};

export type CreateCheckoutSessionRequest = {
  resume_id: string;
  success_url: string;
  cancel_url: string;
  product_type?: string;
  price_id?: string | null;
  customer_email?: string | null;
};

export type CreateCheckoutSessionResponse = {
  checkout_url: string;
  session_id: string;
  payment_id: string;
};

export type PdfExportMetadata = {
  id: string;
  resume_id: string;
  user_id: string;
  format: string;
  template_key: string;
  status: string;
  storage_key: string | null;
  file_size_bytes: number | null;
  mime_type: string;
  public_download_url: string | null;
  suggested_filename: string;
  created_at: string;
  updated_at: string;
};

export type ExportHistoryItem = {
  id: string;
  resume_id: string;
  resume_title: string;
  format: string;
  template_key: string;
  status: string;
  file_size_bytes: number | null;
  mime_type: string;
  suggested_filename: string;
  public_download_url: string | null;
  created_at: string;
};
