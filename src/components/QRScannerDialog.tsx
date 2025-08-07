
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, X, Upload, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";

interface QRScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRScannerDialog({ open, onOpenChange }: QRScannerDialogProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const startCamera = async () => {
    try {
      setIsScanning(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        
        // Start auto-scanning when video is ready
        startAutoScan();
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
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  const startAutoScan = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && !isProcessing) {
        scanFrame();
      }
    }, 500); // Scan every 500ms
  };

  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR detection
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple QR code detection (looking for the characteristic patterns)
    detectQRCode(imageData);
  };

  const detectQRCode = (imageData: ImageData) => {
    try {
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
      if (qrCode && !isProcessing) {
        console.log('QR Code detected:', qrCode.data);
        setIsProcessing(true);
        processQRCode(qrCode.data);
      }
    } catch (error) {
      console.error('Error detecting QR code:', error);
    }
  };

  const processQRCode = async (qrData: string) => {
    try {
      console.log('Processing QR code data:', qrData);
      
      // Check if it's a valid QR confirm URL
      if (!qrData.includes('/qr-confirm') || !qrData.includes('token=')) {
        toast({
          title: "Invalid QR Code",
          description: "This is not a valid sign-in QR code.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      // Extract token from QR code URL
      const url = new URL(qrData);
      const token = url.searchParams.get('token');
      
      if (!token) {
        toast({
          title: "Invalid QR Code",
          description: "The QR code does not contain a valid token.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      console.log('Extracted token:', token);
      
      // Stop camera and close dialog
      stopCamera();
      onOpenChange(false);
      
      // Navigate to confirmation page with token
      navigate(`/qr-confirm?token=${token}`);
      
      toast({
        title: "QR Code Detected",
        description: "Redirecting to confirmation page...",
      });
      
    } catch (error) {
      console.error('Error processing QR code:', error);
      toast({
        title: "Invalid QR Code",
        description: "Unable to process the QR code. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
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
            
            // Get image data and detect QR code
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            detectQRCode(imageData);
            
            // If no QR code found, show error
            setTimeout(() => {
              if (isProcessing) {
                setIsProcessing(false);
                toast({
                  title: "No QR Code Found",
                  description: "Please try with a clearer image containing a QR code.",
                  variant: "destructive",
                });
              }
            }, 1000);
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
            Auto Scan QR Code for Sign-In
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
                
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="bg-white rounded-lg p-4 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Processing QR...</span>
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                {isProcessing ? "Processing QR code..." : "Auto-scanning for QR codes..."}
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
                  Start Auto Scan
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
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
            <p>Position a QR code in the camera view for automatic detection</p>
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
