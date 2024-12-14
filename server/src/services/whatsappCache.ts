import { createHash } from 'crypto';
import { supabase } from '../lib/supabase';

interface CacheEntry {
  query_text: string;
  response_text: string;
  usage_count: number;
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: Record<string, string>;
}

class WhatsAppCacheService {
  async getCachedResponse(message: string, storeId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_cache')
        .select('response')
        .eq('store_id', storeId)
        .eq('message', message.toLowerCase())
        .single();

      if (error || !data) return null;
      return data.response;
    } catch (error) {
      console.error('Error getting cached response:', error);
      return null;
    }
  }

  async cacheResponse(message: string, response: string, storeId: string): Promise<void> {
    try {
      await supabase.from('whatsapp_cache').insert({
        store_id: storeId,
        message: message.toLowerCase(),
        response,
        usage_count: 1
      });
    } catch (error) {
      console.error('Error caching response:', error);
    }
  }

  async getAllCachedResponses(storeId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_cache')
        .select('*')
        .eq('store_id', storeId)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting all cached responses:', error);
      return [];
    }
  }

  async updateUsageCount(id: string): Promise<void> {
    try {
      await supabase.rpc('increment_cache_usage', { cache_id: id });
    } catch (error) {
      console.error('Error updating usage count:', error);
    }
  }

  async deleteCachedResponse(id: string): Promise<void> {
    try {
      await supabase.from('whatsapp_cache').delete().eq('id', id);
    } catch (error) {
      console.error('Error deleting cached response:', error);
    }
  }

  async getMessageTemplate(
    name: string,
    storeId: string,
    variables?: Record<string, string>
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_message_templates')
        .select('content, variables')
        .eq('store_id', storeId)
        .eq('name', name)
        .single();

      if (error || !data) return null;

      let content = data.content;

      // Reemplazar variables en la plantilla
      if (variables && data.variables) {
        Object.entries(variables).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          content = content.replace(new RegExp(placeholder, 'g'), value);
        });
      }

      return content;
    } catch (error) {
      console.error('Error getting message template:', error);
      return null;
    }
  }

  async createMessageTemplate(
    template: Omit<MessageTemplate, 'id'>,
    storeId: string
  ): Promise<void> {
    try {
      await supabase.from('whatsapp_message_templates').insert({
        ...template,
        store_id: storeId,
      });
    } catch (error) {
      console.error('Error creating message template:', error);
    }
  }

  async updateMessageTemplate(
    templateId: string,
    updates: Partial<MessageTemplate>
  ): Promise<void> {
    try {
      await supabase
        .from('whatsapp_message_templates')
        .update(updates)
        .eq('id', templateId);
    } catch (error) {
      console.error('Error updating message template:', error);
    }
  }

  async deleteMessageTemplate(templateId: string): Promise<void> {
    try {
      await supabase.from('whatsapp_message_templates').delete().eq('id', templateId);
    } catch (error) {
      console.error('Error deleting message template:', error);
    }
  }

  private generateHash(text: string): string {
    return createHash('sha256').update(text.toLowerCase().trim()).digest('hex');
  }

  async cleanupOldCache(storeId: string, maxAge: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAge);

    try {
      await supabase
        .from('whatsapp_response_cache')
        .delete()
        .eq('store_id', storeId)
        .lt('last_used', cutoffDate.toISOString());
    } catch (error) {
      console.error('Error cleaning up old cache:', error);
    }
  }
}

export default new WhatsAppCacheService();
