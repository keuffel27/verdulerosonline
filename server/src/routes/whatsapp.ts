import express, { Request, Response } from 'express';
import whatsappService from '../services/whatsappService';

const router = express.Router();

// Generar URL de WhatsApp para el pedido
router.post('/:storeId/generate-order-url', async (req: Request, res: Response) => {
  try {
    const { 
      customerName,
      paymentMethod,
      needsDelivery,
      deliveryAddress,
      cartItems,
      storeWhatsApp
    } = req.body;

    // Validar datos requeridos
    if (!customerName || !paymentMethod || !cartItems || !storeWhatsApp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generar mensaje para WhatsApp
    const message = `🛒 *Nuevo Pedido*\n\n` +
      `*Cliente:* ${customerName}\n` +
      `*Método de Pago:* ${paymentMethod === 'efectivo' ? 'Efectivo' : 'Transferencia'}\n` +
      (needsDelivery ? `*Dirección de Envío:* ${deliveryAddress}\n` : '*Retiro en Tienda*\n') +
      `\n*Productos:*\n${cartItems.map((item: any) => 
        `- ${item.quantity}x ${item.name} - $${item.price * item.quantity}`
      ).join('\n')}\n\n` +
      `*Total:* $${cartItems.reduce((total: number, item: any) => 
        total + (item.price * item.quantity), 0)}`;

    // Generar URL de WhatsApp
    const whatsappUrl = whatsappService.generateWhatsAppUrl(storeWhatsApp, message);
    
    res.json({ success: true, whatsappUrl });
  } catch (error: any) {
    console.error('Error generating WhatsApp URL:', error);
    res.status(500).json({ error: error.message || 'Error generating WhatsApp URL' });
  }
});

export default router;
