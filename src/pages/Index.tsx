import { useState } from "react";
import { Shield, Key, Hash, Image, Code, FileText, Upload, Info, HelpCircle, Activity, Settings as SettingsIcon, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { EncryptionCard } from "@/components/EncryptionCard";
import { KeyManager } from "@/components/KeyManager";
import { HashSuite } from "@/components/HashSuite";
import { Steganography } from "@/components/Steganography";
import { CustomAlgorithm } from "@/components/CustomAlgorithm";
import { AdvancedFileHandler } from "@/components/AdvancedFileHandler";
import { FileUpload } from "@/components/FileUpload";
import { AlgorithmInfo } from "@/components/AlgorithmInfo";
import { HelpSystem } from "@/components/HelpSystem";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { Settings } from "@/components/Settings";
import { HybridEncryption } from "@/components/HybridEncryption";

const Index = () => {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [fileContent, setFileContent] = useState('');
  const [activeTab, setActiveTab] = useState('encrypt');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text leading-tight">
            SecureText Pro
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional-grade encryption and security tools built with modern cryptography. 
            Protect your data with military-grade algorithms, all running securely in your browser.
          </p>
        </div>

        {/* Main Tools */}
        <div className="w-full">
          {activeTab === 'encrypt' && (
            <EncryptionCard mode={mode} onModeChange={setMode} />
          )}
          {activeTab === 'hybrid' && (
            <HybridEncryption />
          )}
          {activeTab === 'keys' && (
            <KeyManager />
          )}
          {activeTab === 'hash' && (
            <HashSuite />
          )}
          {activeTab === 'steganography' && (
            <Steganography />
          )}
          {activeTab === 'custom' && (
            <CustomAlgorithm />
          )}
          {activeTab === 'advanced' && (
            <AdvancedFileHandler />
          )}
          {activeTab === 'upload' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <FileUpload onFileContent={setFileContent} />
              {fileContent && (
                <Card>
                  <CardHeader>
                    <CardTitle>File Preview</CardTitle>
                    <CardDescription>Preview of uploaded file content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-64 overflow-y-auto p-4 bg-muted/30 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap break-words">
                        {fileContent.slice(0, 1000)}
                        {fileContent.length > 1000 && '...'}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          {activeTab === 'algorithms' && (
            <AlgorithmInfo />
          )}
          {activeTab === 'help' && (
            <HelpSystem />
          )}
          {activeTab === 'performance' && (
            <PerformanceMonitor />
          )}
          {activeTab === 'settings' && (
            <Settings />
          )}
        </div>

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
                AES-256, RSA, hybrid encryption, steganography, custom algorithms, and more.
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
      </main>
    </div>
  );
};

export default Index;