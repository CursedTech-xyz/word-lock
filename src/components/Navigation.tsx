import { useState } from 'react';
import { 
  Shield, 
  Key, 
  Hash, 
  Image, 
  Code, 
  FileText, 
  Upload, 
  Info, 
  HelpCircle, 
  Activity,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigationItems = [
  { id: 'encrypt', label: 'Encrypt/Decrypt', icon: Shield },
  { id: 'hybrid', label: 'Hybrid Encryption', icon: () => <div className="w-4 h-4 bg-gradient-to-br from-primary to-secondary rounded" /> },
  { id: 'keys', label: 'Key Manager', icon: Key },
  { id: 'hash', label: 'Hash Suite', icon: Hash },
  { id: 'steganography', label: 'Steganography', icon: Image },
  { id: 'custom', label: 'Custom Algorithm', icon: Code },
  { id: 'advanced', label: 'Advanced Files', icon: FileText },
  { id: 'upload', label: 'File Upload', icon: Upload },
  { id: 'algorithms', label: 'Algorithms Info', icon: Info },
  { id: 'help', label: 'Help', icon: HelpCircle },
  { id: 'performance', label: 'Performance', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Menu Button */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold">
            {navigationItems.find(item => item.id === activeTab)?.label || 'SecureText'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-full w-9 h-9 p-0"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h2 className="text-lg font-semibold">Navigation</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full w-9 h-9 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid gap-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        onClick={() => {
                          onTabChange(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                          "flex items-center justify-start gap-3 w-full p-4 text-left rounded-lg transition-all duration-200",
                          isActive 
                            ? "bg-primary/10 text-primary border border-primary/20" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}