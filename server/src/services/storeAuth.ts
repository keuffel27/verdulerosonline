import { supabase } from '../lib/supabase';

export class StoreAuthService {
  static async verifyStoreAccess(userId: string, storeId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('store_users')
        .select('role')
        .eq('user_id', userId)
        .eq('store_id', storeId)
        .single();

      if (error || !data) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verifying store access:', error);
      return false;
    }
  }

  static async getStoreRole(userId: string, storeId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('store_users')
        .select('role')
        .eq('user_id', userId)
        .eq('store_id', storeId)
        .single();

      if (error || !data) {
        return null;
      }

      return data.role;
    } catch (error) {
      console.error('Error getting store role:', error);
      return null;
    }
  }

  static async requireStoreRole(userId: string, storeId: string, requiredRole: string): Promise<boolean> {
    const role = await this.getStoreRole(userId, storeId);
    return role === requiredRole;
  }
}
