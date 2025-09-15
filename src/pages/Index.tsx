import { useState } from 'react';
import { Header } from '@/components/Header';
import { EncryptionCard } from '@/components/EncryptionCard';
import { AlgorithmInfo } from '@/components/AlgorithmInfo';
import { FileUpload } from '@/components/FileUpload';
import { KeyManager } from '@/components/KeyManager';
import { HashSuite } from '@/components/HashSuite';
import { Steganography } from '@/components/Steganography';
import { CustomAlgorithm } from '@/components/CustomAlgorithm';
import { AdvancedFileHandler } from '@/components/AdvancedFileHandler';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Key, Info, Upload, Hash, Settings, Image, Code, Folder } from 'lucide-react';

const Index = () => {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [fileContent, setFileContent] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary-glow">
              <Shield className="w-4 h-4" />
              <span>Client-Side Security</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Professional Text{' '}
              <span className="gradient-text">Encryption</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Secure your messages with multiple encryption algorithms. 
              All processing happens locally for maximum privacy.
            </p>
          </div>

          {/* Main Interface */}
          <Tabs defaultValue="encrypt-decrypt" className="space-y-6">
            <TabsList className="grid w-full max-w-6xl mx-auto grid-cols-4 lg:grid-cols-8 glass-card">
              <TabsTrigger value="encrypt-decrypt" className="data-[state=active]:bg-primary/20">
                <Key className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Encrypt/Decrypt</span>
                <span className="sm:hidden">Encrypt</span>
              </TabsTrigger>
              <TabsTrigger value="key-manager" className="data-[state=active]:bg-primary/20">
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Key Manager</span>
                <span className="sm:hidden">Keys</span>
              </TabsTrigger>
              <TabsTrigger value="hash-suite" className="data-[state=active]:bg-primary/20">
                <Hash className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Hash Suite</span>
                <span className="sm:hidden">Hash</span>
              </TabsTrigger>
              <TabsTrigger value="steganography" className="data-[state=active]:bg-primary/20">
                <Image className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Steganography</span>
                <span className="sm:hidden">Stego</span>
              </TabsTrigger>
              <TabsTrigger value="custom-algorithm" className="data-[state=active]:bg-primary/20">
                <Code className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Custom Algorithm</span>
                <span className="sm:hidden">Custom</span>
              </TabsTrigger>
              <TabsTrigger value="advanced-files" className="data-[state=active]:bg-primary/20">
                <Folder className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Advanced Files</span>
                <span className="sm:hidden">Files</span>
              </TabsTrigger>
              <TabsTrigger value="file-upload" className="data-[state=active]:bg-primary/20">
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">File Upload</span>
                <span className="sm:hidden">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="algorithms" className="data-[state=active]:bg-primary/20">
                <Info className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Algorithms</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="encrypt-decrypt" className="space-y-6">
              <EncryptionCard mode={mode} onModeChange={setMode} />
            </TabsContent>

            <TabsContent value="key-manager" className="space-y-6">
              <KeyManager />
            </TabsContent>

            <TabsContent value="hash-suite" className="space-y-6">
              <HashSuite />
            </TabsContent>

            <TabsContent value="steganography" className="space-y-6">
              <Steganography />
            </TabsContent>

            <TabsContent value="custom-algorithm" className="space-y-6">
              <CustomAlgorithm />
            </TabsContent>

            <TabsContent value="advanced-files" className="space-y-6">
              <AdvancedFileHandler />
            </TabsContent>

            <TabsContent value="file-upload" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FileUpload onFileContent={setFileContent} />
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">File Content Preview</h3>
                    <div className="monaco-editor min-h-[200px] max-h-[300px] overflow-auto">
                      {fileContent ? (
                        <pre className="text-sm whitespace-pre-wrap break-words">
                          {fileContent}
                        </pre>
                      ) : (
                        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                          <div className="text-center">
                            <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Upload a file to see its contents here</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {fileContent && (
                      <div className="mt-4 text-xs text-muted-foreground">
                        {fileContent.length} characters loaded
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="algorithms">
              <AlgorithmInfo />
            </TabsContent>
          </Tabs>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <Card className="glass-card text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Client-Side Processing</h3>
                <p className="text-sm text-muted-foreground">
                  All encryption happens in your browser. Your data never leaves your device.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Key className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">Advanced Algorithms</h3>
                <p className="text-sm text-muted-foreground">
                  AES-256, RSA, steganography, custom algorithms, and more cryptographic tools.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Advanced File Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Batch processing, steganography, multiple formats, and advanced file handling.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
