import { toast } from "@/hooks/use-toast";
import { SuccessIcon, LoadingIcon } from "@/components/ui/action-icons";

interface AnimatedToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

export const useAnimatedToast = () => {
  const showSuccess = (options: AnimatedToastOptions) => {
    return toast({
      title: options.title || "Success",
      description: (
        <div className="flex items-center gap-2">
          <SuccessIcon size="sm" />
          {options.description}
        </div>
      ),
      variant: options.variant || "default",
      duration: options.duration || 3000,
    });
  };

  const showLoading = (options: AnimatedToastOptions) => {
    return toast({
      title: options.title || "Loading...",
      description: (
        <div className="flex items-center gap-2">
          <LoadingIcon size="sm" />
          {options.description}
        </div>
      ),
      variant: options.variant || "default",
      duration: options.duration || 0, // Don't auto-dismiss loading toasts
    });
  };

  const showError = (options: AnimatedToastOptions) => {
    return toast({
      title: options.title || "Error",
      description: options.description,
      variant: "destructive",
      duration: options.duration || 5000,
    });
  };

  return {
    showSuccess,
    showLoading,
    showError,
  };
};

export default useAnimatedToast;