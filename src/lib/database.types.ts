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
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          }
        ]
      }
      measurement_units: {
        Row: {
          id: string
          name: string
          symbol: string
          system: 'metric' | 'imperial'
          base_unit: boolean
          conversion_factor: number | null
          base_unit_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          symbol: string
          system: 'metric' | 'imperial'
          base_unit?: boolean
          conversion_factor?: number | null
          base_unit_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          symbol?: string
          system?: 'metric' | 'imperial'
          base_unit?: boolean
          conversion_factor?: number | null
          base_unit_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "measurement_units_base_unit_id_fkey"
            columns: ["base_unit_id"]
            referencedRelation: "measurement_units"
            referencedColumns: ["id"]
          }
        ]
      }
      product_presentations: {
        Row: {
          id: string
          product_id: string
          unit_id: string
          quantity: number
          price: number
          sale_price: number | null
          stock: number
          status: 'active' | 'inactive'
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          unit_id: string
          quantity: number
          price: number
          sale_price?: number | null
          stock?: number
          status?: 'active' | 'inactive'
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          unit_id?: string
          quantity?: number
          price?: number
          sale_price?: number | null
          stock?: number
          status?: 'active' | 'inactive'
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_presentations_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "store_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_presentations_unit_id_fkey"
            columns: ["unit_id"]
            referencedRelation: "measurement_units"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          unit_type: 'kg' | 'lb' | 'unit'
          store_id: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          unit_type: 'kg' | 'lb' | 'unit'
          store_id: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          unit_type?: 'kg' | 'lb' | 'unit'
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          }
        ]
      }
      store_appearance: {
        Row: {
          created_at: string
          id: string
          primary_color: string
          secondary_color: string
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          primary_color: string
          secondary_color: string
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          primary_color?: string
          secondary_color?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_appearance_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          }
        ]
      }
      store_products: {
        Row: {
          id: string
          store_id: string
          category_id: string | null
          name: string
          description: string | null
          image_url: string | null
          status: 'active' | 'inactive'
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          category_id?: string | null
          name: string
          description?: string | null
          image_url?: string | null
          status?: 'active' | 'inactive'
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          image_url?: string | null
          status?: 'active' | 'inactive'
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_products_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "store_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_products_store_id_fkey"
            columns: ["store_id"]
            referencedRelation: "stores"
            referencedColumns: ["id"]
          }
        ]
      }
      store_settings: {
        Row: {
          created_at: string
          id: string
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          }
        ]
      }
      store_social_media: {
        Row: {
          created_at: string
          facebook_url: string | null
          id: string
          instagram_url: string | null
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_social_media_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          }
        ]
      }
      stores: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}