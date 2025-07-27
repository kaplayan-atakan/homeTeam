'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Save,
  RefreshCw,
  Mail,
  Bell,
  Shield,
  Database,
  Server,
  AlertTriangle,
} from 'lucide-react';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
    emailProvider: string;
    webhookUrl?: string;
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireEmailVerification: boolean;
    twoFactorEnabled: boolean;
  };
  performance: {
    cacheEnabled: boolean;
    cacheTtl: number;
    rateLimitEnabled: boolean;
    rateLimitRequests: number;
    rateLimitWindow: number;
  };
}

// Mock data
const mockSettings: SystemSettings = {
  general: {
    siteName: 'homeTeam',
    siteDescription: 'Aile görev yönetim sistemi',
    contactEmail: 'admin@hometeam.com',
    timezone: 'Europe/Istanbul',
    language: 'tr',
    maintenanceMode: false
  },
  notifications: {
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    emailProvider: 'sendgrid',
    webhookUrl: 'https://api.hometeam.com/webhook'
  },
  security: {
    passwordMinLength: 8,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    requireEmailVerification: true,
    twoFactorEnabled: false
  },
  performance: {
    cacheEnabled: true,
    cacheTtl: 3600,
    rateLimitEnabled: true,
    rateLimitRequests: 100,
    rateLimitWindow: 60
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(mockSettings);
  const [activeTab, setActiveTab] = useState('general');

  const queryClient = useQueryClient();

  // Ayarları getir
  const { isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      // API çağrısı
      // return await apiClient.get('/admin/settings');
      // Şimdilik mock data
      return mockSettings;
    }
  });

  // Ayarları kaydet
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: SystemSettings) => {
      // API çağrısı
      // return await apiClient.put('/admin/settings', newSettings);
      console.log('Saving settings:', newSettings);
      return newSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };

  const updateSetting = (section: keyof SystemSettings, key: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ayarlar yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Hata: Ayarlar yüklenemedi</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistem Ayarları</h1>
          <p className="text-gray-600">Sistem genelindeki ayarları yönetin</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setSettings(mockSettings)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sıfırla
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={saveSettingsMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveSettingsMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistem Durumu</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">
                Çevrimiçi
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Son 99.9% uptime
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Durumu</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={settings.performance.cacheEnabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {settings.performance.cacheEnabled ? 'Aktif' : 'Pasif'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              TTL: {settings.performance.cacheTtl}s
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bildirimler</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex space-x-1">
              {settings.notifications.emailEnabled && (
                <Badge className="bg-blue-100 text-blue-800">E-posta</Badge>
              )}
              {settings.notifications.pushEnabled && (
                <Badge className="bg-green-100 text-green-800">Push</Badge>
              )}
              {settings.notifications.smsEnabled && (
                <Badge className="bg-yellow-100 text-yellow-800">SMS</Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Güvenlik</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={settings.security.twoFactorEnabled ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                {settings.security.twoFactorEnabled ? '2FA Aktif' : '2FA Pasif'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Min. şifre: {settings.security.passwordMinLength} karakter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Sistem Ayarları</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">
                <Settings className="h-4 w-4 mr-2" />
                Genel
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Bildirimler
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Güvenlik
              </TabsTrigger>
              <TabsTrigger value="performance">
                <Database className="h-4 w-4 mr-2" />
                Performans
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Adı</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">İletişim E-postası</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zaman Dilimi</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) => updateSetting('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Istanbul">Europe/Istanbul</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Dil</Label>
                  <Select
                    value={settings.general.language}
                    onValueChange={(value) => updateSetting('general', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tr">Türkçe</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Açıklaması</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={settings.general.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting('general', 'maintenanceMode', checked)}
                />
                <Label htmlFor="maintenanceMode" className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>Bakım Modu</span>
                </Label>
              </div>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailEnabled"
                    checked={settings.notifications.emailEnabled}
                    onCheckedChange={(checked) => updateSetting('notifications', 'emailEnabled', checked)}
                  />
                  <Label htmlFor="emailEnabled" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>E-posta Bildirimleri</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="pushEnabled"
                    checked={settings.notifications.pushEnabled}
                    onCheckedChange={(checked) => updateSetting('notifications', 'pushEnabled', checked)}
                  />
                  <Label htmlFor="pushEnabled" className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <span>Push Bildirimleri</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="smsEnabled"
                    checked={settings.notifications.smsEnabled}
                    onCheckedChange={(checked) => updateSetting('notifications', 'smsEnabled', checked)}
                  />
                  <Label htmlFor="smsEnabled">SMS Bildirimleri</Label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="emailProvider">E-posta Sağlayıcısı</Label>
                  <Select
                    value={settings.notifications.emailProvider}
                    onValueChange={(value) => updateSetting('notifications', 'emailProvider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="ses">Amazon SES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    type="url"
                    value={settings.notifications.webhookUrl || ''}
                    onChange={(e) => updateSetting('notifications', 'webhookUrl', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Şifre Uzunluğu</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min="6"
                    max="32"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Oturum Zaman Aşımı (saat)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Maksimum Giriş Denemesi</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    min="3"
                    max="10"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireEmailVerification"
                    checked={settings.security.requireEmailVerification}
                    onCheckedChange={(checked) => updateSetting('security', 'requireEmailVerification', checked)}
                  />
                  <Label htmlFor="requireEmailVerification">E-posta Doğrulaması Zorunlu</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="twoFactorEnabled"
                    checked={settings.security.twoFactorEnabled}
                    onCheckedChange={(checked) => updateSetting('security', 'twoFactorEnabled', checked)}
                  />
                  <Label htmlFor="twoFactorEnabled">İki Faktörlü Doğrulama</Label>
                </div>
              </div>
            </TabsContent>

            {/* Performance Settings */}
            <TabsContent value="performance" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="cacheEnabled"
                    checked={settings.performance.cacheEnabled}
                    onCheckedChange={(checked) => updateSetting('performance', 'cacheEnabled', checked)}
                  />
                  <Label htmlFor="cacheEnabled" className="flex items-center space-x-2">
                    <Database className="h-4 w-4" />
                    <span>Cache Etkin</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="rateLimitEnabled"
                    checked={settings.performance.rateLimitEnabled}
                    onCheckedChange={(checked) => updateSetting('performance', 'rateLimitEnabled', checked)}
                  />
                  <Label htmlFor="rateLimitEnabled">Rate Limiting Etkin</Label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cacheTtl">Cache TTL (saniye)</Label>
                  <Input
                    id="cacheTtl"
                    type="number"
                    min="60"
                    max="86400"
                    value={settings.performance.cacheTtl}
                    onChange={(e) => updateSetting('performance', 'cacheTtl', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rateLimitRequests">Rate Limit İstek Sayısı</Label>
                  <Input
                    id="rateLimitRequests"
                    type="number"
                    min="10"
                    max="1000"
                    value={settings.performance.rateLimitRequests}
                    onChange={(e) => updateSetting('performance', 'rateLimitRequests', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rateLimitWindow">Rate Limit Penceresi (saniye)</Label>
                  <Input
                    id="rateLimitWindow"
                    type="number"
                    min="60"
                    max="3600"
                    value={settings.performance.rateLimitWindow}
                    onChange={(e) => updateSetting('performance', 'rateLimitWindow', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
