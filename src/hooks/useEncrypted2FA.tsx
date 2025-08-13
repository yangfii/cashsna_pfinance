import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { TOTP, Secret } from 'otpauth';
import QRCode from 'qrcode';

interface TwoFASettings {
  id: string;
  user_id: string;
  secret_key?: string; // For backward compatibility
  secret_key_enc?: string;
  secret_iv?: string;
  is_enabled: boolean;
  backup_codes?: string[] | null; // For backward compatibility
  backup_codes_enc?: string;
  backup_iv?: string;
  created_at: string;
  updated_at: string;
}

interface EncryptionResult {
  encrypted: string;
  iv: string;
}

export function useEncrypted2FA() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [twoFASettings, setTwoFASettings] = useState<TwoFASettings | null>(null);

  const encryptData = useCallback(async (plaintext: string): Promise<EncryptionResult> => {
    const { data, error } = await supabase.functions.invoke('crypto-encryption', {
      body: { action: 'encrypt', plaintext }
    });

    if (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }

    return data;
  }, []);

  const decryptData = useCallback(async (encryptedData: string, iv: string): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('crypto-encryption', {
      body: { action: 'decrypt', encryptedData, iv }
    });

    if (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }

    return data.plaintext;
  }, []);

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

  const getDecryptedSecret = useCallback(async (settings: TwoFASettings): Promise<string> => {
    // Check if we have encrypted data
    if (settings.secret_key_enc && settings.secret_iv) {
      return await decryptData(settings.secret_key_enc, settings.secret_iv);
    }
    // Fallback to plain text for backward compatibility
    if (settings.secret_key) {
      return settings.secret_key;
    }
    throw new Error('No secret key found');
  }, [decryptData]);

  const getDecryptedBackupCodes = useCallback(async (settings: TwoFASettings): Promise<string[]> => {
    // Check if we have encrypted data
    if (settings.backup_codes_enc && settings.backup_iv) {
      const decryptedCodes = await decryptData(settings.backup_codes_enc, settings.backup_iv);
      return JSON.parse(decryptedCodes);
    }
    // Fallback to plain text for backward compatibility
    if (settings.backup_codes) {
      return settings.backup_codes;
    }
    return [];
  }, [decryptData]);

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

      // Encrypt sensitive data
      const encryptedSecret = await encryptData(secretKey);
      const encryptedBackupCodes = await encryptData(JSON.stringify(backupCodes));

      const { data, error } = await supabase
        .from('user_2fa')
        .upsert({
          user_id: user.id,
          secret_key_enc: encryptedSecret.encrypted,
          secret_iv: encryptedSecret.iv,
          backup_codes_enc: encryptedBackupCodes.encrypted,
          backup_iv: encryptedBackupCodes.iv,
          is_enabled: true,
          // Clear old plain text fields
          secret_key: null,
          backup_codes: null
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
  }, [user, encryptData]);

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
      // Get decrypted backup codes
      const backupCodes = await getDecryptedBackupCodes(twoFASettings);
      
      // Check if it's a backup code
      if (backupCodes.includes(token.toUpperCase())) {
        // Remove used backup code
        const updatedBackupCodes = backupCodes.filter(
          code => code !== token.toUpperCase()
        );

        // Encrypt updated backup codes
        const encryptedBackupCodes = await encryptData(JSON.stringify(updatedBackupCodes));

        await supabase
          .from('user_2fa')
          .update({ 
            backup_codes_enc: encryptedBackupCodes.encrypted,
            backup_iv: encryptedBackupCodes.iv,
            backup_codes: null // Clear old plain text
          })
          .eq('user_id', user.id);

        return { verified: true, usedBackupCode: true };
      }

      // Verify TOTP token
      const secretKey = await getDecryptedSecret(twoFASettings);
      const secret = Secret.fromBase32(secretKey);
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
  }, [user, twoFASettings, getDecryptedBackupCodes, getDecryptedSecret, encryptData]);

  const generateNewBackupCodes = useCallback(async () => {
    if (!user) return { error: 'No user found' };

    try {
      setLoading(true);

      const backupCodes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );

      // Encrypt backup codes
      const encryptedBackupCodes = await encryptData(JSON.stringify(backupCodes));

      const { data, error } = await supabase
        .from('user_2fa')
        .update({ 
          backup_codes_enc: encryptedBackupCodes.encrypted,
          backup_iv: encryptedBackupCodes.iv,
          backup_codes: null // Clear old plain text
        })
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
  }, [user, encryptData]);

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