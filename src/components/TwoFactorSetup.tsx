
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
import { useEncrypted2FA } from '@/hooks/useEncrypted2FA';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';

export function TwoFactorSetup() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const {
    twoFASettings,
    loading,
    fetch2FASettings,
    generate2FASecret,
    generateQRCode,
    enable2FA,
    disable2FA,
    generateNewBackupCodes
  } = useEncrypted2FA();

  console.log('2FA Setup - User:', user?.email);
  console.log('2FA Setup - Settings:', twoFASettings);

  const [secret, setSecret] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetch2FASettings();
  }, [fetch2FASettings]);

  const handleStartSetup = async () => {
    try {
      setIsGenerating(true);
      console.log('Starting 2FA setup...');
      
      const newSecret = generate2FASecret();
      console.log('Generated secret:', newSecret);
      setSecret(newSecret);
      
      if (newSecret.otpauth_url) {
        console.log('Generating QR code for:', newSecret.otpauth_url);
        const qrCodeUrl = await generateQRCode(newSecret.otpauth_url);
        console.log('Generated QR code URL:', qrCodeUrl);
        setQrCode(qrCodeUrl);
      } else {
        console.error('No otpauth_url generated');
        toast.error('Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error during setup:', error);
      toast.error('Failed to generate 2FA secret');
    } finally {
      setIsGenerating(false);
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

  const resetSetup = () => {
    setSecret(null);
    setQrCode('');
    setVerificationCode('');
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
          <Dialog open={isSetupOpen} onOpenChange={(open) => {
            setIsSetupOpen(open);
            if (!open) {
              resetSetup();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleStartSetup}>
                Enable 2FA
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Setup Two-Factor Authentication
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.) or enter the secret key manually.
                  </AlertDescription>
                </Alert>

                {isGenerating ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground">Generating QR code...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {qrCode ? (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-card rounded-lg border">
                          <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                        </div>
                        
                        <div className="w-full space-y-2">
                          <Label htmlFor="manual-key" className="text-sm font-medium">
                            Manual Entry Key (if you can't scan QR code)
                          </Label>
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
                        
                        <div className="w-full space-y-2">
                          <Label htmlFor="verification-code" className="text-sm font-medium">
                            Enter 6-digit verification code from your authenticator app
                          </Label>
                          <Input
                            id="verification-code"
                            placeholder="000000"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            className="text-center text-lg tracking-widest"
                          />
                        </div>
                        
                        <Button 
                          onClick={handleEnable2FA} 
                          disabled={loading || verificationCode.length !== 6} 
                          className="w-full"
                        >
                          {loading ? 'Verifying...' : 'Enable 2FA'}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">QR code not available. Please try again.</p>
                        <Button onClick={handleStartSetup} variant="outline" className="mt-2">
                          Regenerate QR Code
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
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
