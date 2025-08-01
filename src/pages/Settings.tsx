import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Globe, 
  DollarSign, 
  Bell,
  Shield,
  Download,
  Trash2,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import { ProfileCard } from "@/components/ProfileCard";
import { TwoFactorSetup } from "@/components/TwoFactorSetup";
import { TrustedDevicesManager } from "@/components/TrustedDevicesManager";
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
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    currency: "USD",
    language: language,
    notifications: true,
    monthlyBudget: "2000",
    categories: true,
    autoBackup: true,
    darkMode: theme === "dark"
  });

  // Sync settings with language context
  useEffect(() => {
    setSettings(prev => ({ ...prev, language: language }));
  }, [language]);

  const handleSaveSettings = () => {
    console.log('Saving settings:', settings);
    // Update language if it's different
    if (settings.language !== language) {
      setLanguage(settings.language);
    }
    toast({
      title: t('settings.saved'),
      description: t('settings.savedDesc'),
    });
  };

  const handleExportData = () => {
    toast({
      title: t('settings.exportData'),
      description: t('settings.exportDataDesc'),
    });
  };

  const handleDeleteAllData = () => {
    try {
      // Clear localStorage data
      localStorage.removeItem('transactions');
      localStorage.removeItem('categories');  
      localStorage.removeItem('settings');
      localStorage.removeItem('monthlyBudget');
      
      // Reset current settings to defaults
      setSettings({
        currency: "USD",
        language: "khmer", 
        notifications: true,
        monthlyBudget: "2000",
        categories: true,
        autoBackup: true,
        darkMode: theme === "dark"
      });
      
      console.log('All data cleared successfully');
      
      toast({
        title: t('settings.saved'),
        description: t('settings.savedDesc'),
        variant: "destructive",
      });
      
      // Redirect to dashboard after clearing data
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: t('common.no'),
        description: t('settings.savedDesc'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gradient-primary rounded-xl">
          <SettingsIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('settings.title')}</h1>
          <p className="text-muted-foreground">{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* Profile Information */}
      <ProfileCard />

      {/* Two-Factor Authentication */}
      <TwoFactorSetup />

      {/* Trusted Devices */}
      <TrustedDevicesManager />

      {/* Appearance Settings */}
      <Card className="stat-card animate-bounce-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            {t('settings.appearance')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">{t('settings.theme')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.themeDesc')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="gap-2"
              >
                <Sun className="h-4 w-4" />
                {t('settings.light')}
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="gap-2"
              >
                <Moon className="h-4 w-4" />
                {t('settings.dark')}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">{t('settings.language')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.languageDesc')}
              </p>
            </div>
            <Select value={settings.language} onValueChange={(value) => {
              setLanguage(value);
              setSettings({...settings, language: value});
            }}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="khmer">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    ខ្មែរ
                  </div>
                </SelectItem>
                <SelectItem value="english">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    English
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Financial Settings */}
      <Card className="stat-card animate-bounce-in" style={{animationDelay: '0.1s'}}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t('settings.financial')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">{t('settings.currency')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.currencyDesc')}
              </p>
            </div>
            <Select value={settings.currency} onValueChange={(value) => 
              setSettings({...settings, currency: value})
            }>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="KHR">KHR (៛)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-base">{t('settings.monthlyBudget')}</Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                value={settings.monthlyBudget}
                onChange={(e) => setSettings({...settings, monthlyBudget: e.target.value})}
                className="w-32"
              />
              <Badge variant="secondary">
                {settings.currency} {settings.monthlyBudget}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('settings.monthlyBudgetDesc')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="stat-card animate-bounce-in" style={{animationDelay: '0.2s'}}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('settings.notifications')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">{t('settings.generalNotifications')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.generalNotificationsDesc')}
              </p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => 
                setSettings({...settings, notifications: checked})
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">{t('settings.budgetNotifications')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.budgetNotificationsDesc')}
              </p>
            </div>
            <Switch
              checked={true}
              onCheckedChange={() => {}}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security & Backup */}
      <Card className="stat-card animate-bounce-in" style={{animationDelay: '0.3s'}}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('settings.securityBackup')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">{t('settings.secureLogin')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.secureLoginDesc')}
              </p>
            </div>
            <Switch
              checked={true}
              onCheckedChange={() => {}}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">{t('settings.encryptedData')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.encryptedDataDesc')}
              </p>
            </div>
            <Switch
              checked={true}
              onCheckedChange={() => {}}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">{t('settings.cloudSync')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.cloudSyncDesc')}
              </p>
            </div>
            <Switch
              checked={true}
              onCheckedChange={() => {}}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">{t('settings.autoBackup')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.autoBackupDesc')}
              </p>
            </div>
            <Switch
              checked={settings.autoBackup}
              onCheckedChange={(checked) => 
                setSettings({...settings, autoBackup: checked})
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">  
              <Label className="text-base">{t('settings.exportData')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.exportDataDesc')}
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData} className="gap-2">
              <Download className="h-4 w-4" />
              {t('settings.export')}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base text-destructive">{t('settings.deleteAll')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.deleteAllDesc')}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('settings.deleteAllButton')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('settings.deleteAll')}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('settings.deleteAllDesc')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAllData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('common.yes')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="stat-card animate-bounce-in" style={{animationDelay: '0.4s'}}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('settings.accountInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">{t('settings.appVersion')}</p>
              <p className="text-sm text-muted-foreground">v1.2.0</p>
            </div>
            <Badge variant="secondary">{t('settings.current')}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-6">
        <Button 
          onClick={handleSaveSettings}
          className="bg-gradient-primary border-0 hover:shadow-glow transition-smooth px-8"
        >
          {t('settings.saveChanges')}
        </Button>
      </div>
    </div>
  );
}
