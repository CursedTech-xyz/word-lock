import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Shield, 
  FileText, 
  Key, 
  BarChart3, 
  GraduationCap, 
  Settings, 
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
  color?: string;
}

const navigationItems: NavigationItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: Home, 
    path: '/',
    color: 'text-blue-500'
  },
  { 
    id: 'encrypt', 
    label: 'Encryption Studio', 
    icon: Shield, 
    path: '/encrypt',
    badge: 'AES-256',
    color: 'text-green-500'
  },
  { 
    id: 'files', 
    label: 'File Laboratory', 
    icon: FileText, 
    path: '/files',
    color: 'text-purple-500'
  },
  { 
    id: 'vault', 
    label: 'Key Vault', 
    icon: Key, 
    path: '/vault',
    badge: '12',
    color: 'text-orange-500'
  },
  { 
    id: 'analysis', 
    label: 'Analysis Center', 
    icon: BarChart3, 
    path: '/analysis',
    color: 'text-red-500'
  },
  { 
    id: 'learn', 
    label: 'Learning Hub', 
    icon: GraduationCap, 
    path: '/learn',
    badge: '75%',
    color: 'text-indigo-500'
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    path: '/settings',
    color: 'text-gray-500'
  },
];

interface FloatingSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function FloatingSidebar({ collapsed, onToggle }: FloatingSidebarProps) {
  const location = useLocation();
  const [hoverExpanded, setHoverExpanded] = useState(false);
  
  const isExpanded = !collapsed || hoverExpanded;
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-card/95 backdrop-blur-xl border-r border-border/50 z-50 transition-all duration-300 shadow-lg",
          isExpanded ? "w-64" : "w-16"
        )}
        onMouseEnter={() => collapsed && setHoverExpanded(true)}
        onMouseLeave={() => collapsed && setHoverExpanded(false)}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            {isExpanded && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold gradient-text">CipherFlow</span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="rounded-full w-8 h-8 p-0"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive || active
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-colors", item.color)} />
                
                {isExpanded && (
                  <>
                    <span className="font-medium flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && !hoverExpanded && (
                  <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-2 py-1 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-border shadow-md">
                    {item.label}
                    {item.badge && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Actions FAB */}
        {isExpanded && (
          <div className="absolute bottom-4 left-4 right-4">
            <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
              <Zap className="w-4 h-4" />
              Quick Encrypt
            </Button>
          </div>
        )}
      </aside>

      {/* Mobile Overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}