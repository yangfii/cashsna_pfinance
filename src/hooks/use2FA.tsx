import React from 'react';
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { TOTP, Secret } from 'otpauth';
import QRCode from 'qrcode';

interface TwoFASettings {
  id: string;
  user_id: string;
  secret_key: string;
  is_enabled: boolean;
  backup_codes: string[] | null;
  created_at: string;
  updated_at: string;
}

export function use2FA() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [twoFASettings, setTwoFASettings] = useState<TwoFASettings | null>(null);

  const fetch2FASettings = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_2fa')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching 2FA settings:', error);
        return;
      }

      setTwoFASettings(data);
    } catch (err) {
      console.error('Error fetching 2FA settings:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const generate2FASecret = useCallback(() => {
    const secret = new Secret();
    const totp = new TOTP({
      issuer: 'CashSnap Finance',
      label: user?.email || 'User',
      secret: secret,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    return {
      secret: secret.base32,
      otpauth_url: totp.toString()
    };
  }, [user?.email]);

  const generateQRCode = useCallback(async (secret: string) => {
    try {
      const qrCodeUrl = await QRCode.toDataURL(secret);
      return qrCodeUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }, []);

  const enable2FA = useCallback(async (secretKey: string, token: string) => {
    if (!user) return { error: 'No user found' };

    try {
      setLoading(true);

      // Create TOTP instance for verification
      const secret = Secret.fromBase32(secretKey);
      const totp = new TOTP({
        secret: secret,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
      });

      // Verify the token
      const delta = totp.validate({ token, window: 2 });
      
      if (delta === null) {
        return { error: 'Invalid verification code' };
      }

      // Generate backup codes
      const backupCodes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );

      const { data, error } = await supabase
        .from('user_2fa')
        .upsert({
          user_id: user.id,
          secret_key: secretKey,
          is_enabled: true,
          backup_codes: backupCodes
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error enabling 2FA:', error);
        return { error };
      }

      setTwoFASettings(data);
      return { data, error: null, backupCodes };
    } catch (err) {
      console.error('Error enabling 2FA:', err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const disable2FA = useCallback(async () => {
    if (!user) return { error: 'No user found' };

    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_2fa')
        .update({ is_enabled: false })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error disabling 2FA:', error);
        return { error };
      }

      setTwoFASettings(prev => prev ? { ...prev, is_enabled: false } : null);
      return { error: null };
    } catch (err) {
      console.error('Error disabling 2FA:', err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const verify2FA = useCallback(async (token: string) => {
    if (!user || !twoFASettings) return { verified: false, error: 'No 2FA settings found' };

    try {
      // Check if it's a backup code
      if (twoFASettings.backup_codes?.includes(token.toUpperCase())) {
        // Remove used backup code
        const updatedBackupCodes = twoFASettings.backup_codes.filter(
          code => code !== token.toUpperCase()
        );

        await supabase
          .from('user_2fa')
          .update({ backup_codes: updatedBackupCodes })
          .eq('user_id', user.id);

        return { verified: true, usedBackupCode: true };
      }

      // Verify TOTP token
      const secret = Secret.fromBase32(twoFASettings.secret_key);
      const totp = new TOTP({
        secret: secret,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
      });

      const delta = totp.validate({ token, window: 2 });
      const verified = delta !== null;

      return { verified, usedBackupCode: false };
    } catch (err) {
      console.error('Error verifying 2FA:', err);
      return { verified: false, error: err };
    }
  }, [user, twoFASettings]);

  const generateNewBackupCodes = useCallback(async () => {
    if (!user) return { error: 'No user found' };

    try {
      setLoading(true);

      const backupCodes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );

      const { data, error } = await supabase
        .from('user_2fa')
        .update({ backup_codes: backupCodes })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error generating backup codes:', error);
        return { error };
      }

      setTwoFASettings(data);
      return { data: backupCodes, error: null };
    } catch (err) {
      console.error('Error generating backup codes:', err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    twoFASettings,
    loading,
    fetch2FASettings,
    generate2FASecret,
    generateQRCode,
    enable2FA,
    disable2FA,
    verify2FA,
    generateNewBackupCodes
  };
}