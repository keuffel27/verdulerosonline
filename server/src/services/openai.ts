import OpenAI from 'openai';
import { supabase } from '../lib/supabase';
import WhatsAppCacheService from './whatsappCache';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface StoreContext {
  name: string;
  products: any[];
  schedule: any[];
  welcomeMessage: string;
  trainingData?: any[];
}

class OpenAIService {
  private static async getStoreContext(storeId: string): Promise<StoreContext> {
    const { data: store } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    const { data: products } = await supabase
      .from('store_products')
      .select('name, price, description, category_id')
      .eq('store_id', storeId);

    const { data: schedule } = await supabase
      .from('store_schedule')
      .select('*')
      .eq('store_id', storeId);

    const { data: whatsappConfig } = await supabase
      .from('whatsapp_connections')
      .select('welcome_message')
      .eq('store_id', storeId)
      .single();

    const { data: trainingData } = await supabase
      .from('whatsapp_bot_training')
      .select('*')
      .eq('store_id', storeId);

    return {
      name: store?.name || '',
      products: products || [],
      schedule: schedule || [],
      welcomeMessage: whatsappConfig?.welcome_message || '',
      trainingData: trainingData || [],
    };
  }

  static async generateResponse(message: string, storeId: string): Promise<string> {
    try {
      // Primero intentar obtener una respuesta del caché
      const cachedResponse = await WhatsAppCacheService.getCachedResponse(message, storeId);
      if (cachedResponse) {
        return cachedResponse;
      }

      const context = await this.getStoreContext(storeId);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Eres un asistente virtual amable y profesional para la verdulería "${context.name}". 
            Tienes acceso a la siguiente información:
            - Productos y precios actuales
            - Horarios de atención
            - Políticas de la tienda
            - Ejemplos de entrenamiento previos
            
            Objetivos:
            1. Ayudar a los clientes a realizar pedidos
            2. Responder consultas sobre productos y precios
            3. Informar sobre horarios y disponibilidad
            4. Mantener un tono amable y profesional
            
            Productos disponibles:
            ${context.products.map(p => `- ${p.name}: $${p.price}`).join('\n')}
            
            Horarios:
            ${context.schedule.map(s => `${s.day}: ${s.open_time} - ${s.close_time}`).join('\n')}
            
            Ejemplos de entrenamiento:
            ${context.trainingData?.map(t => `Intent: ${t.intent}\nEjemplos: ${t.examples.join(', ')}`).join('\n')}`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const response = completion.choices[0].message.content || 
        "Lo siento, no pude procesar tu mensaje.";

      // Guardar la respuesta en caché
      await WhatsAppCacheService.cacheResponse(message, response, storeId);

      return response;
    } catch (error) {
      console.error('Error generating OpenAI response:', error);
      return "Lo siento, estoy experimentando problemas técnicos. Por favor, intenta más tarde.";
    }
  }

  static async classifyIntent(message: string, examples: any[]): Promise<string | null> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Clasifica el siguiente mensaje en una de estas intenciones:
            ${examples.map(e => `- ${e.intent}`).join('\n')}
            
            Responde solo con el nombre de la intención.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0,
      });

      return completion.choices[0].message.content || null;
    } catch (error) {
      console.error('Error classifying intent:', error);
      return null;
    }
  }

  static async updateTraining(trainingData: any[]): Promise<void> {
    // Esta función es un placeholder para futuras implementaciones
    // de fine-tuning con OpenAI
    console.log('Training data updated:', trainingData.length, 'examples');
  }

  static async analyzeSentiment(messages: string[]): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
  }> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Analiza el sentimiento de los siguientes mensajes y responde con un JSON que contenga 'sentiment' (positive/negative/neutral) y 'score' (0-1).",
          },
          {
            role: "user",
            content: messages.join('\n'),
          },
        ],
        temperature: 0,
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '{"sentiment": "neutral", "score": 0.5}');
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return { sentiment: 'neutral', score: 0.5 };
    }
  }

  static async generateProductRecommendations(
    customerHistory: string[],
    storeId: string
  ): Promise<string[]> {
    try {
      const context = await this.getStoreContext(storeId);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Basado en el historial de compras del cliente y los productos disponibles, 
            sugiere 3 productos que podrían interesarle. Responde en formato JSON array de strings.
            
            Productos disponibles:
            ${JSON.stringify(context.products)}`,
          },
          {
            role: "user",
            content: `Historial de cliente: ${customerHistory.join(', ')}`,
          },
        ],
        temperature: 0.7,
      });

      const recommendations = JSON.parse(completion.choices[0].message.content || '[]');
      return recommendations.slice(0, 3);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }
}

export default OpenAIService;
