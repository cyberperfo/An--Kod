/**
 * Bu dosya normalde şu komutla otomatik üretilir:
 *   supabase gen types typescript --project-id <PROJECT_ID> > types/database.types.ts
 *
 * Migration 001'i henüz CLI bağlamadan elle senkronize ettik. Supabase CLI kurulunca
 * bu dosyayı üstüne yazıp otomatik üretime geçmeni öneririm — elle senkron zamanla kayar.
 */

export type UserRole = "customer" | "producer" | "admin";
export type MemorialVisibility = "family_only" | "public";
export type MemorialStatus = "draft" | "active" | "archived";
export type MemoryType = "photo" | "video" | "text_memory";
export type MemoryVisibility = "inherit" | "family_only";
export type MemberRole = "family_admin" | "family_member";
export type MemberStatus = "invited" | "accepted" | "revoked";
export type PlaqueType = "standard" | "premium" | "custom";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";
export type OrderStatus =
  | "draft"
  | "payment_pending"
  | "paid"
  | "qr_generated"
  | "production_queued"
  | "in_production"
  | "produced"
  | "shipped"
  | "delivered";
export type QrIssueReason = "initial_order" | "replacement";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };

      memorials: {
        Row: {
          id: string;
          owner_id: string;
          full_name: string;
          birth_date: string | null;
          death_date: string;
          biography: string | null;
          cover_photo_url: string | null;
          visibility: MemorialVisibility;
          status: MemorialStatus;
          slug: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          full_name: string;
          birth_date?: string | null;
          death_date: string;
          biography?: string | null;
          cover_photo_url?: string | null;
          visibility?: MemorialVisibility;
          status?: MemorialStatus;
          slug?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["memorials"]["Insert"]>;
      };

      memories: {
        Row: {
          id: string;
          memorial_id: string;
          uploaded_by: string;
          type: MemoryType;
          content_url: string | null;
          caption: string | null;
          visibility_override: MemoryVisibility;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          memorial_id: string;
          uploaded_by: string;
          type: MemoryType;
          content_url?: string | null;
          caption?: string | null;
          visibility_override?: MemoryVisibility;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["memories"]["Insert"]>;
      };

      memorial_members: {
        Row: {
          id: string;
          memorial_id: string;
          user_id: string | null;
          invited_email: string;
          role: MemberRole;
          status: MemberStatus;
          invited_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          memorial_id: string;
          user_id?: string | null;
          invited_email: string;
          role?: MemberRole;
          status?: MemberStatus;
          invited_by: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["memorial_members"]["Insert"]>;
      };

      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string;
          memorial_id: string;
          plaque_type: PlaqueType;
          recipient_full_name: string;
          shipping_address: Record<string, unknown>;
          payment_status: PaymentStatus;
          status: OrderStatus;
          iyzico_payment_id: string | null;
          iyzico_conversation_id: string | null;
          iyzico_raw_response: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          customer_id: string;
          memorial_id: string;
          plaque_type: PlaqueType;
          recipient_full_name: string;
          shipping_address: Record<string, unknown>;
          payment_status?: PaymentStatus;
          status?: OrderStatus;
          iyzico_payment_id?: string | null;
          iyzico_conversation_id?: string | null;
          iyzico_raw_response?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };

      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          from_status: OrderStatus | null;
          to_status: OrderStatus;
          changed_by: string | null;
          changed_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          from_status?: OrderStatus | null;
          to_status: OrderStatus;
          changed_by?: string | null;
          changed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_status_history"]["Insert"]>;
      };

      qr_codes: {
        Row: {
          id: string;
          order_id: string | null;
          memorial_id: string;
          is_active: boolean;
          issue_reason: QrIssueReason;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          memorial_id: string;
          is_active?: boolean;
          issue_reason?: QrIssueReason;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["qr_codes"]["Insert"]>;
      };
    };

    Views: {
      public_memorial_view: {
        Row: {
          id: string;
          full_name: string;
          birth_date: string | null;
          death_date: string;
          biography: string | null;
          cover_photo_url: string | null;
          slug: string | null;
        };
      };
    };

    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_producer: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      get_producer_queue: {
        Args: Record<string, never>;
        Returns: {
          order_id: string;
          order_number: string;
          recipient_full_name: string;
          plaque_type: PlaqueType;
          shipping_address: Record<string, unknown>;
          status: OrderStatus;
          qr_code_id: string;
        }[];
      };
      advance_order_status: {
        Args: { p_order_id: string; p_new_status: OrderStatus };
        Returns: void;
      };
    };

    Enums: {
      user_role: UserRole;
      memorial_visibility: MemorialVisibility;
      memorial_status: MemorialStatus;
      memory_type: MemoryType;
      memory_visibility: MemoryVisibility;
      member_role: MemberRole;
      member_status: MemberStatus;
      plaque_type: PlaqueType;
      payment_status: PaymentStatus;
      order_status: OrderStatus;
      qr_issue_reason: QrIssueReason;
    };
  };
};
