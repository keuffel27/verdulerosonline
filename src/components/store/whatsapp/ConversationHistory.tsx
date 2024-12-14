import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Message {
  id: string;
  created_at: string;
  message_type: 'incoming' | 'outgoing' | 'auto';
  phone_number: string;
  message_content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

interface ConversationHistoryProps {
  storeId: string;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({ storeId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMessages();
    const subscription = supabase
      .channel('whatsapp_messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'whatsapp_messages',
        filter: `store_id=eq.${storeId}`,
      }, 
      () => {
        loadMessages();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [storeId]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const messages = data as Message[];
      setMessages(messages);
      
      // Actualizar lista de contactos
      const uniqueContacts = new Set(messages.map(m => m.phone_number));
      setContacts(uniqueContacts);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoading(false);
    }
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'incoming':
        return 'bg-gray-100 ml-4';
      case 'outgoing':
        return 'bg-blue-100 mr-4';
      case 'auto':
        return 'bg-green-100 mr-4';
      default:
        return 'bg-gray-100';
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Implementar formato específico del país
    return phone;
  };

  const filteredMessages = selectedContact
    ? messages.filter(m => m.phone_number === selectedContact)
    : messages;

  return (
    <div className="h-[600px] flex">
      {/* Lista de contactos */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Contactos</h3>
        </div>
        {Array.from(contacts).map(contact => (
          <div
            key={contact}
            className={`p-4 cursor-pointer hover:bg-gray-50 ${
              selectedContact === contact ? 'bg-blue-50' : ''
            }`}
            onClick={() => setSelectedContact(contact)}
          >
            <div className="font-medium">{formatPhoneNumber(contact)}</div>
            <div className="text-sm text-gray-500">
              {messages.find(m => m.phone_number === contact)?.message_content.substring(0, 30)}...
            </div>
          </div>
        ))}
      </div>

      {/* Mensajes */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold">
            {selectedContact ? formatPhoneNumber(selectedContact) : 'Todos los mensajes'}
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center">Cargando mensajes...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center text-gray-500">No hay mensajes</div>
          ) : (
            filteredMessages.map(message => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${getMessageStyle(message.message_type)} max-w-[80%] ${
                  message.message_type === 'incoming' ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div className="text-sm">
                  {message.message_content}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {format(new Date(message.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  {message.message_type === 'auto' && (
                    <span className="ml-2 text-green-600">(Respuesta automática)</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
