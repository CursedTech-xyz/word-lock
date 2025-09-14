import { Shield, Github, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Header() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    // For now, we'll keep the dark theme as default since our design is built for it
  };

  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-lg"></div>
              <div className="relative bg-gradient-to-br from-primary to-primary-glow p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">SecureText</h1>
              <p className="text-xs text-muted-foreground">Encrypt & Decrypt Tool</p>
            </div>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="rounded-full w-9 h-9 p-0"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full w-9 h-9 p-0"
              asChild
            >
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="View on GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Secure, client-side text encryption and decryption using multiple algorithms. 
            All processing happens locally in your browser for maximum privacy.
          </p>
        </div>
      </div>
    </header>
  );
}
