import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { PasswordChangeForm } from "@/components/forms/password-change-form";
import { Save, Building2, Bell, DollarSign, Shield, Lock } from "lucide-react";

export default function Settings() {
  const [pharmacySettings, setPharmacySettings] = useState({
    name: "PharmaCare Health Center",
    address: "123 Medical Boulevard, Healthcare District, City 12345",
    phone: "+1 (555) 123-4567",
    email: "info@pharmacare.com",
    license: "PHARM-2024-001"
  });

  const [systemSettings, setSystemSettings] = useState({
    currency: "USD",
    taxRate: "8",
    lowStockThreshold: "10",
    expiryWarningDays: "30",
    enableEmailNotifications: true,
    enableSmsNotifications: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await fetch(`/api/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ value })
      });
      if (!response.ok) throw new Error('Failed to update setting');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings updated",
        description: "Your changes have been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (settings) {
      // Load settings from API
      const settingsMap: { [key: string]: string } = {};
      settings.forEach((setting: any) => {
        settingsMap[setting.key] = setting.value;
      });

      setPharmacySettings({
        name: settingsMap.pharmacy_name || pharmacySettings.name,
        address: settingsMap.pharmacy_address || pharmacySettings.address,
        phone: settingsMap.pharmacy_phone || pharmacySettings.phone,
        email: settingsMap.pharmacy_email || pharmacySettings.email,
        license: settingsMap.pharmacy_license || pharmacySettings.license
      });

      setSystemSettings({
        currency: settingsMap.currency || systemSettings.currency,
        taxRate: settingsMap.tax_rate || systemSettings.taxRate,
        lowStockThreshold: settingsMap.low_stock_threshold || systemSettings.lowStockThreshold,
        expiryWarningDays: settingsMap.expiry_warning_days || systemSettings.expiryWarningDays,
        enableEmailNotifications: settingsMap.enable_email_notifications === 'true',
        enableSmsNotifications: settingsMap.enable_sms_notifications === 'true'
      });
    }
  }, [settings]);

  const handlePharmacySettingChange = (key: string, value: string) => {
    setPharmacySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSystemSettingChange = (key: string, value: string | boolean) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  const savePharmacySettings = async () => {
    const settingsToSave = [
      { key: 'pharmacy_name', value: pharmacySettings.name },
      { key: 'pharmacy_address', value: pharmacySettings.address },
      { key: 'pharmacy_phone', value: pharmacySettings.phone },
      { key: 'pharmacy_email', value: pharmacySettings.email },
      { key: 'pharmacy_license', value: pharmacySettings.license }
    ];

    for (const setting of settingsToSave) {
      await updateSettingMutation.mutateAsync(setting);
    }
  };

  const saveSystemSettings = async () => {
    const settingsToSave = [
      { key: 'currency', value: systemSettings.currency },
      { key: 'tax_rate', value: systemSettings.taxRate },
      { key: 'low_stock_threshold', value: systemSettings.lowStockThreshold },
      { key: 'expiry_warning_days', value: systemSettings.expiryWarningDays },
      { key: 'enable_email_notifications', value: systemSettings.enableEmailNotifications.toString() },
      { key: 'enable_sms_notifications', value: systemSettings.enableSmsNotifications.toString() }
    ];

    for (const setting of settingsToSave) {
      await updateSettingMutation.mutateAsync(setting);
    }
  };

  const saveAllSettings = async () => {
    await savePharmacySettings();
    await saveSystemSettings();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">System Settings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">System Settings</h2>
        <Button 
          onClick={saveAllSettings}
          disabled={updateSettingMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {updateSettingMutation.isPending ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pharmacy Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Pharmacy Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pharmacy-name">Pharmacy Name</Label>
              <Input
                id="pharmacy-name"
                value={pharmacySettings.name}
                onChange={(e) => handlePharmacySettingChange('name', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="pharmacy-address">Address</Label>
              <Textarea
                id="pharmacy-address"
                value={pharmacySettings.address}
                onChange={(e) => handlePharmacySettingChange('address', e.target.value)}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="pharmacy-phone">Phone Number</Label>
              <Input
                id="pharmacy-phone"
                type="tel"
                value={pharmacySettings.phone}
                onChange={(e) => handlePharmacySettingChange('phone', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="pharmacy-email">Email</Label>
              <Input
                id="pharmacy-email"
                type="email"
                value={pharmacySettings.email}
                onChange={(e) => handlePharmacySettingChange('email', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="pharmacy-license">License Number</Label>
              <Input
                id="pharmacy-license"
                value={pharmacySettings.license}
                onChange={(e) => handlePharmacySettingChange('license', e.target.value)}
              />
            </div>

            <Button 
              onClick={savePharmacySettings}
              disabled={updateSettingMutation.isPending}
              className="w-full"
            >
              Save Pharmacy Settings
            </Button>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currency">Default Currency</Label>
              <Select 
                value={systemSettings.currency}
                onValueChange={(value) => handleSystemSettingChange('currency', value)}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="KES">KES (KSh)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                value={systemSettings.taxRate}
                onChange={(e) => handleSystemSettingChange('taxRate', e.target.value)}
                step="0.1"
                min="0"
                max="100"
              />
            </div>
            
            <div>
              <Label htmlFor="low-stock">Low Stock Threshold</Label>
              <Input
                id="low-stock"
                type="number"
                value={systemSettings.lowStockThreshold}
                onChange={(e) => handleSystemSettingChange('lowStockThreshold', e.target.value)}
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="expiry-warning">Expiry Warning (Days)</Label>
              <Input
                id="expiry-warning"
                type="number"
                value={systemSettings.expiryWarningDays}
                onChange={(e) => handleSystemSettingChange('expiryWarningDays', e.target.value)}
                min="1"
              />
            </div>

            <Button 
              onClick={saveSystemSettings}
              disabled={updateSettingMutation.isPending}
              className="w-full"
            >
              Save System Settings
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for low stock, expiring items, and daily reports
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={systemSettings.enableEmailNotifications}
                onCheckedChange={(checked) => handleSystemSettingChange('enableEmailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive critical alerts via SMS
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={systemSettings.enableSmsNotifications}
                onCheckedChange={(checked) => handleSystemSettingChange('enableSmsNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Security */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Account Security
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <PasswordChangeForm />
          </CardContent>
        </Card>

        {/* Backup & Security */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Backup & Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-24 flex-col">
                <div className="font-medium">Database Backup</div>
                <div className="text-sm text-muted-foreground">Create backup</div>
              </Button>
              <Button variant="outline" className="h-24 flex-col">
                <div className="font-medium">Export Data</div>
                <div className="text-sm text-muted-foreground">Export to CSV/Excel</div>
              </Button>
              <Button variant="outline" className="h-24 flex-col">
                <div className="font-medium">Security Logs</div>
                <div className="text-sm text-muted-foreground">View access logs</div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
