import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  email?: string;
  telegramChatId?: string;
  pushEnabled: boolean;
}

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    requestNotificationPermission();
    loadSettings();
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setSettings(prev => ({ ...prev, pushEnabled: permission === 'granted' }));
    }
  };

  const loadSettings = () => {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  };

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const sendNotification = async (type: 'email' | 'telegram' | 'push', alert: any) => {
    setIsLoading(true);
    
    try {
      if (type === 'push' && settings.pushEnabled) {
        new Notification(`🚨 ${alert.name}`, {
          body: `${alert.symbol.toUpperCase()} - ${alert.condition}`,
          icon: '/favicon.ico'
        });
        return;
      }

      const recipient = type === 'email' ? settings.email : settings.telegramChatId;
      if (!recipient) {
        throw new Error(`${type} not configured`);
      }

      const { error } = await supabase.functions.invoke('send-crypto-notifications', {
        body: {
          type,
          recipient,
          alert
        }
      });

      if (error) throw error;

      toast({
        title: "Notification sent",
        description: `${type} notification sent successfully`,
      });
    } catch (error: any) {
      console.error(`Error sending ${type} notification:`, error);
      toast({
        title: "Notification failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    saveSettings,
    sendNotification,
    isLoading,
    requestNotificationPermission
  };
}