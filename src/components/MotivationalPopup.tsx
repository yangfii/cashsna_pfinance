import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface MotivationalPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MotivationalPopup({ open, onOpenChange }: MotivationalPopupProps) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 5000); // Close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent 
        className="max-w-4xl w-[90vw] h-[90vh] p-0 border-none bg-transparent shadow-none"
        aria-describedby="motivational-image"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src="/lovable-uploads/4aea90e2-b83c-4f8d-a95c-7b445846f3c3.png"
            alt="Motivational message in Khmer with mountain landscape"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            id="motivational-image"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}