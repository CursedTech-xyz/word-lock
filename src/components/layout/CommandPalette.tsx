import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Home, 
  Shield, 
  FileText, 
  Key, 
  BarChart3, 
  GraduationCap, 
  Settings,
  Hash,
  Image,
  Code,
  Upload,
  Info,
  HelpCircle,
  Activity,
  Clock,
  Zap
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  category: string;
  keywords: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const commands: Command[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      description: 'Go to main dashboard',
      icon: Home,
      category: 'Navigation',
      keywords: ['home', 'main', 'overview'],
      action: () => navigate('/'),
    },
    {
      id: 'nav-encrypt',
      label: 'Encryption Studio',
      description: 'Encrypt and decrypt text and files',
      icon: Shield,
      category: 'Navigation',
      keywords: ['encrypt', 'decrypt', 'cipher', 'aes', 'rsa'],
      action: () => navigate('/encrypt'),
    },
    {
      id: 'nav-files',
      label: 'File Laboratory',
      description: 'Advanced file operations and batch processing',
      icon: FileText,
      category: 'Navigation',
      keywords: ['files', 'batch', 'upload', 'process'],
      action: () => navigate('/files'),
    },
    {
      id: 'nav-vault',
      label: 'Key Vault',
      description: 'Manage encryption keys and certificates',
      icon: Key,
      category: 'Navigation',
      keywords: ['keys', 'vault', 'certificates', 'rsa', 'generate'],
      action: () => navigate('/vault'),
    },
    {
      id: 'nav-analysis',
      label: 'Analysis Center',
      description: 'Cryptanalysis and security testing tools',
      icon: BarChart3,
      category: 'Navigation',
      keywords: ['analysis', 'frequency', 'entropy', 'benchmark'],
      action: () => navigate('/analysis'),
    },
    {
      id: 'nav-learn',
      label: 'Learning Hub',
      description: 'Interactive cryptography tutorials',
      icon: GraduationCap,
      category: 'Navigation',
      keywords: ['learn', 'tutorial', 'education', 'course'],
      action: () => navigate('/learn'),
    },
    {
      id: 'nav-settings',
      label: 'Settings',
      description: 'Configure preferences and security',
      icon: Settings,
      category: 'Navigation',
      keywords: ['settings', 'preferences', 'config', 'security'],
      action: () => navigate('/settings'),
    },

    // Quick Actions
    {
      id: 'quick-encrypt-text',
      label: 'Quick Encrypt Text',
      description: 'Encrypt text with default algorithm',
      icon: Zap,
      category: 'Quick Actions',
      keywords: ['encrypt', 'text', 'quick', 'fast'],
      action: () => {
        navigate('/encrypt');
        // TODO: Focus on text input
      },
    },
    {
      id: 'quick-generate-key',
      label: 'Generate RSA Key Pair',
      description: 'Generate new RSA key pair',
      icon: Key,
      category: 'Quick Actions',
      keywords: ['generate', 'key', 'rsa', 'pair'],
      action: () => {
        navigate('/vault');
        // TODO: Trigger key generation
      },
    },
    {
      id: 'quick-hash',
      label: 'Calculate Hash',
      description: 'Calculate SHA-256 hash',
      icon: Hash,
      category: 'Quick Actions',
      keywords: ['hash', 'sha256', 'checksum'],
      action: () => {
        navigate('/encrypt');
        // TODO: Switch to hash tab
      },
    },

    // Tools
    {
      id: 'tool-steganography',
      label: 'Steganography',
      description: 'Hide messages in images',
      icon: Image,
      category: 'Tools',
      keywords: ['steganography', 'hide', 'image', 'secret'],
      action: () => navigate('/encrypt?tool=steganography'),
    },
    {
      id: 'tool-custom-algorithm',
      label: 'Custom Algorithm',
      description: 'Design custom encryption algorithms',
      icon: Code,
      category: 'Tools',
      keywords: ['custom', 'algorithm', 'design', 'code'],
      action: () => navigate('/encrypt?tool=custom'),
    },
  ];

  const filteredCommands = commands.filter(command => {
    const searchLower = search.toLowerCase();
    return (
      command.label.toLowerCase().includes(searchLower) ||
      command.description?.toLowerCase().includes(searchLower) ||
      command.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
    );
  });

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onOpenChange(false);
        setSearch('');
        setSelectedIndex(0);
      }
    }
  };

  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="w-4 h-4 text-muted-foreground mr-3" />
          <Input
            placeholder="Search commands, pages, and tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 text-lg"
            autoFocus
          />
          <Badge variant="outline" className="text-xs">
            ⌘K
          </Badge>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {Object.entries(groupedCommands).map(([category, commands]) => (
            <div key={category} className="mb-4">
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {category}
              </div>
              <div className="space-y-1">
                {commands.map((command, index) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  const Icon = command.icon;
                  
                  return (
                    <button
                      key={command.id}
                      onClick={() => {
                        command.action();
                        onOpenChange(false);
                        setSearch('');
                        setSelectedIndex(0);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                        globalIndex === selectedIndex
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{command.label}</div>
                        {command.description && (
                          <div className="text-sm text-muted-foreground truncate">
                            {command.description}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div>No commands found</div>
              <div className="text-sm">Try searching for something else</div>
            </div>
          )}
        </div>

        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          Use ↑↓ to navigate, ↵ to select, esc to close
        </div>
      </DialogContent>
    </Dialog>
  );
}