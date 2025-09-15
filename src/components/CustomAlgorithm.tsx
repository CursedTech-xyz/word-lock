import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Code, Play, Save, Trash2, BookOpen, Lightbulb, Cpu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CustomAlgorithmProps {}

interface SavedAlgorithm {
  id: string;
  name: string;
  description: string;
  encryptCode: string;
  decryptCode: string;
  created: string;
}

const algorithmTemplates = {
  substitution: {
    name: 'Simple Substitution Cipher',
    description: 'Replace each letter with another letter',
    encryptCode: `// Simple substitution cipher
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const key = 'ZYXWVUTSRQPONMLKJIHGFEDCBA'; // Reverse alphabet

let result = '';
for (let i = 0; i < text.length; i++) {
  const char = text[i].toUpperCase();
  const index = alphabet.indexOf(char);
  if (index !== -1) {
    result += key[index];
  } else {
    result += text[i]; // Keep non-alphabetic characters
  }
}
return result;`,
    decryptCode: `// Reverse substitution
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const key = 'ZYXWVUTSRQPONMLKJIHGFEDCBA';

let result = '';
for (let i = 0; i < text.length; i++) {
  const char = text[i].toUpperCase();
  const index = key.indexOf(char);
  if (index !== -1) {
    result += alphabet[index];
  } else {
    result += text[i];
  }
}
return result;`
  },
  vigenere: {
    name: 'Vigenère Cipher',
    description: 'Polyalphabetic substitution using a keyword',
    encryptCode: `// Vigenère cipher encryption
const keyword = (parameters.keyword || 'KEY').toUpperCase();
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

let result = '';
let keyIndex = 0;

for (let i = 0; i < text.length; i++) {
  const char = text[i].toUpperCase();
  const charIndex = alphabet.indexOf(char);
  
  if (charIndex !== -1) {
    const keyChar = keyword[keyIndex % keyword.length];
    const keyShift = alphabet.indexOf(keyChar);
    const newIndex = (charIndex + keyShift) % 26;
    result += alphabet[newIndex];
    keyIndex++;
  } else {
    result += text[i];
  }
}
return result;`,
    decryptCode: `// Vigenère cipher decryption
const keyword = (parameters.keyword || 'KEY').toUpperCase();
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

let result = '';
let keyIndex = 0;

for (let i = 0; i < text.length; i++) {
  const char = text[i].toUpperCase();
  const charIndex = alphabet.indexOf(char);
  
  if (charIndex !== -1) {
    const keyChar = keyword[keyIndex % keyword.length];
    const keyShift = alphabet.indexOf(keyChar);
    const newIndex = (charIndex - keyShift + 26) % 26;
    result += alphabet[newIndex];
    keyIndex++;
  } else {
    result += text[i];
  }
}
return result;`
  },
  atbash: {
    name: 'Atbash Cipher',
    description: 'Ancient Hebrew cipher (A=Z, B=Y, etc.)',
    encryptCode: `// Atbash cipher - same for encrypt and decrypt
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

let result = '';
for (let i = 0; i < text.length; i++) {
  const char = text[i].toUpperCase();
  const index = alphabet.indexOf(char);
  if (index !== -1) {
    // Mirror the alphabet (A=Z, B=Y, etc.)
    result += alphabet[25 - index];
  } else {
    result += text[i];
  }
}
return result;`,
    decryptCode: `// Atbash is symmetric - same code for decryption
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

let result = '';
for (let i = 0; i < text.length; i++) {
  const char = text[i].toUpperCase();
  const index = alphabet.indexOf(char);
  if (index !== -1) {
    result += alphabet[25 - index];
  } else {
    result += text[i];
  }
}
return result;`
  }
};

