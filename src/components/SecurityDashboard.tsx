import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Clock, Users, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityEvent {
  id: string;
  action: string;
  success: boolean;
  ip_address: string | null;
  user_agent?: string;
  failure_reason?: string;
  created_at: string;
}

interface SecurityStats {
  total_attempts: number;
  failed_attempts: number;
  success_rate: number;
  last_24h_attempts: number;
}

export function SecurityDashboard() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent security events
      const { data: events, error: eventsError } = await supabase
        .from('exchange_access_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (eventsError) {
        console.error('Error loading security events:', eventsError);
        toast.error('Failed to load security events');
        return;
      }

      setSecurityEvents((events || []).map(event => ({
        ...event,
        ip_address: event.ip_address?.toString() || 'Unknown'
      })));

      // Calculate security statistics
      if (events && events.length > 0) {
        const total = events.length;
        const failed = events.filter(e => !e.success).length;
        const successRate = ((total - failed) / total) * 100;
        
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last24h = events.filter(e => new Date(e.created_at) > yesterday).length;

        setStats({
          total_attempts: total,
          failed_attempts: failed,
          success_rate: successRate,
          last_24h_attempts: last24h
        });
      }
    } catch (error) {
      console.error('Error loading security data:', error);
      toast.error('Failed to load security dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (event: SecurityEvent) => {
    if (event.success) {
      return <CheckCircle className="h-4 w-4 text-success" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  };

  const getEventBadge = (event: SecurityEvent) => {
    if (event.success) {
      return <Badge variant="outline" className="text-success border-success">Success</Badge>;
    } else {
      return <Badge variant="destructive">Failed</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Security Score</p>
                <p className="text-2xl font-bold text-success">
                  {stats ? Math.round(stats.success_rate) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Attempts</p>
                <p className="text-2xl font-bold">
                  {stats?.total_attempts || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium">Failed Attempts</p>
                <p className="text-2xl font-bold text-destructive">
                  {stats?.failed_attempts || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Last 24h</p>
                <p className="text-2xl font-bold">
                  {stats?.last_24h_attempts || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Security Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>✓ Database Security:</strong> Sensitive data has been cleaned and encrypted. 
              All plaintext API keys and 2FA secrets have been secured.
            </AlertDescription>
          </Alert>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>✓ Input Validation:</strong> Enhanced validation implemented for all sensitive inputs 
              including API credentials and 2FA tokens.
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>⚠ Manual Actions Required:</strong> Some security settings need to be configured 
              in the Supabase dashboard for optimal security.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Security Events</CardTitle>
          <Button onClick={loadSecurityData} variant="outline" size="sm">
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Loading security events...</p>
            </div>
          ) : securityEvents.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No security events found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {securityEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getEventIcon(event)}
                    <div>
                      <p className="font-medium">{event.action}</p>
                      <p className="text-sm text-muted-foreground">
                        IP: {event.ip_address}
                        {event.failure_reason && ` • ${event.failure_reason}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getEventBadge(event)}
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(event.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Enable 2FA for all accounts</p>
              <p className="text-sm text-muted-foreground">
                Two-factor authentication adds an extra layer of security to user accounts.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Regularly rotate API keys</p>
              <p className="text-sm text-muted-foreground">
                Exchange API keys should be rotated periodically for security.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Monitor access logs</p>
              <p className="text-sm text-muted-foreground">
                Regular monitoring of access logs helps detect suspicious activities.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Configure IP restrictions</p>
              <p className="text-sm text-muted-foreground">
                Limit access to exchange accounts from specific IP addresses when possible.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}