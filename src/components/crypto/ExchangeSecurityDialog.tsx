import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Clock, Eye, Plus, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type ExchangeAccount = Database['public']['Tables']['exchange_accounts']['Row'];
type ExchangeAccessLog = Database['public']['Tables']['exchange_access_logs']['Row'];

interface ExchangeSecurityDialogProps {
  account: ExchangeAccount;
  onUpdate: () => void;
}

export default function ExchangeSecurityDialog({ account, onUpdate }: ExchangeSecurityDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accessLogs, setAccessLogs] = useState<ExchangeAccessLog[]>([]);
  const [newIpAddress, setNewIpAddress] = useState('');
  
  const [securitySettings, setSecuritySettings] = useState<{
    requires_reauth: boolean;
    max_daily_syncs: number;
    allowed_ips: string[];
  }>({
    requires_reauth: account.requires_reauth ?? true,
    max_daily_syncs: account.max_daily_syncs || 10,
    allowed_ips: (account.allowed_ips as string[]) || []
  });

  useEffect(() => {
    if (open) {
      loadAccessLogs();
    }
  }, [open]);

  const loadAccessLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('exchange_access_logs')
        .select('*')
        .eq('exchange_account_id', account.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAccessLogs(data || []);
    } catch (error) {
      console.error('Error loading access logs:', error);
      toast.error('Failed to load access logs');
    }
  };

  const updateSecuritySettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('exchange_accounts')
        .update({
          requires_reauth: securitySettings.requires_reauth,
          max_daily_syncs: securitySettings.max_daily_syncs,
          allowed_ips: securitySettings.allowed_ips.length > 0 ? securitySettings.allowed_ips : null
        })
        .eq('id', account.id);

      if (error) throw error;
      
      toast.success('Security settings updated successfully');
      onUpdate();
    } catch (error) {
      console.error('Error updating security settings:', error);
      toast.error('Failed to update security settings');
    } finally {
      setLoading(false);
    }
  };

  const addIpAddress = () => {
    if (!newIpAddress.trim()) {
      toast.error('Please enter a valid IP address');
      return;
    }

    // Basic IP validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(newIpAddress.trim())) {
      toast.error('Please enter a valid IPv4 address');
      return;
    }

    if (securitySettings.allowed_ips.includes(newIpAddress.trim())) {
      toast.error('IP address already exists');
      return;
    }

    setSecuritySettings(prev => ({
      ...prev,
      allowed_ips: [...prev.allowed_ips, newIpAddress.trim()]
    }));
    setNewIpAddress('');
  };

  const removeIpAddress = (ip: string) => {
    setSecuritySettings(prev => ({
      ...prev,
      allowed_ips: prev.allowed_ips.filter(existingIp => existingIp !== ip)
    }));
  };

  const requireReauth = async () => {
    try {
      const { error } = await supabase.rpc('update_exchange_auth', {
        account_id: account.id,
        auth_duration_hours: 2
      });

      if (error) throw error;
      
      toast.success('Re-authentication completed. Access granted for 2 hours.');
      onUpdate();
    } catch (error) {
      console.error('Error updating authentication:', error);
      toast.error('Failed to update authentication');
    }
  };

  const isAuthExpired = () => {
    if (!account.auth_expires_at) return true;
    return new Date(account.auth_expires_at) <= new Date();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Shield className="h-4 w-4" />
          Security
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Exchange Security Settings - {account.account_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Security Settings</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="logs">Access Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Authentication Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Re-authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require password verification before accessing exchange credentials
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.requires_reauth}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({ ...prev, requires_reauth: checked }))
                    }
                  />
                </div>

                {account.requires_reauth && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Authentication Status:</span>
                      <Badge variant={isAuthExpired() ? "destructive" : "default"}>
                        {isAuthExpired() ? "Authentication Required" : "Authenticated"}
                      </Badge>
                    </div>
                    
                    {account.auth_expires_at && !isAuthExpired() && (
                      <p className="text-sm text-muted-foreground">
                        Expires: {new Date(account.auth_expires_at).toLocaleString()}
                      </p>
                    )}

                    {isAuthExpired() && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Re-authentication is required to access this exchange account.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button onClick={requireReauth} className="w-full">
                      Authenticate Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sync Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="max-syncs">Maximum Daily Syncs</Label>
                  <Input
                    id="max-syncs"
                    type="number"
                    min="1"
                    max="100"
                    value={securitySettings.max_daily_syncs}
                    onChange={(e) => 
                      setSecuritySettings(prev => ({ 
                        ...prev, 
                        max_daily_syncs: parseInt(e.target.value) || 10 
                      }))
                    }
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Current usage: {account.daily_sync_count || 0} / {account.max_daily_syncs || 10}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={updateSecuritySettings} disabled={loading}>
                {loading ? 'Updating...' : 'Save Security Settings'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>IP Address Restrictions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter IP address (e.g., 192.168.1.1)"
                    value={newIpAddress}
                    onChange={(e) => setNewIpAddress(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addIpAddress()}
                  />
                  <Button onClick={addIpAddress} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {securitySettings.allowed_ips.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No IP restrictions configured. Access allowed from any IP address.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <Label>Allowed IP Addresses:</Label>
                      {securitySettings.allowed_ips.map((ip: string) => (
                        <div key={ip} className="flex items-center justify-between p-2 border rounded">
                          <span className="font-mono text-sm">{ip}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeIpAddress(ip)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Recent Access Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {accessLogs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No access logs available
                    </p>
                  ) : (
                    accessLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={log.success ? "default" : "destructive"}>
                              {log.action}
                            </Badge>
                            <span className="font-mono text-sm">{log.ip_address?.toString()}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                          {log.failure_reason && (
                            <p className="text-sm text-red-600">{log.failure_reason}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}