import { supabase } from '../lib/supabase';
import WhatsAppService from './whatsapp';

interface NotificationChannel {
  type: 'whatsapp' | 'email';
  enabled: boolean;
}

interface NotificationSchedule {
  days: string[];
  startTime: string;
  endTime: string;
}

interface NotificationSettings {
  notification_type: string;
  enabled: boolean;
  channels: NotificationChannel[];
  schedule?: NotificationSchedule;
}

class NotificationService {
  static async getNotificationSettings(
    storeId: string,
    notificationType: string
  ): Promise<NotificationSettings | null> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_notification_settings')
        .select('*')
        .eq('store_id', storeId)
        .eq('notification_type', notificationType)
        .single();

      if (error || !data) return null;

      return data as NotificationSettings;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return null;
    }
  }

  static async updateNotificationSettings(
    storeId: string,
    notificationType: string,
    settings: Partial<NotificationSettings>
  ): Promise<void> {
    try {
      await supabase
        .from('whatsapp_notification_settings')
        .upsert({
          store_id: storeId,
          notification_type: notificationType,
          ...settings,
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  }

  static async sendNotification(
    storeId: string,
    notificationType: string,
    message: string,
    metadata?: any
  ): Promise<void> {
    try {
      const settings = await this.getNotificationSettings(storeId, notificationType);
      if (!settings || !settings.enabled) return;

      const { data: store } = await supabase
        .from('stores')
        .select('owner_email, owner_phone')
        .eq('id', storeId)
        .single();

      if (!store) return;

      // Verificar horario si existe programación
      if (settings.schedule) {
        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false });

        if (
          !settings.schedule.days.includes(currentDay) ||
          currentTime < settings.schedule.startTime ||
          currentTime > settings.schedule.endTime
        ) {
          return;
        }
      }

      // Enviar notificaciones por los canales habilitados
      for (const channel of settings.channels) {
        if (!channel.enabled) continue;

        switch (channel.type) {
          case 'whatsapp':
            if (store.owner_phone) {
              await WhatsAppService.sendMessage(storeId, store.owner_phone, message);
            }
            break;

          case 'email':
            // Implementar envío de email
            break;
        }
      }

      // Registrar la notificación
      await supabase.from('whatsapp_notifications').insert({
        store_id: storeId,
        notification_type: notificationType,
        message,
        metadata,
        channels: settings.channels.filter(c => c.enabled).map(c => c.type),
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  static async shouldNotify(
    storeId: string,
    notificationType: string
  ): Promise<boolean> {
    try {
      const settings = await this.getNotificationSettings(storeId, notificationType);
      if (!settings || !settings.enabled) return false;

      // Verificar horario si existe programación
      if (settings.schedule) {
        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false });

        if (
          !settings.schedule.days.includes(currentDay) ||
          currentTime < settings.schedule.startTime ||
          currentTime > settings.schedule.endTime
        ) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking notification status:', error);
      return false;
    }
  }
}

export default NotificationService;
