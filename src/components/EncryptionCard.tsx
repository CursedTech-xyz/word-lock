import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, RotateCcw, Shield, Key, Hash, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EncryptionCardProps {
  mode: 'encrypt' | 'decrypt';
  onModeChange: (mode: 'encrypt' | 'decrypt') => void;
}

const algorithms = [
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
  const [algorithm, setAlgorithm] = useState('caesar');
  const [caesarShift, setCaesarShift] = useState(3);
  const [xorPassword, setXorPassword] = useState('');
  const { toast } = useToast();

  const selectedAlgorithm = algorithms.find(a => a.id === algorithm);

  // Encryption/Decryption functions
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

  const processText = () => {
    if (!inputText.trim()) {
      setOutputText('');
      return;
    }

    let result = '';
    const isDecrypt = mode === 'decrypt';

    switch (algorithm) {
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
  };

  // Auto-process when inputs change
  useEffect(() => {
    const timeoutId = setTimeout(processText, 300);
    return () => clearTimeout(timeoutId);
  }, [inputText, algorithm, caesarShift, xorPassword, mode]);

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
              <Shield className="w-4 h-4 mr-2" />
              Encrypt
            </Button>
            <Button
              variant={mode === 'decrypt' ? 'default' : 'outline'}
              onClick={() => onModeChange('decrypt')}
              className={mode === 'decrypt' ? 'premium-button-secondary' : ''}
            >
              <Key className="w-4 h-4 mr-2" />
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
              className="monaco-editor"
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
          <Textarea
            id="output"
            value={outputText}
            readOnly
            className="monaco-editor min-h-[120px] resize-none"
            rows={6}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{outputText.length} characters</span>
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