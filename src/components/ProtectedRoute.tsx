
import React from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { use2FA } from '@/hooks/use2FA';
import { useTrustedDevices } from '@/hooks/useTrustedDevices';
import { DeviceVerification } from './DeviceVerification';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const { twoFASettings, loading: twoFALoading } = use2FA();
  const { isCurrentDeviceTrusted, loading: deviceLoading } = useTrustedDevices();
  const navigate = useNavigate();
  const [deviceVerified, setDeviceVerified] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please sign in to access this page');
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth, 2FA settings, or device trust
  if (loading || twoFALoading || deviceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check if user has 2FA enabled and device is not trusted
  const requires2FAVerification = 
    twoFASettings?.is_enabled && 
    isCurrentDeviceTrusted === false && 
    !deviceVerified;

  if (requires2FAVerification) {
    return (
      <DeviceVerification 
        onVerificationComplete={() => setDeviceVerified(true)}
      />
    );
  }

  return <>{children}</>;
}
