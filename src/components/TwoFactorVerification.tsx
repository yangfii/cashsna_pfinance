import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { useEncrypted2FA } from '@/hooks/useEncrypted2FA';
import { toast } from 'sonner';

interface TwoFactorVerificationProps {
  onVerificationSuccess: () => void;
  onCancel?: () => void;
}

export function TwoFactorVerification({ onVerificationSuccess, onCancel }: TwoFactorVerificationProps) {
  const { verify2FA } = useEncrypted2FA();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter a verification code');
      return;
    }

    setLoading(true);
    
    try {
      const result = await verify2FA(verificationCode.trim());
      
      if (result.verified) {
        if (result.usedBackupCode) {
          toast.success('Backup code verified successfully');
        } else {
          toast.success('2FA code verified successfully');
        }
        onVerificationSuccess();
      } else {
        toast.error('Invalid verification code');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your authentication code to continue
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">
              {useBackupCode ? 'Backup Code' : 'Authentication Code'}
            </Label>
            <Input
              id="verification-code"
              placeholder={useBackupCode ? "Enter backup code" : "Enter 6-digit code"}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={useBackupCode ? 10 : 6}
              className="text-center font-mono"
              autoFocus
            />
          </div>

          {useBackupCode && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Backup codes can only be used once. Make sure to generate new ones after using this code.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button 
              onClick={handleVerify} 
              disabled={loading || !verificationCode.trim()}
              className="w-full"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => setUseBackupCode(!useBackupCode)}
              className="w-full text-sm"
            >
              {useBackupCode ? 'Use authenticator code instead' : 'Use backup code instead'}
            </Button>
            
            {onCancel && (
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}