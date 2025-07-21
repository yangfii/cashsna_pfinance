import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface TrustedDevice {
  id: string;
  user_id: string;
  device_fingerprint: string;
  device_name: string;
  created_at: string;
  last_used: string;
  expires_at: string;
}

// Generate device fingerprint based on browser/device characteristics
function generateDeviceFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Device fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString();
}

function getDeviceName(): string {
  const userAgent = navigator.userAgent;
  
  // Detect OS
  let os = 'Unknown OS';
  if (userAgent.indexOf('Win') !== -1) os = 'Windows';
  else if (userAgent.indexOf('Mac') !== -1) os = 'macOS';
  else if (userAgent.indexOf('Linux') !== -1) os = 'Linux';
  else if (userAgent.indexOf('Android') !== -1) os = 'Android';
  else if (userAgent.indexOf('iPhone') !== -1) os = 'iOS';
  
  // Detect browser
  let browser = 'Unknown Browser';
  if (userAgent.indexOf('Chrome') !== -1) browser = 'Chrome';
  else if (userAgent.indexOf('Firefox') !== -1) browser = 'Firefox';
  else if (userAgent.indexOf('Safari') !== -1) browser = 'Safari';
  else if (userAgent.indexOf('Edge') !== -1) browser = 'Edge';
  
  return `${browser} on ${os}`;
}

export function useTrustedDevices() {
  const { user } = useAuth();
  const [currentDeviceFingerprint] = useState(() => generateDeviceFingerprint());
  const [isCurrentDeviceTrusted, setIsCurrentDeviceTrusted] = useState<boolean | null>(null);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const checkCurrentDevice = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('trusted_devices')
        .select('*')
        .eq('user_id', user.id)
        .eq('device_fingerprint', currentDeviceFingerprint)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking device trust:', error);
        setIsCurrentDeviceTrusted(false);
      } else if (data) {
        setIsCurrentDeviceTrusted(true);
        // Update last_used timestamp
        await supabase
          .from('trusted_devices')
          .update({ last_used: new Date().toISOString() })
          .eq('id', data.id);
      } else {
        setIsCurrentDeviceTrusted(false);
      }
    } catch (err) {
      console.error('Error checking device trust:', err);
      setIsCurrentDeviceTrusted(false);
    } finally {
      setLoading(false);
    }
  };

  const getTrustedDevices = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trusted_devices')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('last_used', { ascending: false });

      if (error) {
        console.error('Error fetching trusted devices:', error);
      } else {
        setTrustedDevices(data || []);
      }
    } catch (err) {
      console.error('Error fetching trusted devices:', err);
    }
  };

  const trustCurrentDevice = async (deviceName?: string) => {
    if (!user) return { error: 'No user found' };

    try {
      const { data, error } = await supabase
        .from('trusted_devices')
        .insert({
          user_id: user.id,
          device_fingerprint: currentDeviceFingerprint,
          device_name: deviceName || getDeviceName(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .select()
        .single();

      if (error) {
        return { error };
      }

      setIsCurrentDeviceTrusted(true);
      await getTrustedDevices();
      return { data };
    } catch (err) {
      return { error: err };
    }
  };

  const removeTrustedDevice = async (deviceId: string) => {
    if (!user) return { error: 'No user found' };

    try {
      const { error } = await supabase
        .from('trusted_devices')
        .delete()
        .eq('id', deviceId)
        .eq('user_id', user.id);

      if (error) {
        return { error };
      }

      await getTrustedDevices();
      
      // Check if we just removed the current device
      const removedDevice = trustedDevices.find(d => d.id === deviceId);
      if (removedDevice && removedDevice.device_fingerprint === currentDeviceFingerprint) {
        setIsCurrentDeviceTrusted(false);
      }
      
      return { success: true };
    } catch (err) {
      return { error: err };
    }
  };

  useEffect(() => {
    if (user) {
      checkCurrentDevice();
      getTrustedDevices();
    } else {
      setIsCurrentDeviceTrusted(null);
      setTrustedDevices([]);
      setLoading(false);
    }
  }, [user]);

  return {
    currentDeviceFingerprint,
    isCurrentDeviceTrusted,
    trustedDevices,
    loading,
    trustCurrentDevice,
    removeTrustedDevice,
    getTrustedDevices,
    checkCurrentDevice
  };
}