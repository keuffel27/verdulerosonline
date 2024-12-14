export interface Product {
  id: string;
  name: string;
  description?: string;
  base_price_per_unit: number;
  unit_type: string;
  quantity_step: number;
  min_quantity: number;
  max_quantity: number;
  category_id: string;
  store_id: string;
  totalPrice?: number;
  image_url?: string;
  stock?: number;
  is_available?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  presentationId?: string;
}
