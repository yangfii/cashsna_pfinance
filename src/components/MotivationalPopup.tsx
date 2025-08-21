import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/useLanguage";

interface MotivationalPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MotivationalPopup({ open, onOpenChange }: MotivationalPopupProps) {
  const { t } = useLanguage();
  
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 5000); // Close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent 
        className="max-w-md w-[90vw] p-6"
        aria-describedby="motivational-text"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {t('welcome.welcomeBack') || 'Welcome Back!'}
          </DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-4" id="motivational-text">
          <div className="text-lg font-semibold text-foreground">
            🎯 Ready to achieve your financial goals?
          </div>
          <div className="text-muted-foreground">
            Keep tracking your progress and stay motivated on your journey to financial success!
          </div>
          <div className="flex justify-center mt-6">
            <div className="animate-pulse text-primary">
              💪 You've got this!
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}