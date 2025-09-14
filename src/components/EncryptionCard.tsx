import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, RotateCcw, Shield, Key, Hash, Code, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { encryptAES256, decryptAES256, encryptRSA, decryptRSA, analyzePasswordStrength } from '@/lib/crypto';

interface EncryptionCardProps {
  mode: 'encrypt' | 'decrypt';
  onModeChange: (mode: 'encrypt' | 'decrypt') => void;
}

const algorithms = [
  { 
    id: 'aes256', 
    name: 'AES-256', 
    icon: Shield,
    description: 'Advanced Encryption Standard with 256-bit key',
    security: 'Very High',
    color: 'bg-emerald-500/20 text-emerald-300'
  },
  { 
    id: 'rsa', 
    name: 'RSA', 
    icon: Key,
    description: 'Asymmetric encryption with public/private keys',
    security: 'Very High',
    color: 'bg-blue-500/20 text-blue-300'
  },
  { 
    id: 'caesar', 
    name: 'Caesar Cipher', 
    icon: Shield,
    description: 'Classic shift cipher with customizable offset',
    security: 'Low',
    color: 'bg-yellow-500/20 text-yellow-300'
  },
  { 
    id: 'base64', 
    name: 'Base64', 
    icon: Code,
    description: 'Encoding standard for data transmission',
    security: 'None',
    color: 'bg-blue-500/20 text-blue-300'
  },
  { 
    id: 'rot13', 
    name: 'ROT13', 
    icon: RotateCcw,
    description: 'Simple letter substitution cipher',
    security: 'Low',
    color: 'bg-purple-500/20 text-purple-300'
  },
  { 
    id: 'xor', 
    name: 'XOR Cipher', 
    icon: Key,
    description: 'Bitwise XOR encryption with password',
    security: 'Medium',
    color: 'bg-green-500/20 text-green-300'
  },
];

