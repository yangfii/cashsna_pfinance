import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, Smartphone } from "lucide-react";
import QRCode from "qrcode";

interface QRSignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignInSuccess: (session: any, user: any) => void;
}

export function QRSignInDialog({ open, onOpenChange, onSignInSuccess }: QRSignInDialogProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [sessionToken, setSessionToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { toast } = useToast();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generateQRCode = async () => {
    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-qr-signin');
      
      if (error) throw error;

      const { sessionToken: token, qrUrl, expiresAt: expires } = data;
      
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      setQrDataUrl(qrDataUrl);
      setSessionToken(token);
      setExpiresAt(expires);
      
      // Calculate time left
      const expiryTime = new Date(expires).getTime();
      const now = new Date().getTime();
      setTimeLeft(Math.max(0, Math.floor((expiryTime - now) / 1000)));

      // Start polling for confirmation
      startPolling(token);
      
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startPolling = (token: string) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-qr-signin-status', {
          body: { sessionToken: token }
        });

        if (error) throw error;

        if (data.status === 'confirmed') {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          
          // Sign in the user with the session
          if (data.session) {
            await supabase.auth.setSession(data.session);
            onSignInSuccess(data.session, data.user);
            onOpenChange(false);
            
            toast({
              title: "Success",
              description: "Successfully signed in with QR code!",
            });
          }
        } else if (data.status === 'expired') {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          
          toast({
            title: "QR Code Expired",
            description: "Please generate a new QR code to continue.",
            variant: "destructive",
          });
          
          // Clear the QR code to show it's expired
          setQrDataUrl("");
          setSessionToken("");
        }
      } catch (error) {
        console.error('Error checking QR status:', error);
      }
    }, 2000); // Poll every 2 seconds
  };

  // Update countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      timeoutRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeLeft]);

  // Generate QR code when dialog opens
  useEffect(() => {
    if (open && !qrDataUrl) {
      generateQRCode();
    }
  }, [open]);

  // Cleanup on unmount or dialog close
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setQrDataUrl("");
      setSessionToken("");
      setTimeLeft(0);
    }
  }, [open]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Sign in with QR Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          {isGenerating ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">Generating QR code...</p>
            </div>
          ) : qrDataUrl ? (
            <>
              <div className="p-4 bg-white rounded-lg">
                <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your mobile device to sign in
                </p>
                {timeLeft > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Expires in: {formatTime(timeLeft)}
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={generateQRCode}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh QR Code
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-muted-foreground">Failed to generate QR code</p>
              <Button onClick={generateQRCode} disabled={isGenerating}>
                Try Again
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center max-w-sm">
            <p>1. Open this app on your mobile device</p>
            <p>2. Make sure you're signed in</p>
            <p>3. Scan the QR code above</p>
            <p>4. Confirm the sign-in on your mobile device</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}