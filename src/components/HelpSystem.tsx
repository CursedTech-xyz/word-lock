import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  HelpCircle, Book, Keyboard, Shield, Zap, Users, 
  Globe, Accessibility, Search, Play, ChevronRight,
  CheckCircle, ArrowRight, Lightbulb, Star, Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: string[];
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

const tutorials: Tutorial[] = [
  {
    id: 'basic-encryption',
    title: 'Your First Encryption',
    description: 'Learn how to encrypt your first message using AES-256',
    steps: [
      'Navigate to the Encrypt/Decrypt tab',
      'Select AES-256 from the algorithm dropdown',
      'Enter a strong password (minimum 12 characters)',
      'Type your secret message in the input area',
      'Watch the encrypted result appear automatically',
      'Copy the encrypted text to share securely'
    ],
    duration: '3 min',
    difficulty: 'beginner',
    category: 'Getting Started'
  },
  {
    id: 'rsa-keys',
    title: 'RSA Key Management',
    description: 'Generate and manage RSA key pairs for asymmetric encryption',
    steps: [
      'Go to the Key Manager tab',
      'Click "Generate New Key Pair"',
      'Choose your key size (2048 or 4096 bits)',
      'Save your keys securely',
      'Share your public key with others',
      'Keep your private key secret and secure'
    ],
    duration: '5 min',
    difficulty: 'intermediate',
    category: 'Key Management'
  },
  {
    id: 'steganography-guide',
    title: 'Hide Messages in Images',
    description: 'Use steganography to hide secret messages inside images',
    steps: [
      'Open the Steganography tab',
      'Upload an image (PNG or JPG)',
      'Enter your secret message',
      'Add password protection (optional)',
      'Click "Hide Text in Image"',
      'Download the processed image',
      'Share the image - your message is hidden inside!'
    ],
    duration: '4 min',
    difficulty: 'intermediate',
    category: 'Advanced Features'
  },
  {
    id: 'custom-algorithm',
    title: 'Build Custom Algorithms',
    description: 'Create your own encryption algorithms for educational purposes',
    steps: [
      'Navigate to Custom Algorithm tab',
      'Choose a template or start from scratch',
      'Write your encryption logic in JavaScript',
      'Write the corresponding decryption logic',
      'Test your algorithm with sample text',
      'Save your algorithm for future use'
    ],
    duration: '10 min',
    difficulty: 'advanced',
    category: 'Educational'
  }
];

const faqs: FAQ[] = [
  {
    id: 'security-local',
    question: 'Is my data secure? Where is it processed?',
    answer: 'All encryption and decryption happens locally in your browser. Your data never leaves your device and is never sent to any servers. This ensures maximum privacy and security.',
    category: 'Security',
    helpful: 245
  },
  {
    id: 'algorithms-difference',
    question: 'Which encryption algorithm should I use?',
    answer: 'For real security: use AES-256 or RSA. For learning: try Caesar cipher or custom algorithms. For encoding (not encryption): use Base64. AES-256 is recommended for most secure communications.',
    category: 'Algorithms',
    helpful: 189
  },
  {
    id: 'password-strength',
    question: 'How do I create a strong password?',
    answer: 'Use at least 12 characters with a mix of uppercase, lowercase, numbers, and symbols. Avoid dictionary words and personal information. The app shows password strength in real-time to guide you.',
    category: 'Security',
    helpful: 156
  },
  {
    id: 'file-formats',
    question: 'What file formats are supported?',
    answer: 'Text files (.txt, .md, .json), code files (.js, .py, .html), and config files (.yml, .ini). For steganography, we support PNG, JPG, and other image formats.',
    category: 'Files',
    helpful: 134
  },
  {
    id: 'rsa-vs-aes',
    question: 'What\'s the difference between RSA and AES encryption?',
    answer: 'AES is symmetric (same key for encrypt/decrypt), faster for large data. RSA is asymmetric (public/private keys), perfect for sharing encrypted messages with others without sharing passwords.',
    category: 'Algorithms',
    helpful: 198
  }
];

const keyboardShortcuts = [
  { keys: ['Ctrl', 'Enter'], action: 'Process encryption/decryption' },
  { keys: ['Ctrl', 'C'], action: 'Copy result to clipboard' },
  { keys: ['Ctrl', 'Shift', 'C'], action: 'Clear all inputs' },
  { keys: ['Tab'], action: 'Navigate between algorithm tabs' },
  { keys: ['Escape'], action: 'Close modals and dropdowns' },
  { keys: ['Ctrl', '1-8'], action: 'Switch between main tabs' },
];

