import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { supabase } from '../lib/supabase';

interface WhatsAppService {
  initializeClient(storeId: string): Promise<string>;
  disconnect(storeId: string): Promise<void>;
  getStatus(storeId: string): Promise<string>;
  getMessages(storeId: string): Promise<any[]>;
  sendMessage(storeId: string, to: string, message: string): Promise<void>;
}

class WhatsAppManager implements WhatsAppService {
  private clients: Map<string, Client> = new Map();

  async initializeClient(storeId: string): Promise<string> {
    try {
      const client = new Client({
        authStrategy: new LocalAuth({
          clientId: storeId
        })
      });
      
      return new Promise((resolve, reject) => {
        client.on('qr', (qr) => {
          this.clients.set(storeId, client);
          resolve(qr);
        });

        client.on('ready', async () => {
          await supabase
            .from('whatsapp_connections')
            .update({ status: 'connected' })
            .eq('store_id', storeId);
        });

        client.initialize().catch(reject);
      });
    } catch (error) {
      console.error('Error initializing WhatsApp client:', error);
      throw error;
    }
  }

  async disconnect(storeId: string): Promise<void> {
    const client = this.clients.get(storeId);
    if (client) {
      await client.destroy();
      this.clients.delete(storeId);
      await supabase
        .from('whatsapp_connections')
        .update({ status: 'disconnected' })
        .eq('store_id', storeId);
    }
  }

  async getStatus(storeId: string): Promise<string> {
    const client = this.clients.get(storeId);
    if (!client) {
      const { data } = await supabase
        .from('whatsapp_connections')
        .select('status')
        .eq('store_id', storeId)
        .single();
      return data?.status || 'disconnected';
    }
    return client.pupPage ? 'connected' : 'disconnected';
  }

  async getMessages(storeId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  }

  async sendMessage(storeId: string, to: string, message: string): Promise<void> {
    const client = this.clients.get(storeId);
    if (!client) {
      throw new Error('WhatsApp client not initialized');
    }

    // Asegurarse de que el número tenga el formato correcto
    const formattedNumber = to.includes('@c.us') ? to : `${to}@c.us`;

    await client.sendMessage(formattedNumber, message);

    // Guardar el mensaje en la base de datos
    await supabase.from('whatsapp_messages').insert({
      store_id: storeId,
      to: formattedNumber,
      message,
      type: 'outgoing',
      created_at: new Date().toISOString()
    });
  }
}

// Exportar una única instancia del servicio
const whatsappService = new WhatsAppManager();
export default whatsappService;
