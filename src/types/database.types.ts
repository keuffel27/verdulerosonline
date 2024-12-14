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
          user_id: string
          name: string
          description: string | null
          address: string | null
          phone: string | null
          email: string | null
          created_at: string
          updated_at: string
          welcome_message: string | null
          auto_reply: boolean
          business_hours: boolean
          is_connected: boolean
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
          welcome_message?: string | null
          auto_reply?: boolean
          business_hours?: boolean
          is_connected?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
          welcome_message?: string | null
          auto_reply?: boolean
          business_hours?: boolean
          is_connected?: boolean
        }
      }
      products: {
        Row: {
          id: string
          store_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          store_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      whatsapp_connections: {
        Row: {
          id: string
          store_id: string
          status: string
          qr_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          status: string
          qr_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          status?: string
          qr_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      store_schedule: {
        Row: {
          id: string
          store_id: string
          day: number
          open_time: string
          close_time: string
          is_open: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          day: number
          open_time: string
          close_time: string
          is_open: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          day?: number
          open_time?: string
          close_time?: string
          is_open?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
