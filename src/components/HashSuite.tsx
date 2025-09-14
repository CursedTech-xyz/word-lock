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
import { hashSHA256, hashSHA512, hashMD5, generateHMAC } from '@/lib/crypto';
import { Hash, Copy, CheckCircle, XCircle, Shield, Key } from 'lucide-react';

type HashAlgorithm = 'sha256' | 'sha512' | 'md5' | 'hmac';

interface HashResult {
  algorithm: HashAlgorithm;
  input: string;
  output: string;
  timestamp: string;
}

export const HashSuite = () => {
  const [inputText, setInputText] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<HashAlgorithm>('sha256');
  const [hmacSecret, setHmacSecret] = useState('');
  const [hashResult, setHashResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hashHistory, setHashHistory] = useState<HashResult[]>([]);
  const [verificationHash, setVerificationHash] = useState('');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const { toast } = useToast();

  const algorithms = [
    {
      id: 'sha256' as const,
      name: 'SHA-256',
      description: 'Secure Hash Algorithm 256-bit',
      security: 'High',
      color: 'text-green-600'
    },
    {
      id: 'sha512' as const,
      name: 'SHA-512',
      description: 'Secure Hash Algorithm 512-bit',
      security: 'Very High',
      color: 'text-emerald-600'
    },
    {
      id: 'md5' as const,
      name: 'MD5',
      description: 'Message Digest 5 (Legacy)',
      security: 'Low',
      color: 'text-orange-600'
    },
    {
      id: 'hmac' as const,
      name: 'HMAC-SHA256',
      description: 'Hash-based Message Authentication Code',
      security: 'High',
      color: 'text-blue-600'
    }
  ];

  const processHash = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter text to hash.",
        variant: "destructive",
      });
      return;
    }

    if (selectedAlgorithm === 'hmac' && !hmacSecret.trim()) {
      toast({
        title: "Secret Required",
        description: "HMAC requires a secret key.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      let result = '';
      
      switch (selectedAlgorithm) {
        case 'sha256':
          result = await hashSHA256(inputText);
          break;
        case 'sha512':
          result = await hashSHA512(inputText);
          break;
        case 'md5':
          result = hashMD5(inputText);
          break;
        case 'hmac':
          result = await generateHMAC(inputText, hmacSecret);
          break;
      }
      
      setHashResult(result);
      
      // Add to history
      const newResult: HashResult = {
        algorithm: selectedAlgorithm,
        input: inputText.substring(0, 100) + (inputText.length > 100 ? '...' : ''),
        output: result,
        timestamp: new Date().toISOString()
      };
      
      setHashHistory(prev => [newResult, ...prev.slice(0, 9)]); // Keep last 10 results
      
      toast({
        title: "Hash Generated",
        description: `${algorithms.find(a => a.id === selectedAlgorithm)?.name} hash created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Hash Generation Failed",
        description: "An error occurred while generating the hash.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Hash value copied successfully.",
    });
  };

  const handleClear = () => {
    setInputText('');
    setHashResult('');
    setHmacSecret('');
    setVerificationHash('');
    setVerificationResult(null);
  };

  const verifyHash = () => {
    if (!hashResult || !verificationHash) {
      setVerificationResult(null);
      return;
    }
    
    const isMatch = hashResult.toLowerCase() === verificationHash.toLowerCase().trim();
    setVerificationResult(isMatch);
  };

  useEffect(() => {
    verifyHash();
  }, [hashResult, verificationHash]);

  useEffect(() => {
    if (inputText.trim()) {
      const debounceTimer = setTimeout(() => {
        processHash();
      }, 500);
      
      return () => clearTimeout(debounceTimer);
    } else {
      setHashResult('');
    }
  }, [inputText, selectedAlgorithm, hmacSecret]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSecurityBadgeVariant = (security: string) => {
    switch (security) {
      case 'Low': return 'destructive';
      case 'High': return 'default';
      case 'Very High': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hash Generation */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-primary" />
            Hash Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="algorithm">Hash Algorithm</Label>
            <Select value={selectedAlgorithm} onValueChange={(value) => setSelectedAlgorithm(value as HashAlgorithm)}>
              <SelectTrigger id="algorithm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {algorithms.map((algorithm) => (
                  <SelectItem key={algorithm.id} value={algorithm.id}>
                    <div className="flex items-center gap-2">
                      <span>{algorithm.name}</span>
                      <Badge variant={getSecurityBadgeVariant(algorithm.security)} className="text-xs">
                        {algorithm.security}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {algorithms.find(a => a.id === selectedAlgorithm)?.description}
            </p>
          </div>

          {selectedAlgorithm === 'hmac' && (
            <div>
              <Label htmlFor="hmacSecret">HMAC Secret Key</Label>
              <Input
                id="hmacSecret"
                type="password"
                placeholder="Enter secret key for HMAC..."
                value={hmacSecret}
                onChange={(e) => setHmacSecret(e.target.value)}
                className="font-mono"
              />
            </div>
          )}

          <div>
            <Label htmlFor="inputText">Input Text</Label>
            <Textarea
              id="inputText"
              placeholder="Enter text to hash..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] font-mono"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-muted-foreground">
                {inputText.length} characters
              </p>
              {isProcessing && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin" />
                  Processing...
                </div>
              )}
            </div>
          </div>

          {hashResult && (
            <div>
              <Label htmlFor="hashResult">Hash Result</Label>
              <div className="relative">
                <Textarea
                  id="hashResult"
                  value={hashResult}
                  readOnly
                  className="font-mono text-sm pr-12"
                  rows={3}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(hashResult)}
                  className="absolute top-2 right-2"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {hashResult.length} characters • {algorithms.find(a => a.id === selectedAlgorithm)?.name}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={processHash} disabled={isProcessing || !inputText.trim()}>
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Hash className="w-4 h-4 mr-2" />
                  Generate Hash
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hash Verification */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-secondary" />
            Hash Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="verificationHash">Expected Hash</Label>
            <div className="relative">
              <Input
                id="verificationHash"
                placeholder="Paste hash to verify against..."
                value={verificationHash}
                onChange={(e) => setVerificationHash(e.target.value)}
                className="font-mono pr-12"
              />
              {verificationResult !== null && (
                <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                  {verificationResult ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              )}
            </div>
            {verificationResult !== null && (
              <p className={`text-xs mt-1 ${verificationResult ? 'text-green-600' : 'text-red-600'}`}>
                {verificationResult ? 'Hash verification successful' : 'Hash verification failed'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hash History */}
      {hashHistory.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-accent" />
              Recent Hashes ({hashHistory.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hashHistory.map((result, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {algorithms.find(a => a.id === result.algorithm)?.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(result.timestamp)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(result.output)}
                      className="h-6 px-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    <div>
                      <Label className="text-xs">Input</Label>
                      <p className="text-xs font-mono bg-muted/50 rounded p-1 break-all">
                        {result.input}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs">Hash</Label>
                      <p className="text-xs font-mono bg-muted/50 rounded p-1 break-all">
                        {result.output}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};