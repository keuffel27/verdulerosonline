import { supabase } from '../lib/supabase';
import OpenAIService from './openai';

interface TrainingExample {
  intent: string;
  examples: string[];
  responses: string[];
}

class ChatbotTrainingService {
  static async addTrainingExample(
    storeId: string,
    example: TrainingExample
  ): Promise<void> {
    try {
      await supabase.from('whatsapp_bot_training').insert({
        store_id: storeId,
        intent: example.intent,
        examples: example.examples,
        responses: example.responses,
      });
    } catch (error) {
      console.error('Error adding training example:', error);
    }
  }

  static async updateTrainingExample(
    id: string,
    updates: Partial<TrainingExample>
  ): Promise<void> {
    try {
      await supabase
        .from('whatsapp_bot_training')
        .update(updates)
        .eq('id', id);
    } catch (error) {
      console.error('Error updating training example:', error);
    }
  }

  static async getTrainingExamples(storeId: string): Promise<TrainingExample[]> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_bot_training')
        .select('*')
        .eq('store_id', storeId);

      if (error) throw error;

      return data as TrainingExample[];
    } catch (error) {
      console.error('Error getting training examples:', error);
      return [];
    }
  }

  static async deleteTrainingExample(id: string): Promise<void> {
    try {
      await supabase.from('whatsapp_bot_training').delete().eq('id', id);
    } catch (error) {
      console.error('Error deleting training example:', error);
    }
  }

  static async getIntent(message: string, storeId: string): Promise<string | null> {
    try {
      const examples = await this.getTrainingExamples(storeId);
      
      // Usar OpenAI para clasificar la intención
      const completion = await OpenAIService.classifyIntent(message, examples);
      return completion;
    } catch (error) {
      console.error('Error getting intent:', error);
      return null;
    }
  }

  static async getResponse(intent: string, storeId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_bot_training')
        .select('responses')
        .eq('store_id', storeId)
        .eq('intent', intent)
        .single();

      if (error || !data) return null;

      // Seleccionar una respuesta aleatoria de las disponibles
      const responses = data.responses;
      return responses[Math.floor(Math.random() * responses.length)];
    } catch (error) {
      console.error('Error getting response:', error);
      return null;
    }
  }

  static async trainModel(storeId: string): Promise<void> {
    try {
      const examples = await this.getTrainingExamples(storeId);
      
      // Preparar los datos de entrenamiento para OpenAI
      const trainingData = examples.map(example => ({
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant for a grocery store. The user's intent is: ${example.intent}`,
          },
          ...example.examples.map(ex => ({
            role: "user",
            content: ex,
          })),
          ...example.responses.map(res => ({
            role: "assistant",
            content: res,
          })),
        ],
      }));

      // Actualizar el modelo de OpenAI con los nuevos ejemplos
      await OpenAIService.updateTraining(trainingData);
    } catch (error) {
      console.error('Error training model:', error);
    }
  }

  static async generateResponse(
    message: string,
    storeId: string,
    context?: any
  ): Promise<string> {
    try {
      // 1. Identificar la intención del mensaje
      const intent = await this.getIntent(message, storeId);
      
      if (!intent) {
        return "Lo siento, no entiendo tu mensaje. ¿Podrías reformularlo?";
      }

      // 2. Obtener una respuesta predefinida si existe
      const predefinedResponse = await this.getResponse(intent, storeId);
      if (predefinedResponse) {
        return predefinedResponse;
      }

      // 3. Si no hay respuesta predefinida, generar una con OpenAI
      const response = await OpenAIService.generateResponse(message, storeId);
      
      // 4. Guardar la interacción para futuro entrenamiento
      await this.addTrainingExample({
        intent,
        examples: [message],
        responses: [response],
      }, storeId);

      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      return "Lo siento, estoy teniendo problemas para procesar tu mensaje. Por favor, intenta más tarde.";
    }
  }
}

export default ChatbotTrainingService;
