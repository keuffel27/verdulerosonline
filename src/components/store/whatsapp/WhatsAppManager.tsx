import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { ConversationHistory } from './ConversationHistory';
import { WhatsAppStats } from './WhatsAppStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import toast from 'react-hot-toast';

interface WhatsAppManagerProps {
  storeId: string;
}

interface WhatsAppSettings {
  welcomeMessage: string;
  autoReply: boolean;
  businessHours: boolean;
}

export const WhatsAppManager: React.FC<WhatsAppManagerProps> = ({ storeId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [settings, setSettings] = useState<WhatsAppSettings>({
    welcomeMessage: '',
    autoReply: true,
    businessHours: true,
  });
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadWhatsAppStatus();
  }, [storeId]);

  const loadWhatsAppStatus = async () => {
    const { data, error } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('store_id', storeId)
      .single();

    if (data) {
      setIsConnected(data.is_connected);
      setSettings({
        welcomeMessage: data.welcome_message || '',
        autoReply: data.auto_reply || true,
        businessHours: data.business_hours || true,
      });
    }
  };

  const handleConnect = async () => {
    setStatus('connecting');
    try {
      const response = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storeId }),
      });

      if (!response.ok) {
        throw new Error('Error al conectar con WhatsApp');
      }

      const data = await response.json();
      if (data.qrCode) {
        setQrCode(data.qrCode);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error connecting to WhatsApp:', error.message);
        toast.error(error.message);
      } else {
        console.error('Unknown error connecting to WhatsApp');
        toast.error('Error al conectar con WhatsApp');
      }
      setStatus('disconnected');
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storeId }),
      });
      setIsConnected(false);
      setStatus('disconnected');
      setQrCode(null);
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
    }
  };

  const handleSettingsChange = async (newSettings: WhatsAppSettings) => {
    try {
      await supabase
        .from('whatsapp_connections')
        .upsert({
          store_id: storeId,
          welcome_message: newSettings.welcomeMessage,
          auto_reply: newSettings.autoReply,
          business_hours: newSettings.businessHours,
        });
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">WhatsApp Business</h2>
        <div>
          {!isConnected ? (
            <button
              onClick={handleConnect}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              disabled={status === 'connecting'}
            >
              {status === 'connecting' ? 'Conectando...' : 'Conectar WhatsApp'}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Desconectar
            </button>
          )}
        </div>
      </div>

      {qrCode && !isConnected && (
        <div className="flex flex-col items-center space-y-4 p-4 border rounded">
          <p className="text-sm text-gray-600">
            Escanea este código QR con WhatsApp Business para conectar tu cuenta
          </p>
          <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="conversations">Conversaciones</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          {isConnected && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">WhatsApp conectado</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje de bienvenida
                  </label>
                  <textarea
                    className="w-full p-2 border rounded"
                    value={settings.welcomeMessage}
                    onChange={(e) =>
                      handleSettingsChange({
                        ...settings,
                        welcomeMessage: e.target.value,
                      })
                    }
                    placeholder="¡Hola! Gracias por contactarnos..."
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.autoReply}
                      onChange={(e) =>
                        handleSettingsChange({
                          ...settings,
                          autoReply: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      Respuestas automáticas
                    </span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.businessHours}
                      onChange={(e) =>
                        handleSettingsChange({
                          ...settings,
                          businessHours: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      Respetar horario comercial
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="conversations">
          <ConversationHistory storeId={storeId} />
        </TabsContent>

        <TabsContent value="stats">
          <WhatsAppStats storeId={storeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
