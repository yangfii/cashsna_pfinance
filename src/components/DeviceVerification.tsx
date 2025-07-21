import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Smartphone, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { use2FA } from '@/hooks/use2FA';
import { useTrustedDevices } from '@/hooks/useTrustedDevices';
import { toast } from 'sonner';

interface DeviceVerificationProps {
  onVerificationComplete: () => void;
}

export function DeviceVerification({ onVerificationComplete }: DeviceVerificationProps) {
  const { user } = useAuth();
  const { verify2FA } = use2FA();
  const { trustCurrentDevice } = useTrustedDevices();
  
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter a verification code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const result = await verify2FA(verificationCode);
      
      if (result.verified) {
        toast.success('Verification successful!');
        
        // Trust this device if user opted to remember it
        if (rememberDevice) {
          const trustResult = await trustCurrentDevice();
          if (trustResult.error) {
            console.error('Failed to trust device:', trustResult.error);
            toast.error('Device verification successful, but failed to remember device');
          } else {
            toast.success('Device has been remembered for 30 days');
          }
        }
        
        onVerificationComplete();
      } else {
        setError(result.error?.message || 'Invalid verification code');
        toast.error('Invalid verification code');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('An error occurred during verification');
      toast.error('An error occurred during verification');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Device Verification Required</CardTitle>
          <CardDescription>
            This is a new device. Please verify your identity with two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {useBackupCode && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Enter one of your backup codes. Each code can only be used once.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="verification-code">
              {useBackupCode ? 'Backup Code' : 'Verification Code'}
            </Label>
            <Input
              id="verification-code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={useBackupCode ? 'Enter backup code' : 'Enter 6-digit code'}
              maxLength={useBackupCode ? 8 : 6}
              className="text-center text-lg tracking-widest"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground text-center">
              {useBackupCode 
                ? 'Enter your 8-character backup code'
                : 'Open your authenticator app and enter the 6-digit code'
              }
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-device"
              checked={rememberDevice}
              onCheckedChange={(checked) => setRememberDevice(checked === true)}
            />
            <Label
              htmlFor="remember-device"
              className="text-sm font-normal cursor-pointer"
            >
              Remember this device for 30 days
            </Label>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleVerify}
              disabled={isVerifying || !verificationCode.trim()}
              className="w-full"
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setUseBackupCode(!useBackupCode)}
              className="w-full text-sm"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              {useBackupCode ? 'Use authenticator code instead' : 'Use backup code instead'}
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Having trouble? Contact support or use a backup code.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}