import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, Eye, EyeOff, Image, Lock, Unlock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function Steganography() {
  const [mode, setMode] = useState<'hide' | 'reveal'>('hide');
  const [secretText, setSecretText] = useState('');
  const [revealedText, setRevealedText] = useState('');
  const [password, setPassword] = useState('');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // LSB Steganography implementation
  const textToBinary = (text: string): string => {
    return text.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('') + '1111111111111110'; // End marker
  };

  const binaryToText = (binary: string): string => {
    const endMarker = '1111111111111110';
    const endIndex = binary.indexOf(endMarker);
    if (endIndex === -1) return '';
    
    const textBinary = binary.substring(0, endIndex);
    const chars = [];
    for (let i = 0; i < textBinary.length; i += 8) {
      const byte = textBinary.substr(i, 8);
      if (byte.length === 8) {
        chars.push(String.fromCharCode(parseInt(byte, 2)));
      }
    }
    return chars.join('');
  };

  const hideTextInImage = (canvas: HTMLCanvasElement, text: string): void => {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const binary = textToBinary(text);
    let binaryIndex = 0;
    
    for (let i = 0; i < data.length && binaryIndex < binary.length; i += 4) {
      // Use only red channel for simplicity
      if (binaryIndex < binary.length) {
        const bit = parseInt(binary[binaryIndex]);
        data[i] = (data[i] & 0xFE) | bit; // Clear LSB and set new bit
        binaryIndex++;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const revealTextFromImage = (canvas: HTMLCanvasElement): string => {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let binary = '';
    for (let i = 0; i < data.length; i += 4) {
      binary += (data[i] & 1).toString(); // Extract LSB from red channel
    }
    
    return binaryToText(binary);
  };

  const processImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    try {
      const imageUrl = await processImage(file);
      setOriginalImage(imageUrl);
      setProcessedImage(null);
      setRevealedText('');
      
      toast({
        title: "Image Loaded",
        description: `Image loaded successfully (${(file.size / 1024).toFixed(1)} KB)`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to load image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleHideText = () => {
    if (!originalImage || !secretText.trim()) {
      toast({
        title: "Missing Data",
        description: "Please upload an image and enter text to hide.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      
      try {
        const textToHide = password ? btoa(secretText + '|' + password) : secretText;
        hideTextInImage(canvas, textToHide);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setProcessedImage(url);
            setIsProcessing(false);
            
            toast({
              title: "Text Hidden Successfully",
              description: `Hidden ${secretText.length} characters in the image.`,
            });
          }
        }, 'image/png');
      } catch (error) {
        setIsProcessing(false);
        toast({
          title: "Processing Failed",
          description: "Failed to hide text in image.",
          variant: "destructive",
        });
      }
    };
    
    img.src = originalImage;
  };

  const handleRevealText = () => {
    if (!originalImage) {
      toast({
        title: "No Image",
        description: "Please upload an image to reveal hidden text.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      
      try {
        const hiddenText = revealTextFromImage(canvas);
        
        if (hiddenText) {
          if (password) {
            try {
              const decoded = atob(hiddenText);
              const parts = decoded.split('|');
              if (parts.length === 2 && parts[1] === password) {
                setRevealedText(parts[0]);
                toast({
                  title: "Text Revealed",
                  description: "Hidden text extracted successfully.",
                });
              } else {
                setRevealedText('');
                toast({
                  title: "Wrong Password",
                  description: "The password is incorrect or no text was hidden with this password.",
                  variant: "destructive",
                });
              }
            } catch {
              setRevealedText(hiddenText);
              toast({
                title: "Text Revealed",
                description: "Hidden text extracted (no password protection detected).",
              });
            }
          } else {
            setRevealedText(hiddenText);
            toast({
              title: "Text Revealed",
              description: "Hidden text extracted successfully.",
            });
          }
        } else {
          setRevealedText('');
          toast({
            title: "No Hidden Text",
            description: "No hidden text found in this image.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Processing Failed",
          description: "Failed to extract text from image.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };
    
    img.src = originalImage;
  };

  const downloadProcessedImage = () => {
    if (!processedImage) return;
    
    const a = document.createElement('a');
    a.href = processedImage;
    a.download = 'steganography-result.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Image Steganography
            <Badge className="bg-purple-500/20 text-purple-300">Advanced</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Hide secret messages inside images using LSB (Least Significant Bit) technique
          </p>
        </CardHeader>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          All steganography processing happens locally in your browser. Your images and messages never leave your device.
        </AlertDescription>
      </Alert>

      <Tabs value={mode} onValueChange={(value) => setMode(value as 'hide' | 'reveal')}>
        <TabsList className="grid w-full grid-cols-2 glass-card">
          <TabsTrigger value="hide" className="data-[state=active]:bg-primary/20">
            <Lock className="w-4 h-4 mr-2" />
            Hide Text
          </TabsTrigger>
          <TabsTrigger value="reveal" className="data-[state=active]:bg-secondary/20">
            <Unlock className="w-4 h-4 mr-2" />
            Reveal Text
          </TabsTrigger>
        </TabsList>

        <Card className="glass-card">
          <CardContent className="p-6 space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Upload Image</Label>
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {originalImage ? (
                  <div className="space-y-2">
                    <img 
                      src={originalImage} 
                      alt="Original" 
                      className="max-w-full max-h-48 mx-auto rounded-lg"
                    />
                    <p className="text-sm text-muted-foreground">Click to change image</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload an image (PNG, JPG, etc.)
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Password Protection */}
            <div className="space-y-2">
              <Label htmlFor="stegoPassword">Password Protection (Optional)</Label>
              <div className="relative">
                <Input
                  id="stegoPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password to protect hidden text..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            <TabsContent value="hide" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="secretText">Secret Text to Hide</Label>
                <Textarea
                  id="secretText"
                  value={secretText}
                  onChange={(e) => setSecretText(e.target.value)}
                  placeholder="Enter the secret message you want to hide in the image..."
                  className="monaco-editor min-h-[100px]"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {secretText.length} characters • Large images can hide more text
                </p>
              </div>

              <Button 
                onClick={handleHideText}
                disabled={!originalImage || !secretText.trim() || isProcessing}
                className="w-full premium-button"
              >
                {isProcessing ? 'Processing...' : 'Hide Text in Image'}
              </Button>

              {processedImage && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-medium">Processed Image</h4>
                    <img 
                      src={processedImage} 
                      alt="Processed" 
                      className="max-w-full max-h-48 mx-auto rounded-lg"
                    />
                    <Button
                      onClick={downloadProcessedImage}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Image with Hidden Text
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reveal" className="space-y-4 mt-0">
              <Button 
                onClick={handleRevealText}
                disabled={!originalImage || isProcessing}
                className="w-full premium-button-secondary"
              >
                {isProcessing ? 'Processing...' : 'Reveal Hidden Text'}
              </Button>

              {revealedText && (
                <div className="space-y-2">
                  <Label>Revealed Secret Text</Label>
                  <Textarea
                    value={revealedText}
                    readOnly
                    className="monaco-editor min-h-[100px]"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    {revealedText.length} characters revealed
                  </p>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}