export function CustomAlgorithm() {
  const [activeTab, setActiveTab] = useState('builder');
  const [algorithmName, setAlgorithmName] = useState('');
  const [algorithmDescription, setAlgorithmDescription] = useState('');
  const [encryptCode, setEncryptCode] = useState('');
  const [decryptCode, setDecryptCode] = useState('');
  const [testInput, setTestInput] = useState('Hello World');
  const [testOutput, setTestOutput] = useState('');
  const [testMode, setTestMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [parameters, setParameters] = useState('{}');
  const [savedAlgorithms, setSavedAlgorithms] = useState<SavedAlgorithm[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const loadTemplate = (templateKey: keyof typeof algorithmTemplates) => {
    const template = algorithmTemplates[templateKey];
    setAlgorithmName(template.name);
    setAlgorithmDescription(template.description);
    setEncryptCode(template.encryptCode);
    setDecryptCode(template.decryptCode);
    
    toast({
      title: "Template Loaded",
      description: `Loaded ${template.name} template successfully.`,
    });
  };

  const executeCustomCode = () => {
    const code = testMode === 'encrypt' ? encryptCode : decryptCode;
    const text = testInput;
    
    if (!code.trim()) {
      toast({
        title: "No Code",
        description: "Please enter encryption/decryption code first.",
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);
    
    try {
      // Parse parameters
      let parsedParams = {};
      try {
        parsedParams = JSON.parse(parameters);
      } catch {
        parsedParams = {};
      }

      // Create a safe execution environment
      const executeCode = new Function('text', 'parameters', `
        "use strict";
        ${code}
      `);
      
      const result = executeCode(text, parsedParams);
      setTestOutput(result || '');
      
      toast({
        title: "Code Executed",
        description: `${testMode === 'encrypt' ? 'Encryption' : 'Decryption'} completed successfully.`,
      });
    } catch (error) {
      setTestOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Execution Error",
        description: "Failed to execute the algorithm code. Check your syntax.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const saveAlgorithm = () => {
    if (!algorithmName.trim() || !encryptCode.trim() || !decryptCode.trim()) {
      toast({
        title: "Incomplete Algorithm",
        description: "Please provide name, encrypt code, and decrypt code.",
        variant: "destructive",
      });
      return;
    }

    const newAlgorithm: SavedAlgorithm = {
      id: Date.now().toString(),
      name: algorithmName,
      description: algorithmDescription,
      encryptCode,
      decryptCode,
      created: new Date().toISOString()
    };

    const updated = [...savedAlgorithms, newAlgorithm];
    setSavedAlgorithms(updated);
    localStorage.setItem('custom-algorithms', JSON.stringify(updated));
    
    toast({
      title: "Algorithm Saved",
      description: `${algorithmName} has been saved successfully.`,
    });
  };

  const loadAlgorithm = (algorithm: SavedAlgorithm) => {
    setAlgorithmName(algorithm.name);
    setAlgorithmDescription(algorithm.description);
    setEncryptCode(algorithm.encryptCode);
    setDecryptCode(algorithm.decryptCode);
    setActiveTab('builder');
    
    toast({
      title: "Algorithm Loaded",
      description: `Loaded ${algorithm.name} from saved algorithms.`,
    });
  };

  const deleteAlgorithm = (id: string) => {
    const updated = savedAlgorithms.filter(alg => alg.id !== id);
    setSavedAlgorithms(updated);
    localStorage.setItem('custom-algorithms', JSON.stringify(updated));
    
    toast({
      title: "Algorithm Deleted",
      description: "Algorithm has been removed from saved list.",
    });
  };

  // Load saved algorithms on component mount
  useState(() => {
    const saved = localStorage.getItem('custom-algorithms');
    if (saved) {
      try {
        setSavedAlgorithms(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved algorithms:', error);
      }
    }
  });

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Custom Algorithm Builder
            <Badge className="bg-orange-500/20 text-orange-300">Educational</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Create and test your own encryption algorithms using JavaScript
          </p>
        </CardHeader>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <strong>Educational Purpose:</strong> Custom algorithms are for learning and experimentation. 
          For real security needs, use established cryptographic standards like AES-256 or RSA.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 glass-card">
          <TabsTrigger value="builder" className="data-[state=active]:bg-primary/20">
            <Code className="w-4 h-4 mr-2" />
            Algorithm Builder
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-secondary/20">
            <BookOpen className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-accent/20">
            <Save className="w-4 h-4 mr-2" />
            Saved Algorithms
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Algorithm Definition */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Algorithm Definition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="algName">Algorithm Name</Label>
                  <Input
                    id="algName"
                    value={algorithmName}
                    onChange={(e) => setAlgorithmName(e.target.value)}
                    placeholder="e.g. My Custom Cipher"
                    className="monaco-editor"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="algDescription">Description</Label>
                  <Textarea
                    id="algDescription"
                    value={algorithmDescription}
                    onChange={(e) => setAlgorithmDescription(e.target.value)}
                    placeholder="Brief description of your algorithm..."
                    className="monaco-editor"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="encryptCode">Encryption Code</Label>
                  <Textarea
                    id="encryptCode"
                    value={encryptCode}
                    onChange={(e) => setEncryptCode(e.target.value)}
                    placeholder="// Enter your encryption logic here
// Available variables: text, parameters
// Return the encrypted result"
                    className="monaco-editor font-mono text-sm"
                    rows={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decryptCode">Decryption Code</Label>
                  <Textarea
                    id="decryptCode"
                    value={decryptCode}
                    onChange={(e) => setDecryptCode(e.target.value)}
                    placeholder="// Enter your decryption logic here
// Available variables: text, parameters
// Return the decrypted result"
                    className="monaco-editor font-mono text-sm"
                    rows={8}
                  />
                </div>

                <Button
                  onClick={saveAlgorithm}
                  className="w-full premium-button"
                  disabled={!algorithmName.trim() || !encryptCode.trim() || !decryptCode.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Algorithm
                </Button>
              </CardContent>
            </Card>

            {/* Testing Panel */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Test Your Algorithm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testMode">Test Mode</Label>
                  <Select value={testMode} onValueChange={(value) => setTestMode(value as 'encrypt' | 'decrypt')}>
                    <SelectTrigger className="monaco-editor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="encrypt">Encrypt</SelectItem>
                      <SelectItem value="decrypt">Decrypt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parameters">Parameters (JSON)</Label>
                  <Input
                    id="parameters"
                    value={parameters}
                    onChange={(e) => setParameters(e.target.value)}
                    placeholder='{"keyword": "SECRET", "shift": 5}'
                    className="monaco-editor font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testInput">Test Input</Label>
                  <Textarea
                    id="testInput"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Enter text to test..."
                    className="monaco-editor"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={executeCustomCode}
                  disabled={isExecuting}
                  className="w-full premium-button-secondary"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isExecuting ? 'Executing...' : `Test ${testMode === 'encrypt' ? 'Encryption' : 'Decryption'}`}
                </Button>

                <div className="space-y-2">
                  <Label htmlFor="testOutput">Test Output</Label>
                  <Textarea
                    id="testOutput"
                    value={testOutput}
                    readOnly
                    className="monaco-editor"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(algorithmTemplates).map(([key, template]) => (
              <Card key={key} className="glass-card">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>
                  <Button
                    onClick={() => loadTemplate(key as keyof typeof algorithmTemplates)}
                    variant="outline"
                    className="w-full"
                  >
                    Load Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="saved">
          {savedAlgorithms.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Cpu className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Saved Algorithms</h3>
                <p className="text-muted-foreground">
                  Create and save your first custom algorithm to see it here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedAlgorithms.map((algorithm) => (
                <Card key={algorithm.id} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{algorithm.name}</h3>
                      <Button
                        onClick={() => deleteAlgorithm(algorithm.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {algorithm.description || 'No description provided'}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Created: {new Date(algorithm.created).toLocaleDateString()}
                    </p>
                    <Button
                      onClick={() => loadAlgorithm(algorithm)}
                      variant="outline"
                      className="w-full"
                    >
                      Load Algorithm
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}