export function EncryptionCard({ mode, onModeChange }: EncryptionCardProps) {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [algorithm, setAlgorithm] = useState('aes256');
  const [caesarShift, setCaesarShift] = useState(3);
  const [xorPassword, setXorPassword] = useState('');
  const [aesPassword, setAesPassword] = useState('');
  const [rsaPublicKey, setRsaPublicKey] = useState('');
  const [rsaPrivateKey, setRsaPrivateKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const selectedAlgorithm = algorithms.find(a => a.id === algorithm);

  // Legacy encryption functions for backward compatibility
  const caesarCipher = (text: string, shift: number, decrypt: boolean = false) => {
    const actualShift = decrypt ? -shift : shift;
    return text.replace(/[a-zA-Z]/g, (char) => {
      const start = char >= 'a' ? 97 : 65;
      return String.fromCharCode(((char.charCodeAt(0) - start + actualShift + 26) % 26) + start);
    });
  };

  const base64Process = (text: string, decrypt: boolean = false) => {
    try {
      return decrypt ? atob(text) : btoa(text);
    } catch {
      return 'Invalid Base64 input';
    }
  };

  const rot13Process = (text: string) => {
    return text.replace(/[a-zA-Z]/g, (char) => {
      const start = char >= 'a' ? 97 : 65;
      return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
    });
  };

  const xorCipher = (text: string, password: string) => {
    if (!password) return 'Password required for XOR cipher';
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ password.charCodeAt(i % password.length));
    }
    return btoa(result);
  };

  const xorDecipher = (text: string, password: string) => {
    if (!password) return 'Password required for XOR cipher';
    try {
      const decoded = atob(text);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(decoded.charCodeAt(i) ^ password.charCodeAt(i % password.length));
      }
      return result;
    } catch {
      return 'Invalid encrypted text';
    }
  };

  const processText = async () => {
    if (!inputText.trim()) {
      setOutputText('');
      return;
    }

    setIsProcessing(true);
    try {
      let result = '';
      const isDecrypt = mode === 'decrypt';

      switch (algorithm) {
        case 'aes256':
          if (!aesPassword) {
            setOutputText('Password required for AES-256 encryption');
            setIsProcessing(false);
            return;
          }
          if (mode === 'encrypt') {
            const encrypted = await encryptAES256(inputText, aesPassword);
            result = encrypted.encrypted;
          } else {
            result = await decryptAES256(inputText, aesPassword);
          }
          break;
        case 'rsa':
          if (mode === 'encrypt') {
            if (!rsaPublicKey) {
              setOutputText('Public key required for RSA encryption');
              setIsProcessing(false);
              return;
            }
            result = await encryptRSA(inputText, rsaPublicKey);
          } else {
            if (!rsaPrivateKey) {
              setOutputText('Private key required for RSA decryption');
              setIsProcessing(false);
              return;
            }
            result = await decryptRSA(inputText, rsaPrivateKey);
          }
          break;
        case 'caesar':
          result = caesarCipher(inputText, caesarShift, isDecrypt);
          break;
        case 'base64':
          result = base64Process(inputText, isDecrypt);
          break;
        case 'rot13':
          result = rot13Process(inputText);
          break;
        case 'xor':
          result = isDecrypt ? xorDecipher(inputText, xorPassword) : xorCipher(inputText, xorPassword);
          break;
        default:
          result = inputText;
      }

      setOutputText(result);
      toast({
        title: `${mode === 'encrypt' ? 'Encryption' : 'Decryption'} Successful`,
        description: `Text processed using ${algorithms.find(a => a.id === algorithm)?.name}.`,
      });
    } catch (error) {
      setOutputText('Error: Invalid input or operation failed');
      toast({
        title: "Processing Error",
        description: "Failed to process text. Please check your input and keys.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Password strength analysis
  useEffect(() => {
    if (aesPassword) {
      setPasswordStrength(analyzePasswordStrength(aesPassword));
    } else {
      setPasswordStrength(null);
    }
  }, [aesPassword]);

  // Auto-process when inputs change
  useEffect(() => {
    const timeoutId = setTimeout(processText, 300);
    return () => clearTimeout(timeoutId);
  }, [inputText, algorithm, caesarShift, xorPassword, aesPassword, rsaPublicKey, rsaPrivateKey, mode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied successfully.",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Unable to copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setAesPassword('');
    setRsaPublicKey('');
    setRsaPrivateKey('');
    setXorPassword('');
  };

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mode}-result.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadFromLocalStorage = (keyType: 'public' | 'private') => {
    const savedKeys = localStorage.getItem('rsa-keypairs');
    if (savedKeys) {
      try {
        const keyPairs = JSON.parse(savedKeys);
        if (keyPairs.length > 0) {
          const latestKey = keyPairs[0];
          if (keyType === 'public') {
            setRsaPublicKey(latestKey.publicKey);
          } else {
            setRsaPrivateKey(latestKey.privateKey);
          }
          toast({
            title: "Key Loaded",
            description: `${keyType === 'public' ? 'Public' : 'Private'} key loaded from Key Manager.`,
          });
        }
      } catch (error) {
        toast({
          title: "Load Failed",
          description: "No keys found. Generate keys in the Key Manager first.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className={`glass-card ${mode === 'encrypt' ? 'card-encrypt' : 'card-decrypt'} spring-enter`}>
      <CardContent className="p-6 space-y-6">
        {/* Header with Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={mode === 'encrypt' ? 'default' : 'outline'}
              onClick={() => onModeChange('encrypt')}
              className={mode === 'encrypt' ? 'premium-button' : ''}
            >
              <Lock className="w-4 h-4 mr-2" />
              Encrypt
            </Button>
            <Button
              variant={mode === 'decrypt' ? 'default' : 'outline'}
              onClick={() => onModeChange('decrypt')}
              className={mode === 'decrypt' ? 'premium-button-secondary' : ''}
            >
              <Unlock className="w-4 h-4 mr-2" />
              Decrypt
            </Button>
          </div>
          
          {selectedAlgorithm && (
            <Badge className={selectedAlgorithm.color}>
              <selectedAlgorithm.icon className="w-3 h-3 mr-1" />
              {selectedAlgorithm.security} Security
            </Badge>
          )}
        </div>

        {/* Algorithm Selector */}
        <div className="space-y-2">
          <Label htmlFor="algorithm">Encryption Algorithm</Label>
          <Select value={algorithm} onValueChange={setAlgorithm}>
            <SelectTrigger className="monaco-editor">
              <SelectValue placeholder="Select algorithm" />
            </SelectTrigger>
            <SelectContent>
              {algorithms.map((algo) => (
                <SelectItem key={algo.id} value={algo.id}>
                  <div className="flex items-center gap-2">
                    <algo.icon className="w-4 h-4" />
                    <span>{algo.name}</span>
                    <Badge variant="outline" className="text-xs ml-2">
                      {algo.security}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedAlgorithm && (
            <p className="text-sm text-muted-foreground">
              {selectedAlgorithm.description}
            </p>
          )}
        </div>

        {/* Algorithm-specific Settings */}
        {algorithm === 'aes256' && (
          <div className="space-y-2">
            <Label htmlFor="aesPassword">AES-256 Password</Label>
            <div className="relative">
              <Input
                id="aesPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter strong password..."
                value={aesPassword}
                onChange={(e) => setAesPassword(e.target.value)}
                className="pr-10 monaco-editor"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {passwordStrength && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Password Strength</span>
                  <span className={
                    passwordStrength.strength === 'excellent' ? 'text-green-600' :
                    passwordStrength.strength === 'strong' ? 'text-blue-600' :
                    passwordStrength.strength === 'good' ? 'text-yellow-600' :
                    passwordStrength.strength === 'fair' ? 'text-orange-600' : 'text-red-600'
                  }>
                    {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      passwordStrength.strength === 'excellent' ? 'bg-green-600' :
                      passwordStrength.strength === 'strong' ? 'bg-blue-600' :
                      passwordStrength.strength === 'good' ? 'bg-yellow-600' :
                      passwordStrength.strength === 'fair' ? 'bg-orange-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Entropy: {passwordStrength.entropy.toFixed(1)} bits
                </p>
              </div>
            )}
          </div>
        )}

        {algorithm === 'rsa' && (
          <div className="space-y-4">
            {mode === 'encrypt' ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="rsaPublicKey">RSA Public Key</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => loadFromLocalStorage('public')}
                    className="text-xs"
                  >
                    Load from Key Manager
                  </Button>
                </div>
                <Textarea
                  id="rsaPublicKey"
                  placeholder="Paste RSA public key here..."
                  value={rsaPublicKey}
                  onChange={(e) => setRsaPublicKey(e.target.value)}
                  className="font-mono text-sm monaco-editor"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use the Key Manager tab to generate or import RSA keys
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="rsaPrivateKey">RSA Private Key</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => loadFromLocalStorage('private')}
                    className="text-xs"
                  >
                    Load from Key Manager
                  </Button>
                </div>
                <Textarea
                  id="rsaPrivateKey"
                  placeholder="Paste RSA private key here..."
                  value={rsaPrivateKey}
                  onChange={(e) => setRsaPrivateKey(e.target.value)}
                  className="font-mono text-sm monaco-editor"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Keep your private key secure and never share it
                </p>
              </div>
            )}
          </div>
        )}

        {algorithm === 'caesar' && (
          <div className="space-y-2">
            <Label htmlFor="shift">Caesar Shift Value</Label>
            <Input
              id="shift"
              type="number"
              value={caesarShift}
              onChange={(e) => setCaesarShift(parseInt(e.target.value) || 0)}
              min="1"
              max="25"
              className="monaco-editor w-24"
            />
          </div>
        )}

        {algorithm === 'xor' && (
          <div className="space-y-2">
            <Label htmlFor="password">XOR Password</Label>
            <Input
              id="password"
              type="password"
              value={xorPassword}
              onChange={(e) => setXorPassword(e.target.value)}
              placeholder="Enter password for XOR encryption"
              className="monaco-editor"
            />
          </div>
        )}

        {/* Input Text Area */}
        <div className="space-y-2">
          <Label htmlFor="input">
            {mode === 'encrypt' ? 'Text to Encrypt' : 'Text to Decrypt'}
          </Label>
          <Textarea
            id="input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={mode === 'encrypt' ? 'Enter your message here...' : 'Enter encrypted text here...'}
            className="monaco-editor min-h-[120px] resize-none"
            rows={6}
          />
          <div className="text-xs text-muted-foreground">
            {inputText.length} characters
          </div>
        </div>

        {/* Output Text Area */}
        <div className="space-y-2">
          <Label htmlFor="output">
            {mode === 'encrypt' ? 'Encrypted Result' : 'Decrypted Result'}
          </Label>
          <div className="relative">
            <Textarea
              id="output"
              value={outputText}
              readOnly
              className="monaco-editor min-h-[120px] resize-none"
              rows={6}
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-md">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Processing...
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {outputText.length} characters
              {algorithm === 'aes256' && outputText && (
                <span className="ml-2">• AES-256-GCM encrypted</span>
              )}
              {algorithm === 'rsa' && outputText && (
                <span className="ml-2">• RSA-OAEP encrypted</span>
              )}
            </span>
            <span>Processing time: &lt;1ms</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleCopy}
            disabled={!outputText}
            variant="outline"
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Result
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!outputText}
            variant="outline"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}