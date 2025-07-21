import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Smartphone, Monitor, Trash2, Calendar, Shield } from 'lucide-react';
import { useTrustedDevices } from '@/hooks/useTrustedDevices';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function TrustedDevicesManager() {
  const { 
    trustedDevices, 
    isCurrentDeviceTrusted,
    currentDeviceFingerprint,
    removeTrustedDevice,
    loading
  } = useTrustedDevices();

  const handleRemoveDevice = async (deviceId: string, deviceName: string) => {
    const result = await removeTrustedDevice(deviceId);
    
    if (result.error) {
      toast.error('Failed to remove device');
      console.error('Error removing device:', result.error);
    } else {
      toast.success(`Removed "${deviceName}" from trusted devices`);
    }
  };

  const getDeviceIcon = (deviceName: string) => {
    if (deviceName.toLowerCase().includes('mobile') || 
        deviceName.toLowerCase().includes('android') || 
        deviceName.toLowerCase().includes('ios')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const isCurrentDevice = (deviceFingerprint: string) => {
    return deviceFingerprint === currentDeviceFingerprint;
  };

  if (loading) {
    return (
      <Card className="stat-card animate-bounce-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Trusted Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="stat-card animate-bounce-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Trusted Devices
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Devices you've marked as trusted won't require two-factor authentication for 30 days.
          </p>
          
          {trustedDevices.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No trusted devices</p>
              <p className="text-sm text-muted-foreground">
                Devices will appear here when you choose to remember them during 2FA verification.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {trustedDevices.map((device) => (
                <div 
                  key={device.id} 
                  className="flex items-center justify-between p-4 border rounded-lg bg-background/50"
                >
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(device.device_name)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{device.device_name}</span>
                        {isCurrentDevice(device.device_fingerprint) && (
                          <Badge variant="outline" className="text-xs">
                            Current Device
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Added {format(new Date(device.created_at), 'MMM dd, yyyy')}
                        </span>
                        <span>
                          Last used {format(new Date(device.last_used), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Trusted Device</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove "{device.device_name}" from your trusted devices? 
                          {isCurrentDevice(device.device_fingerprint) && 
                            " This will require 2FA verification the next time you access your account from this device."
                          }
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveDevice(device.id, device.device_name)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Current Device Status</p>
                <p className="text-xs text-muted-foreground">
                  {isCurrentDeviceTrusted 
                    ? 'This device is trusted and won\'t require 2FA for 30 days'
                    : 'This device is not trusted and will require 2FA verification'
                  }
                </p>
              </div>
              <Badge variant={isCurrentDeviceTrusted ? 'default' : 'secondary'}>
                {isCurrentDeviceTrusted ? 'Trusted' : 'Not Trusted'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}