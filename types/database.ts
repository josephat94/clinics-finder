export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      clinics: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          secondary_phone: string | null;
          fax: string | null;
          email: string | null;
          address: string | null;
          state: string | null;
          zipcode: string | null;
          notes: string | null;
          website: string | null;
          weekly_schedule: Json;
          lat: number | null;
          lng: number | null;
          enabled: boolean;
          banned: boolean;
          bilingual: boolean;
          created_at: string; // timestamptz
          updated_at: string; // timestamptz
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          secondary_phone?: string | null;
          fax?: string | null;
          email?: string | null;
          address?: string | null;
          state?: string | null;
          zipcode?: string | null;
          notes?: string | null;
          website?: string | null;
          weekly_schedule?: Json;
          enabled?: boolean;
          banned?: boolean;
          bilingual?: boolean;
          lat?: number | null;
          lng?: number | null;
          created_at?: string; // timestamptz
          updated_at?: string; // timestamptz
        };
        Update: Partial<{
          id: string;
          name: string;
          phone: string | null;
          secondary_phone: string | null;
          fax: string | null;
          email: string | null;
          address: string | null;
          state: string | null;
          zipcode: string | null;
          notes: string | null;
          website: string | null;
          weekly_schedule: Json;
          enabled: boolean;
          banned: boolean;
          bilingual: boolean;
          lat: number | null;
          lng: number | null;
          created_at: string; // timestamptz
          updated_at: string; // timestamptz
        }>;
      };
      clinic_audit_logs: {
        Row: {
          id: string;
          clinic_id: string | null;
          clinic_name: string | null;
          action: 'create' | 'update' | 'delete';
          actor_id: string | null;
          actor_email: string | null;
          old_data: Json | null;
          new_data: Json | null;
          changed_fields: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          clinic_id?: string | null;
          clinic_name?: string | null;
          action: 'create' | 'update' | 'delete';
          actor_id?: string | null;
          actor_email?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          changed_fields?: string[] | null;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          clinic_id: string | null;
          clinic_name: string | null;
          action: 'create' | 'update' | 'delete';
          actor_id: string | null;
          actor_email: string | null;
          old_data: Json | null;
          new_data: Json | null;
          changed_fields: string[] | null;
          created_at: string;
        }>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
