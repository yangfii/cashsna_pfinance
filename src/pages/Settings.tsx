import { useState } from "react";
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
import { ProfileCard } from "@/components/ProfileCard";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    currency: "USD",
    language: "khmer",
    notifications: true,
    monthlyBudget: "2000",
    categories: true,
    autoBackup: true,
    darkMode: theme === "dark"
  });

  const handleSaveSettings = () => {
    toast({
      title: "ការកំណត់ត្រូវបានរក្សាទុក",
      description: "ការកែប្រែរបស់អ្នកត្រូវបានអនុវត្តដោយជោគជ័យ។",
    });
  };

  const handleExportData = () => {
    toast({
      title: "កំពុងនាំចេញទិន្នន័យ",
      description: "ទិន្នន័យរបស់អ្នកនឹងត្រូវបាននាំចេញក្នុងរយៈពេលបន្តិច។",
    });
  };

  const handleDeleteAllData = () => {
    toast({
      title: "លុបទិន្នន័យទាំងអស់",
      description: "សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។ សូមប្រយ័ត្ន!",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gradient-primary rounded-xl">
          <SettingsIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">ការកំណត់</h1>
          <p className="text-muted-foreground">គ្រប់គ្រងការកំណត់និងចំណាត់ចម្រៀងរបស់អ្នក</p>
        </div>
      </div>

      {/* Profile Information */}
      <ProfileCard />

      {/* Appearance Settings */}
      <Card className="stat-card animate-bounce-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            រូបរាងនិងរបៀបបង្ហាញ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">ពន្លឺនិងងងឹត</Label>
              <p className="text-sm text-muted-foreground">
                ប្តូរវិធីបង្ហាញរបស់កម្មវិធី
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
                ពន្លឺ
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="gap-2"
              >
                <Moon className="h-4 w-4" />
                ងងឹត
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">ភាសា</Label>
              <p className="text-sm text-muted-foreground">
                ជ្រើសរើសភាសាកម្មវិធី
              </p>
            </div>
            <Select value={settings.language} onValueChange={(value) => 
              setSettings({...settings, language: value})
            }>
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
            ការកំណត់ហិរញ្ញវត្ថុ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">រូបិយបណ្ណមូលដ្ឋាន</Label>
              <p className="text-sm text-muted-foreground">
                រូបិយបណ្ណសម្រាប់បង្ហាញចំនួន
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
            <Label className="text-base">គោលដៅប្រាក់ចំណាយប្រចាំខែ</Label>
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
              កំណត់ដែនកំណត់ចំណាយប្រចាំខែ
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="stat-card animate-bounce-in" style={{animationDelay: '0.2s'}}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            ការជូនដំណឹង
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">ការជូនដំណឹងទូទៅ</Label>
              <p className="text-sm text-muted-foreground">
                ទទួលការជូនដំណឹងអំពីប្រតិបត្តិការថ្មី
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
              <Label className="text-base">ការជូនដំណឹងគោលដៅ</Label>
              <p className="text-sm text-muted-foreground">
                ជូនដំណឹងពេលដល់ដែនកំណត់ចំណាយ
              </p>
            </div>
            <Switch
              checked={true}
              onCheckedChange={() => {}}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="stat-card animate-bounce-in" style={{animationDelay: '0.3s'}}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            គ្រប់គ្រងទិន្នន័យ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">បេតេកកំមបាំងស្វ័យប្រវត្តិ</Label>
              <p className="text-sm text-muted-foreground">
                បម្រុងទុកទិន្នន័យដោយស្វ័យប្រវត្តិ
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
              <Label className="text-base">នាំចេញទិន្នន័យ</Label>
              <p className="text-sm text-muted-foreground">
                ទាញយកទិន្នន័យរបស់អ្នកជាឯកសារ
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData} className="gap-2">
              <Download className="h-4 w-4" />
              នាំចេញ
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base text-destructive">លុបទិន្នន័យទាំងអស់</Label>
              <p className="text-sm text-muted-foreground">
                លុបប្រតិបត្តិការនិងការកំណត់ទាំងអស់
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAllData}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              លុបទាំងអស់
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="stat-card animate-bounce-in" style={{animationDelay: '0.4s'}}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            ព័ត៌មានគណនី
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">កំណែកម្មវិធី</p>
              <p className="text-sm text-muted-foreground">2024.1.0</p>
            </div>
            <Badge variant="secondary">បច្ចុប្បន្ន</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-6">
        <Button 
          onClick={handleSaveSettings}
          className="bg-gradient-primary border-0 hover:shadow-glow transition-smooth px-8"
        >
          រក្សាទុកការកែប្រែ
        </Button>
      </div>
    </div>
  );
}