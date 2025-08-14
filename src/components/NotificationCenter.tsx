import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: 'update' | 'bug_fix' | 'maintenance';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export function NotificationCenter() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'update',
      title: 'Security Update v1.3.0',
      message: 'Enhanced authentication and RLS policies have been implemented for better security.',
      timestamp: new Date(),
      read: false
    }
  ]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Show toast notification for new updates
  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length > 0) {
      unreadNotifications.forEach(notification => {
        toast.info(
          `${notification.title}: ${notification.message}`,
          {
            duration: 5000,
            position: "top-right"
          }
        );
      });
    }
  }, [notifications]);

  useEffect(() => {
    // Check for new notifications periodically
    const checkForUpdates = () => {
      // This would typically fetch from an API
      // For now, we'll simulate new notifications
      const hasNewUpdate = Math.random() > 0.9; // 10% chance of new notification
      
      if (hasNewUpdate) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? 'update' : 'bug_fix',
          title: Math.random() > 0.5 ? 'New Feature Released' : 'Bug Fixed',
          message: Math.random() > 0.5 
            ? 'A new feature has been added to improve your experience.'
            : 'A critical bug has been resolved.',
          timestamp: new Date(),
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev]);
      }
    };

    const interval = setInterval(checkForUpdates, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'update':
        return <Zap className="h-4 w-4 text-blue-500" />;
      case 'bug_fix':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'maintenance':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'update':
        return 'Update';
      case 'bug_fix':
        return 'Bug Fix';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Notification';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-accent"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">System Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                    notification.read 
                      ? 'bg-muted/50 hover:bg-muted' 
                      : 'bg-primary/5 hover:bg-primary/10 border border-primary/20'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(notification.type)}
                        </Badge>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <h4 className="font-medium text-sm mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.timestamp.toLocaleDateString()} at{' '}
                        {notification.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-3 border-t bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              toast.success("All notifications cleared");
              setNotifications([]);
              setOpen(false);
            }}
          >
            Clear All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}