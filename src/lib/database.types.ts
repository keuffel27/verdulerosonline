export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          slug: string
          owner_id: string
          owner_name: string
          owner_email: string
          trial_start_date: string
          subscription_status: 'trial' | 'active' | 'expired' | 'cancelled'
          status: 'active' | 'inactive'
          description?: string | null
          logo_url?: string | null
          whatsapp?: string | null
          instagram?: string | null
          facebook?: string | null
          schedule?: Json | null
          theme?: {
            primary_color: string
            secondary_color: string
          } | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug: string
          owner_id: string
          owner_name: string
          owner_email: string
          trial_start_date?: string
          subscription_status?: 'trial' | 'active' | 'expired' | 'cancelled'
          status?: 'active' | 'inactive'
          description?: string | null
          logo_url?: string | null
          whatsapp?: string | null
          instagram?: string | null
          facebook?: string | null
          schedule?: Json | null
          theme?: {
            primary_color: string
            secondary_color: string
          } | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          slug?: string
          owner_id?: string
          owner_name?: string
          owner_email?: string
          trial_start_date?: string
          subscription_status?: 'trial' | 'active' | 'expired' | 'cancelled'
          status?: 'active' | 'inactive'
          description?: string | null
          logo_url?: string | null
          whatsapp?: string | null
          instagram?: string | null
          facebook?: string | null
          schedule?: Json | null
          theme?: {
            primary_color: string
            secondary_color: string
          } | null
        }
      }
      // ... rest of the types remain the same
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}