import { useState, useEffect } from 'react';
import { Shield, Key, Zap, Download, Copy, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { hybridEncrypt, hybridDecrypt, generateRSAKeyPair, type KeyPair } from '@/lib/crypto';

export function HybridEncryption() {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [encryptedKey, setEncryptedKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Load existing key pair from localStorage
  useEffect(() => {
    const savedKeyPair = localStorage.getItem('hybrid-keypair');
    if (savedKeyPair) {
      try {
        setKeyPair(JSON.parse(savedKeyPair));
      } catch (error) {
        console.error('Failed to load key pair:', error);
      }
    }
  }, []);

  const generateKeys = async () => {
    setIsProcessing(true);
    setProgress(10);
    
    try {
      const newKeyPair = await generateRSAKeyPair(2048);
      setKeyPair(newKeyPair);
      
      // Save to localStorage
      localStorage.setItem('hybrid-keypair', JSON.stringify(newKeyPair));
      
      setProgress(100);
      toast({
        title: "Keys Generated",
        description: "New RSA key pair generated for hybrid encryption.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate key pair.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const processText = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to process.",
        variant: "destructive",
      });
      return;
    }

    if (!keyPair) {
      toast({
        title: "Error",
        description: "Please generate a key pair first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(20);

    try {
      if (mode === 'encrypt') {
        setProgress(50);
        const result = await hybridEncrypt(inputText, keyPair.publicKey);
        setOutputText(result.encrypted);
        setEncryptedKey(result.metadata.encryptedKey);
        setProgress(100);
        
        toast({
          title: "Text Encrypted",
          description: "Text successfully encrypted using hybrid encryption.",
        });
      } else {
        if (!encryptedKey) {
          toast({
            title: "Error",
            description: "Missing encrypted key for decryption.",
            variant: "destructive",
          });
          return;
        }
        
        setProgress(50);
        const result = await hybridDecrypt(inputText, keyPair.privateKey, { encryptedKey });
        setOutputText(result);
        setProgress(100);
        
        toast({
          title: "Text Decrypted",
          description: "Text successfully decrypted.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Processing failed.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: `${label} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setEncryptedKey('');
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Hybrid Encryption</h2>
          <p className="text-muted-foreground">RSA + AES encryption for maximum security and performance</p>
        </div>
      </div>

      {/* How it works */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            How Hybrid Encryption Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">1</Badge>
            <div>
              <p className="font-medium">Generate Random AES Key</p>
              <p className="text-sm text-muted-foreground">A strong 256-bit AES key is generated for each encryption</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">2</Badge>
            <div>
              <p className="font-medium">Encrypt Data with AES</p>
              <p className="text-sm text-muted-foreground">Your text is encrypted quickly using AES-256-GCM</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">3</Badge>
            <div>
              <p className="font-medium">Encrypt AES Key with RSA</p>
              <p className="text-sm text-muted-foreground">The AES key is encrypted with your RSA public key</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {progress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Key Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Key Management
            </CardTitle>
            <CardDescription>
              {keyPair ? 'RSA key pair ready for use' : 'Generate an RSA key pair to start'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {keyPair ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500">Ready</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Key Size</span>
                  <span className="text-sm text-muted-foreground">{keyPair.keySize} bits</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Created</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(keyPair.created).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(keyPair.publicKey, 'Public key')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Public
                  </Button>
                  <Button
                    onClick={() => copyToClipboard(keyPair.privateKey, 'Private key')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Private
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-muted-foreground">No key pair found</p>
              </div>
            )}
            
            <Button
              onClick={generateKeys}
              disabled={isProcessing}
              className="w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
              {keyPair ? 'Regenerate Keys' : 'Generate Keys'}
            </Button>
          </CardContent>
        </Card>

        {/* Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Mode</CardTitle>
            <CardDescription>Choose encryption or decryption mode</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={mode === 'encrypt' ? 'default' : 'outline'}
                onClick={() => setMode('encrypt')}
                className="flex-1"
              >
                <Shield className="w-4 h-4 mr-2" />
                Encrypt
              </Button>
              <Button
                variant={mode === 'decrypt' ? 'default' : 'outline'}
                onClick={() => setMode('decrypt')}
                className="flex-1"
              >
                <Key className="w-4 h-4 mr-2" />
                Decrypt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Input/Output */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>
              {mode === 'encrypt' ? 'Enter text to encrypt' : 'Enter encrypted text to decrypt'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={mode === 'encrypt' ? 'Enter your secret message...' : 'Paste encrypted text here...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
            <CardDescription>
              {mode === 'encrypt' ? 'Encrypted result' : 'Decrypted result'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={outputText}
              readOnly
              className="min-h-[200px] resize-none"
              placeholder="Output will appear here..."
            />
          </CardContent>
        </Card>
      </div>

      {/* Encrypted Key Display */}
      {mode === 'encrypt' && encryptedKey && (
        <Card>
          <CardHeader>
            <CardTitle>Encrypted Key</CardTitle>
            <CardDescription>This key is needed for decryption (automatically handled)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={encryptedKey}
              readOnly
              className="min-h-[100px] resize-none font-mono text-xs"
            />
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => copyToClipboard(encryptedKey, 'Encrypted key')}
                variant="outline"
                size="sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Key
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={processText} disabled={isProcessing || !keyPair} className="gap-2">
          <Shield className="w-4 h-4" />
          {mode === 'encrypt' ? 'Encrypt Text' : 'Decrypt Text'}
        </Button>
        
        {outputText && (
          <>
            <Button onClick={() => copyToClipboard(outputText, 'Result')} variant="outline" className="gap-2">
              <Copy className="w-4 h-4" />
              Copy Result
            </Button>
            <Button 
              onClick={() => downloadText(outputText, `${mode}ed-text.txt`)} 
              variant="outline" 
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </>
        )}
        
        <Button onClick={clearAll} variant="outline" className="gap-2">
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}