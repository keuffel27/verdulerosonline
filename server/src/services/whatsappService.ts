import { supabaseAdmin as supabase } from '../config/supabase';
import { formatPhoneNumber, validatePhoneNumber } from '../utils/phoneUtils';

interface WhatsAppConnection {
  id: string;
  store_id: string;
  phone_number: string;
  is_verified: boolean;
}

class WhatsAppService {
  generateWhatsAppUrl(phoneNumber: string, message: string): string {
    // Limpiar el número de teléfono (solo dígitos)
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Codificar el mensaje para la URL
    const encodedMessage = encodeURIComponent(message);
    
    // Generar la URL de WhatsApp
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
  }

  async savePhoneNumber(storeId: string, phoneNumber: string): Promise<WhatsAppConnection> {
    // Validar y formatear el número de teléfono
    if (!validatePhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }
    
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    // Guardar o actualizar el número en la base de datos
    const { data, error } = await supabase
      .from('whatsapp_connections')
      .upsert(
        {
          store_id: storeId,
          phone_number: formattedNumber,
          is_verified: true, // Por ahora asumimos que es verificado
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'store_id'
        }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Error saving WhatsApp number: ${error.message}`);
    }

    return data;
  }

  async getStoreWhatsApp(storeId: string): Promise<WhatsAppConnection | null> {
    const { data, error } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('store_id', storeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró ninguna conexión
        return null;
      }
      throw new Error(`Error getting WhatsApp connection: ${error.message}`);
    }

    return data;
  }

  async sendOrderMessage(storeId: string, orderDetails: any): Promise<void> {
    const connection = await this.getStoreWhatsApp(storeId);
    if (!connection) {
      throw new Error('No WhatsApp connection found for this store');
    }

    // Construir el mensaje del pedido
    const message = this.formatOrderMessage(orderDetails);

    // Aquí iría la lógica para enviar el mensaje a través de la API de WhatsApp
    // Por ahora, solo simulamos el envío
    console.log(`Sending WhatsApp message to ${connection.phone_number}:`, message);
    
    // TODO: Implementar la integración real con la API de WhatsApp Business
    // Esto podría ser usando la API oficial de WhatsApp Business o un servicio de terceros
  }

  private formatOrderMessage(orderDetails: any): string {
    const items = orderDetails.items.map((item: any) => 
      `- ${item.quantity} ${item.unit} de ${item.name}: $${item.price}`
    ).join('\n');

    return `🛍️ *Nuevo Pedido*\n\n` +
           `*Pedido #${orderDetails.orderId}*\n\n` +
           `*Items:*\n${items}\n\n` +
           `*Total:* $${orderDetails.total}\n\n` +
           `*Cliente:* ${orderDetails.customerName}\n` +
           `*Dirección:* ${orderDetails.address}\n\n` +
           `*Notas:* ${orderDetails.notes || 'Sin notas adicionales'}`;
  }
}

export default new WhatsAppService();
