
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, X, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QRScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRScannerDialog({ open, onOpenChange }: QRScannerDialogProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const startCamera = async () => {
    try {
      setIsScanning(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
      setStream(mediaStream);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const processQRCode = (qrData: string) => {
    try {
      // Extract token from QR code URL
      const url = new URL(qrData);
      const token = url.searchParams.get('token');
      
      if (token && url.pathname.includes('/qr-confirm')) {
        // Navigate to QR confirm page with the token
        navigate(`/qr-confirm?token=${token}`);
        onOpenChange(false);
        
        toast({
          title: "QR Code Scanned",
          description: "Redirecting to confirm sign-in...",
        });
      } else {
        toast({
          title: "Invalid QR Code",
          description: "This QR code is not for sign-in confirmation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Invalid QR Code",
        description: "Unable to process the QR code.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // For now, we'll show a message that the image was processed
            // In a real implementation, you'd use a QR code library here
            toast({
              title: "Image Processed",
              description: "Please manually enter the token from the QR code for now.",
            });
          }
        }
      };
      
      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      }
    };
    
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!open) {
      stopCamera();
    }
  }, [open]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan QR Code for Sign-In
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          {isScanning ? (
            <>
              <div className="relative w-full max-w-sm">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover rounded-lg bg-muted"
                  playsInline
                  muted
                />
                <div className="absolute inset-4 border-2 border-primary border-dashed rounded-lg pointer-events-none">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                Position the QR code within the frame to scan
              </p>
              
              <Button onClick={stopCamera} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Stop Camera
              </Button>
            </>
          ) : (
            <>
              <div className="w-full max-w-sm h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Camera not active</p>
                </div>
              </div>
              
              <div className="flex gap-2 w-full">
                <Button onClick={startCamera} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          )}
          
          <div className="text-xs text-muted-foreground text-center max-w-sm">
            <p>Scan a QR code from another device to confirm sign-in</p>
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
