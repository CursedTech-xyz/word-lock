import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Download, Upload, Trash2, Save, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface SettingsData {
  theme: 'dark' | 'light' | 'auto';
  autoSave: boolean;
  encryptionDefault: string;
  keySize: number;
  showAdvanced: boolean;
  enableAnimations: boolean;
  enableSounds: boolean;
  maxFileSize: number;
  compressionLevel: number;
  backupKeys: boolean;
  clearOnExit: boolean;
}

const defaultSettings: SettingsData = {
  theme: 'dark',
  autoSave: true,
  encryptionDefault: 'aes256',
  keySize: 2048,
  showAdvanced: false,
  enableAnimations: true,
  enableSounds: false,
  maxFileSize: 10,
  compressionLevel: 6,
  backupKeys: true,
  clearOnExit: false,
};

export function Settings() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('securetext-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('securetext-settings', JSON.stringify(settings));
      setHasChanges(false);
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'securetext-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Settings Exported",
      description: "Settings file has been downloaded.",
    });
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setSettings({ ...defaultSettings, ...imported });
        setHasChanges(true);
        toast({
          title: "Settings Imported",
          description: "Settings have been loaded from file.",
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid settings file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all stored data? This action cannot be undone.')) {
      localStorage.clear();
      setSettings(defaultSettings);
      setHasChanges(false);
      toast({
        title: "Data Cleared",
        description: "All stored data has been removed.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <SettingsIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Settings</h2>
            <p className="text-muted-foreground">Customize your SecureText experience</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button onClick={saveSettings} className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={settings.theme} onValueChange={(value: any) => updateSetting('theme', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Enable Animations</Label>
              <Switch
                checked={settings.enableAnimations}
                onCheckedChange={(checked) => updateSetting('enableAnimations', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Sound Effects</Label>
              <Switch
                checked={settings.enableSounds}
                onCheckedChange={(checked) => updateSetting('enableSounds', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Advanced Options</Label>
              <Switch
                checked={settings.showAdvanced}
                onCheckedChange={(checked) => updateSetting('showAdvanced', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Encryption */}
        <Card>
          <CardHeader>
            <CardTitle>Encryption</CardTitle>
            <CardDescription>Default encryption settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Algorithm</Label>
              <Select value={settings.encryptionDefault} onValueChange={(value) => updateSetting('encryptionDefault', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aes256">AES-256-GCM</SelectItem>
                  <SelectItem value="rsa">RSA</SelectItem>
                  <SelectItem value="hybrid">Hybrid (RSA + AES)</SelectItem>
                  <SelectItem value="chacha20">ChaCha20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>RSA Key Size</Label>
              <Select value={settings.keySize.toString()} onValueChange={(value) => updateSetting('keySize', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2048">2048 bits</SelectItem>
                  <SelectItem value="4096">4096 bits</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Auto-save Keys</Label>
              <Switch
                checked={settings.backupKeys}
                onCheckedChange={(checked) => updateSetting('backupKeys', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Optimize performance settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Max File Size (MB)</Label>
              <Select value={settings.maxFileSize.toString()} onValueChange={(value) => updateSetting('maxFileSize', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 MB</SelectItem>
                  <SelectItem value="10">10 MB</SelectItem>
                  <SelectItem value="25">25 MB</SelectItem>
                  <SelectItem value="50">50 MB</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Compression Level</Label>
              <Select value={settings.compressionLevel.toString()} onValueChange={(value) => updateSetting('compressionLevel', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Low (Fast)</SelectItem>
                  <SelectItem value="6">Medium</SelectItem>
                  <SelectItem value="9">High (Small)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Auto-save Work</Label>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Clear on Exit</Label>
              <Switch
                checked={settings.clearOnExit}
                onCheckedChange={(checked) => updateSetting('clearOnExit', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Import, export, and manage your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={exportSettings} variant="outline" className="flex-1 gap-2">
                <Download className="w-4 h-4" />
                Export Settings
              </Button>
              
              <label className="flex-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="hidden"
                />
                <Button variant="outline" className="w-full gap-2" asChild>
                  <span>
                    <Upload className="w-4 h-4" />
                    Import Settings
                  </span>
                </Button>
              </label>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button onClick={resetSettings} variant="outline" className="flex-1 gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset to Default
              </Button>
              
              <Button onClick={clearAllData} variant="destructive" className="flex-1 gap-2">
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}