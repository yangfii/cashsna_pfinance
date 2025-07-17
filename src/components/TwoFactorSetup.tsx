import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ShieldCheck, QrCode, Download, AlertTriangle, Copy } from 'lucide-react';
import { use2FA } from '@/hooks/use2FA';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';

export function TwoFactorSetup() {
  const { t } = useLanguage();
  const {
    twoFASettings,
    loading,
    fetch2FASettings,
    generate2FASecret,
    generateQRCode,
    enable2FA,
    disable2FA,
    generateNewBackupCodes
  } = use2FA();

  const [setupStep, setSetupStep] = useState<'generate' | 'verify'>('generate');
  const [secret, setSecret] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  useEffect(() => {
    fetch2FASettings();
  }, [fetch2FASettings]);

  const handleGenerateSecret = async () => {
    try {
      const newSecret = generate2FASecret();
      setSecret(newSecret);
      
      const qrCodeUrl = await generateQRCode(newSecret.otpauth_url!);
      setQrCode(qrCodeUrl);
      setSetupStep('verify');
    } catch (error) {
      console.error('Error generating secret:', error);
      toast.error('Failed to generate 2FA secret');
    }
  };

  const handleEnable2FA = async () => {
    if (!secret || !verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    const result = await enable2FA(secret.secret, verificationCode);
    
    if (result.error) {
      toast.error(result.error.message || 'Failed to enable 2FA');
      return;
    }

    if (result.backupCodes) {
      setBackupCodes(result.backupCodes);
      setShowBackupCodes(true);
    }

    toast.success('2FA enabled successfully!');
    setIsSetupOpen(false);
    setSetupStep('generate');
    setVerificationCode('');
    setSecret(null);
    setQrCode('');
  };

  const handleDisable2FA = async () => {
    const result = await disable2FA();
    
    if (result.error) {
      toast.error('Failed to disable 2FA');
      return;
    }

    toast.success('2FA disabled successfully');
  };

  const handleGenerateNewBackupCodes = async () => {
    const result = await generateNewBackupCodes();
    
    if (result.error) {
      toast.error('Failed to generate new backup codes');
      return;
    }

    if (result.data) {
      setBackupCodes(result.data);
      setShowBackupCodes(true);
      toast.success('New backup codes generated');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cashsnap-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Two-Factor Authentication (2FA)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">2FA Status</h3>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <Badge variant={twoFASettings?.is_enabled ? "default" : "secondary"}>
            {twoFASettings?.is_enabled ? (
              <>
                <ShieldCheck className="h-3 w-3 mr-1" />
                Enabled
              </>
            ) : (
              <>
                <Shield className="h-3 w-3 mr-1" />
                Disabled
              </>
            )}
          </Badge>
        </div>

        {!twoFASettings?.is_enabled ? (
          <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleGenerateSecret}>
                Enable 2FA
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
              </DialogHeader>
              
              {setupStep === 'generate' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  
                  {qrCode && (
                    <div className="flex flex-col items-center space-y-4">
                      <img src={qrCode} alt="2FA QR Code" className="border rounded-lg" />
                      
                      <div className="w-full">
                        <Label htmlFor="manual-key">Manual Entry Key</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="manual-key"
                            value={secret?.secret || ''}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(secret?.secret || '')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="w-full">
                        <Label htmlFor="verification-code">Verification Code</Label>
                        <Input
                          id="verification-code"
                          placeholder="Enter 6-digit code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          maxLength={6}
                        />
                      </div>
                      
                      <Button onClick={handleEnable2FA} disabled={loading} className="w-full">
                        {loading ? 'Verifying...' : 'Enable 2FA'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        ) : (
          <div className="space-y-3">
            <Button variant="destructive" onClick={handleDisable2FA} disabled={loading}>
              Disable 2FA
            </Button>
            
            <Button variant="outline" onClick={handleGenerateNewBackupCodes} disabled={loading}>
              Generate New Backup Codes
            </Button>
          </div>
        )}

        {/* Backup Codes Dialog */}
        <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Backup Recovery Codes
              </DialogTitle>
            </DialogHeader>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Save these backup codes in a secure location. Each code can only be used once and will allow you to access your account if you lose your authenticator device.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
              {backupCodes.map((code, index) => (
                <div key={index} className="font-mono text-sm p-2 bg-background rounded border">
                  {code}
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={downloadBackupCodes} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download Codes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}