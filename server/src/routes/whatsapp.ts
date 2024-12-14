import express, { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { StoreAuthService } from '../services/storeAuth';
import whatsappService from '../services/whatsapp';
import WhatsAppCacheService from '../services/whatsappCache';
import ChatbotTrainingService from '../services/chatbotTraining';

const router = express.Router();

// Middleware para verificar acceso a la tienda
async function verifyStoreAccess(req: Request, res: Response, next: NextFunction) {
  const { storeId } = req.params;

  if (!req.user || !await StoreAuthService.verifyStoreAccess(req.user.id, storeId)) {
    return res.status(403).json({ error: 'No access to this store' });
  }

  next();
}

// Rutas de WhatsApp
router.post('/:storeId/connect', requireAuth, verifyStoreAccess, async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    const qr = await whatsappService.initializeClient(storeId);
    res.json({ qr });
  } catch (error) {
    console.error('Error connecting to WhatsApp:', error);
    res.status(500).json({ error: 'Error connecting to WhatsApp' });
  }
});

router.post('/:storeId/disconnect', requireAuth, verifyStoreAccess, async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    await whatsappService.disconnect(storeId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting from WhatsApp:', error);
    res.status(500).json({ error: 'Error disconnecting from WhatsApp' });
  }
});

router.get('/:storeId/status', requireAuth, verifyStoreAccess, async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    const status = await whatsappService.getStatus(storeId);
    res.json({ status });
  } catch (error) {
    console.error('Error getting WhatsApp status:', error);
    res.status(500).json({ error: 'Error getting WhatsApp status' });
  }
});

router.get('/:storeId/messages', requireAuth, verifyStoreAccess, async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    const messages = await whatsappService.getMessages(storeId);
    res.json({ messages });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Error getting messages' });
  }
});

router.post('/:storeId/send', requireAuth, verifyStoreAccess, async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    const { to, message } = req.body;
    await whatsappService.sendMessage(storeId, to, message);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Error sending message' });
  }
});

router.post('/:storeId/training', requireAuth, verifyStoreAccess, async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    const { examples } = req.body;
    await ChatbotTrainingService.addTrainingExample(storeId, examples);
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding training examples:', error);
    res.status(500).json({ error: 'Error adding training examples' });
  }
});

router.get('/:storeId/cache', requireAuth, verifyStoreAccess, async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    const cache = await WhatsAppCacheService.getAllCachedResponses(storeId);
    res.json({ cache });
  } catch (error) {
    console.error('Error getting cache:', error);
    res.status(500).json({ error: 'Error getting cache' });
  }
});

export default router;
