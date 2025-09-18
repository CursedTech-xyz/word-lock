import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EncryptionCard } from '@/components/EncryptionCard';
import { HybridEncryption } from '@/components/HybridEncryption';
import { HashSuite } from '@/components/HashSuite';
import { Steganography } from '@/components/Steganography';
import { CustomAlgorithm } from '@/components/CustomAlgorithm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Layers, Hash, Image, Code, Zap } from 'lucide-react';

export default function EncryptionStudio() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const tool = searchParams.get('tool') || 'standard';

  const tools = [
    {
      id: 'standard',
      label: 'Standard Encryption',
      description: 'AES, RSA, and modern ciphers',
      icon: Shield,
      badge: 'Popular'
    },
    {
      id: 'hybrid',
      label: 'Hybrid Encryption',
      description: 'RSA + AES combined security',
      icon: Layers,
      badge: 'Advanced'
    },
    {
      id: 'hash',
      label: 'Hash Functions',
      description: 'SHA, MD5, and integrity checks',
      icon: Hash,
      badge: 'Verification'
    },
    {
      id: 'steganography',
      label: 'Steganography',
      description: 'Hide messages in images',
      icon: Image,
      badge: 'Covert'
    },
    {
      id: 'custom',
      label: 'Custom Algorithm',
      description: 'Design your own cipher',
      icon: Code,
      badge: 'Experimental'
    }
  ];

  const handleToolChange = (newTool: string) => {
    setSearchParams({ tool: newTool });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Encryption Studio</h1>
            <p className="text-muted-foreground">Professional-grade encryption tools and algorithms</p>
          </div>
        </div>
      </div>

      {/* Tool Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Encryption Tools
          </CardTitle>
          <CardDescription>Choose your encryption method and algorithm</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tool} onValueChange={handleToolChange}>
            <TabsList className="grid w-full grid-cols-5">
              {tools.map((toolItem) => (
                <TabsTrigger key={toolItem.id} value={toolItem.id} className="data-[state=active]:bg-primary/10">
                  <div className="flex items-center gap-2">
                    <toolItem.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{toolItem.label}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tool Info */}
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                {React.createElement(tools.find(t => t.id === tool)?.icon || Shield, { 
                  className: "w-5 h-5 text-primary" 
                })}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{tools.find(t => t.id === tool)?.label}</h3>
                    <Badge variant="secondary">{tools.find(t => t.id === tool)?.badge}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tools.find(t => t.id === tool)?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Tool Content */}
            <div className="mt-6">
              <TabsContent value="standard">
                <EncryptionCard mode={mode} onModeChange={setMode} />
              </TabsContent>

              <TabsContent value="hybrid">
                <HybridEncryption />
              </TabsContent>

              <TabsContent value="hash">
                <HashSuite />
              </TabsContent>

              <TabsContent value="steganography">
                <Steganography />
              </TabsContent>

              <TabsContent value="custom">
                <CustomAlgorithm />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}