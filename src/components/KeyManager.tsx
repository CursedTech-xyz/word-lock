import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { generateRSAKeyPair, type KeyPair } from '@/lib/crypto';
import { Key, Download, Upload, Copy, Trash2, Shield, Clock } from 'lucide-react';

export const KeyManager = () => {
  const [keyPairs, setKeyPairs] = useState<KeyPair[]>([]);
  const [selectedKeyPair, setSelectedKeyPair] = useState<KeyPair | null>(null);
  const [keySize, setKeySize] = useState<2048 | 4096>(2048);
  const [isGenerating, setIsGenerating] = useState(false);
  const [importData, setImportData] = useState('');
  const { toast } = useToast();

  // Load key pairs from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('rsa-keypairs');
    if (savedKeys) {
      try {
        setKeyPairs(JSON.parse(savedKeys));
      } catch (error) {
        console.error('Failed to load saved key pairs:', error);
      }
    }
  }, []);

  // Save key pairs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('rsa-keypairs', JSON.stringify(keyPairs));
  }, [keyPairs]);

  const handleGenerateKeyPair = async () => {
    setIsGenerating(true);
    try {
      const newKeyPair = await generateRSAKeyPair(keySize);
      setKeyPairs(prev => [newKeyPair, ...prev]);
      setSelectedKeyPair(newKeyPair);
      toast({
        title: "Key Pair Generated",
        description: `New ${keySize}-bit RSA key pair created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate RSA key pair. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyKey = (key: string, type: 'public' | 'private') => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied to Clipboard",
      description: `${type === 'public' ? 'Public' : 'Private'} key copied successfully.`,
    });
  };

  const handleDownloadKey = (keyPair: KeyPair) => {
    const keyData = {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      keySize: keyPair.keySize,
      created: keyPair.created,
      exported: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(keyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rsa-keypair-${keyPair.keySize}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Key Pair Downloaded",
      description: "RSA key pair exported successfully.",
    });
  };

  const handleImportKey = () => {
    try {
      const keyData = JSON.parse(importData);
      if (!keyData.publicKey || !keyData.privateKey) {
        throw new Error('Invalid key format');
      }
      
      const importedKeyPair: KeyPair = {
        publicKey: keyData.publicKey,
        privateKey: keyData.privateKey,
        keySize: keyData.keySize || 2048,
        created: keyData.created || new Date().toISOString()
      };
      
      setKeyPairs(prev => [importedKeyPair, ...prev]);
      setImportData('');
      toast({
        title: "Key Pair Imported",
        description: "RSA key pair imported successfully.",
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Invalid key format. Please check your input.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteKeyPair = (keyPair: KeyPair) => {
    setKeyPairs(prev => prev.filter(kp => kp.created !== keyPair.created));
    if (selectedKeyPair?.created === keyPair.created) {
      setSelectedKeyPair(null);
    }
    toast({
      title: "Key Pair Deleted",
      description: "RSA key pair removed from storage.",
    });
  };

  const formatKeyPreview = (key: string, maxLength: number = 50) => {
    if (key.length <= maxLength) return key;
    return key.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Key Generation */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            RSA Key Pair Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="keySize">Key Size (bits)</Label>
              <Select value={keySize.toString()} onValueChange={(value) => setKeySize(Number(value) as 2048 | 4096)}>
                <SelectTrigger id="keySize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2048">2048 bits (Standard)</SelectItem>
                  <SelectItem value="4096">4096 bits (High Security)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleGenerateKeyPair} 
              disabled={isGenerating}
              className="min-w-[120px]"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Generating...
                </div>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Import */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-secondary" />
            Import Key Pair
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="importData">Key Pair JSON Data</Label>
            <Textarea
              id="importData"
              placeholder="Paste your exported key pair JSON data here..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="min-h-[100px] font-mono text-sm"
            />
          </div>
          <Button onClick={handleImportKey} disabled={!importData.trim()}>
            <Upload className="w-4 h-4 mr-2" />
            Import Key Pair
          </Button>
        </CardContent>
      </Card>

      {/* Key Pairs List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Stored Key Pairs ({keyPairs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {keyPairs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No key pairs stored. Generate or import a key pair to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {keyPairs.map((keyPair, index) => (
                <div key={keyPair.created} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {keyPair.keySize} bits
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(keyPair.created)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedKeyPair(keyPair)}
                      >
                        {selectedKeyPair?.created === keyPair.created ? 'Selected' : 'Select'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadKey(keyPair)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteKeyPair(keyPair)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-xs">Public Key</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyKey(keyPair.publicKey, 'public')}
                          className="h-6 px-2"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="bg-muted/50 rounded p-2 font-mono text-xs break-all">
                        {formatKeyPreview(keyPair.publicKey, 80)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-xs">Private Key</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyKey(keyPair.privateKey, 'private')}
                          className="h-6 px-2"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="bg-muted/50 rounded p-2 font-mono text-xs break-all">
                        {formatKeyPreview(keyPair.privateKey, 80)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Key Pair Details */}
      {selectedKeyPair && (
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Active Key Pair
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Key Size</Label>
                <p className="font-mono">{selectedKeyPair.keySize} bits</p>
              </div>
              <div>
                <Label>Created</Label>
                <p className="font-mono">{formatDate(selectedKeyPair.created)}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div>
                <Label>Public Key (for sharing)</Label>
                <Textarea
                  value={selectedKeyPair.publicKey}
                  readOnly
                  className="font-mono text-xs"
                  rows={4}
                />
              </div>
              
              <div>
                <Label>Private Key (keep secure)</Label>
                <Textarea
                  value={selectedKeyPair.privateKey}
                  readOnly
                  className="font-mono text-xs"
                  rows={6}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};