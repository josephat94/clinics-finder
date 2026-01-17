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
          fax: string | null;
          email: string | null;
          address: string | null;
          state: string | null;
          zipcode: string | null;
          notes: string | null;
          website: string | null;
          lat: number | null;
          lng: number | null;
          enabled: boolean;
          created_at: string; // timestamptz
          updated_at: string; // timestamptz
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          fax?: string | null;
          email?: string | null;
          address?: string | null;
          state?: string | null;
          zipcode?: string | null;
          notes?: string | null;
          website?: string | null;
          enabled?: boolean;
          lat?: number | null;
          lng?: number | null;
          created_at?: string; // timestamptz
          updated_at?: string; // timestamptz
        };
        Update: Partial<{
          id: string;
          name: string;
          phone: string | null;
          fax: string | null;
          email: string | null;
          address: string | null;
          state: string | null;
          zipcode: string | null;
          notes: string | null;
          website: string | null;
          enabled: boolean;
          lat: number | null;
          lng: number | null;
          created_at: string; // timestamptz
          updated_at: string; // timestamptz
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