export function HelpSystem() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);
  const { toast } = useToast();

  const categories = ['all', 'Getting Started', 'Security', 'Algorithms', 'Files', 'Key Management', 'Advanced Features', 'Educational'];

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesCategory = activeCategory === 'all' || tutorial.category === activeCategory;
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const startTutorial = (tutorial: Tutorial) => {
    setCurrentTutorial(tutorial);
    setTutorialStep(0);
    toast({
      title: "Tutorial Started",
      description: `Starting "${tutorial.title}" tutorial`,
    });
  };

  const nextTutorialStep = () => {
    if (!currentTutorial) return;
    
    if (tutorialStep < currentTutorial.steps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      completeTutorial();
    }
  };

  const completeTutorial = () => {
    if (!currentTutorial) return;
    
    const updated = [...completedTutorials, currentTutorial.id];
    setCompletedTutorials(updated);
    localStorage.setItem('completed-tutorials', JSON.stringify(updated));
    
    setCurrentTutorial(null);
    setTutorialStep(0);
    
    toast({
      title: "Tutorial Complete! 🎉",
      description: `You've completed "${currentTutorial.title}"`,
    });
  };

  const markFAQHelpful = (faqId: string) => {
    toast({
      title: "Thanks for the feedback!",
      description: "Your feedback helps improve our documentation.",
    });
  };

  // Load completed tutorials on mount
  useEffect(() => {
    const saved = localStorage.getItem('completed-tutorials');
    if (saved) {
      try {
        setCompletedTutorials(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load completed tutorials:', error);
      }
    }
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-300';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300';
      case 'advanced': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Help & Documentation
            <Badge className="bg-indigo-500/20 text-indigo-300">Interactive</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Learn to use SecureText with interactive tutorials, comprehensive guides, and instant help
          </p>
        </CardHeader>
      </Card>

      {/* Search and Filter */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tutorials, FAQs, and guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 monaco-editor"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Tutorial */}
      {currentTutorial && (
        <Card className="glass-card border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                {currentTutorial.title}
              </span>
              <Badge className={getDifficultyColor(currentTutorial.difficulty)}>
                {currentTutorial.difficulty}
              </Badge>
            </CardTitle>
            <Progress 
              value={((tutorialStep + 1) / currentTutorial.steps.length) * 100} 
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Step {tutorialStep + 1} of {currentTutorial.steps.length}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/20 rounded-lg">
              <p className="font-medium mb-2">Current Step:</p>
              <p className="text-sm">{currentTutorial.steps[tutorialStep]}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={nextTutorialStep} className="premium-button">
                {tutorialStep < currentTutorial.steps.length - 1 ? (
                  <>Next Step <ArrowRight className="w-4 h-4 ml-2" /></>
                ) : (
                  <>Complete <CheckCircle className="w-4 h-4 ml-2" /></>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentTutorial(null)}
              >
                Exit Tutorial
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="tutorials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 glass-card">
          <TabsTrigger value="tutorials" className="data-[state=active]:bg-primary/20">
            <Book className="w-4 h-4 mr-2" />
            Tutorials
          </TabsTrigger>
          <TabsTrigger value="faq" className="data-[state=active]:bg-secondary/20">
            <HelpCircle className="w-4 h-4 mr-2" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="shortcuts" className="data-[state=active]:bg-accent/20">
            <Keyboard className="w-4 h-4 mr-2" />
            Shortcuts
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="data-[state=active]:bg-violet/20">
            <Accessibility className="w-4 h-4 mr-2" />
            Accessibility
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tutorials">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTutorials.map((tutorial) => (
              <Card key={tutorial.id} className="glass-card hover-scale">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 flex items-center gap-2">
                        {tutorial.title}
                        {completedTutorials.includes(tutorial.id) && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {tutorial.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-2">
                      <Badge className={getDifficultyColor(tutorial.difficulty)}>
                        {tutorial.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {tutorial.duration}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => startTutorial(tutorial)}
                    className="w-full"
                    variant={completedTutorials.includes(tutorial.id) ? "outline" : "default"}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {completedTutorials.includes(tutorial.id) ? 'Restart Tutorial' : 'Start Tutorial'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="faq">
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <Card key={faq.id} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm pr-4">{faq.question}</h3>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {faq.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {faq.answer}
                  </p>
                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markFAQHelpful(faq.id)}
                      className="text-xs"
                    >
                      👍 Helpful ({faq.helpful})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shortcuts">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
              <p className="text-sm text-muted-foreground">
                Speed up your workflow with these keyboard shortcuts
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {keyboardShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <span className="text-sm">{shortcut.action}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex}>
                          <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility">
          <div className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Accessibility className="w-5 h-5" />
                  Accessibility Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Keyboard className="w-4 h-4" />
                      Keyboard Navigation
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Full keyboard navigation support</li>
                      <li>• Tab through all interactive elements</li>
                      <li>• Escape to close modals and dropdowns</li>
                      <li>• Arrow keys for menu navigation</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Visual Accessibility
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• High contrast mode compatible</li>
                      <li>• Screen reader optimized</li>
                      <li>• Focus indicators on all controls</li>
                      <li>• Semantic HTML structure</li>
                    </ul>
                  </div>
                </div>

                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tip:</strong> Use your browser's accessibility settings to adjust text size, 
                    contrast, and other visual preferences. This app respects your system preferences.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Privacy & Security Notice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Local Processing</h4>
                      <p className="text-sm text-muted-foreground">
                        All encryption happens in your browser. No data is sent to external servers.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">No User Tracking</h4>
                      <p className="text-sm text-muted-foreground">
                        We don't collect personal data or track your usage.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Open Source</h4>
                      <p className="text-sm text-muted-foreground">
                        The encryption algorithms used are industry-standard and open for audit.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}