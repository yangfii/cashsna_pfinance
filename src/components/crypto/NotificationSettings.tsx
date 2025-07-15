import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Mail, MessageCircle, Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";

export default function NotificationSettings() {
  const { settings, saveSettings } = useNotifications();
  const [email, setEmail] = useState(settings.email || "");
  const [telegramChatId, setTelegramChatId] = useState(settings.telegramChatId || "");
  const { toast } = useToast();

  const handleSave = () => {
    saveSettings({
      email: email || undefined,
      telegramChatId: telegramChatId || undefined,
      pushEnabled: settings.pushEnabled
    });
    
    toast({
      title: "Settings saved",
      description: "Your notification settings have been updated",
    });
  };

  const togglePushNotifications = async () => {
    if (!settings.pushEnabled) {
      const permission = await Notification.requestPermission();
      saveSettings({
        ...settings,
        pushEnabled: permission === 'granted'
      });
    } else {
      saveSettings({
        ...settings,
        pushEnabled: false
      });
    }
  };

  const testNotification = () => {
    if (settings.pushEnabled) {
      new Notification("🚨 Test Alert", {
        body: "BTC - Price above $50,000",
        icon: '/favicon.ico'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Settings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <Label htmlFor="email">Email Notifications</Label>
          </div>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Receive price alerts via email
          </p>
        </div>

        {/* Telegram Settings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <Label htmlFor="telegram">Telegram Notifications</Label>
            <Badge variant="outline">Setup Required</Badge>
          </div>
          <Input
            id="telegram"
            placeholder="Your Telegram Chat ID"
            value={telegramChatId}
            onChange={(e) => setTelegramChatId(e.target.value)}
          />
          <div className="text-sm text-muted-foreground space-y-1">
            <p>To get your Chat ID:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Start a chat with @userinfobot on Telegram</li>
              <li>Send any message to get your Chat ID</li>
              <li>Copy the ID and paste it above</li>
            </ol>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <Label>Browser Push Notifications</Label>
              <Badge variant="outline">Browser</Badge>
            </div>
            <Switch
              checked={settings.pushEnabled}
              onCheckedChange={togglePushNotifications}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Get instant notifications in your browser
          </p>
          {settings.pushEnabled && (
            <Button variant="outline" size="sm" onClick={testNotification}>
              Test Notification
            </Button>
          )}
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}