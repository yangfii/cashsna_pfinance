import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface FallbackHandlerProps {
  title?: string;
  message?: string;
  showRetry?: boolean;
  showHome?: boolean;
  onRetry?: () => void;
}

export function FallbackHandler({
  title = "Something went wrong",
  message = "We're having trouble loading this page. Please try again.",
  showRetry = true,
  showHome = true,
  onRetry
}: FallbackHandlerProps) {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>
          <div className="flex flex-col gap-2">
            {showRetry && (
              <Button onClick={handleRetry} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            {showHome && (
              <Button
                variant="outline"
                asChild
                className="gap-2"
              >
                <Link to="/dashboard">
                  <Home className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function RouteNotFound() {
  return (
    <FallbackHandler
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      showRetry={false}
    />
  );
}

export function APIErrorFallback() {
  return (
    <FallbackHandler
      title="Service Unavailable"
      message="We're having trouble connecting to our servers. Please check your internet connection and try again."
    />
  );
}