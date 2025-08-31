import { useState, useEffect, useMemo } from 'react';
import { Search, Brain, Coins, BarChart3, Target, FolderOpen, ArrowLeftRight, Settings, LayoutDashboard, TrendingUp, Calculator, PieChart, Zap, FileText, Bell, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useNotes } from '@/hooks/useNotes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: string;
  route: string;
  icon: any;
  keywords: string[];
  content?: string; // For searchable content like notes
  type?: 'navigation' | 'content' | 'function';
}

export function GlobalSearch() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { notes } = useNotes();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<SearchItem[]>([]);

  // Memoize navigation items to prevent infinite re-renders
  const navigationItems: SearchItem[] = useMemo(() => [
    {
      id: 'dashboard',
      title: t('nav.dashboard'),
      description: 'Overview of your financial status',
      category: 'Navigation',
      route: '/dashboard',
      icon: LayoutDashboard,
      keywords: ['home', 'overview', 'main', 'summary'],
      type: 'navigation'
    },
    {
      id: 'portfolio',
      title: t('nav.portfolio'),
      description: 'Manage your crypto investments',
      category: 'Crypto',
      route: '/dashboard/portfolio',
      icon: Coins,
      keywords: ['crypto', 'investments', 'holdings', 'coins', 'bitcoin', 'ethereum'],
      type: 'navigation'
    },
    {
      id: 'transactions',
      title: t('nav.transactions'),
      description: 'View and manage transactions',
      category: 'Finance',
      route: '/dashboard/transactions',
      icon: ArrowLeftRight,
      keywords: ['payments', 'transfers', 'history', 'money'],
      type: 'navigation'
    },
    {
      id: 'categories',
      title: t('nav.categories'),
      description: 'Organize your expenses',
      category: 'Finance',
      route: '/dashboard/categories',
      icon: FolderOpen,
      keywords: ['organize', 'tags', 'groups', 'budget'],
      type: 'navigation'
    },
    {
      id: 'assistant',
      title: t('nav.assistant'),
      description: 'AI-powered financial advice',
      category: 'AI',
      route: '/dashboard/assistant',
      icon: Brain,
      keywords: ['ai', 'help', 'advice', 'chat', 'support'],
      type: 'navigation'
    },
    {
      id: 'workflow',
      title: t('nav.workflow'),
      description: 'Task management, goals, and workflow optimization',
      category: 'Planning',
      route: '/dashboard/workflow',
      icon: Target,
      keywords: ['goals', 'tasks', 'planning', 'workflow', 'habits', 'productivity'],
      type: 'navigation'
    },
    {
      id: 'reports',
      title: t('nav.reports'),
      description: 'Financial reports and analytics',
      category: 'Analytics',
      route: '/dashboard/reports',
      icon: BarChart3,
      keywords: ['analytics', 'charts', 'data', 'insights', 'performance'],
      type: 'navigation'
    },
    {
      id: 'settings',
      title: t('nav.settings'),
      description: 'App preferences and configuration',
      category: 'Settings',
      route: '/dashboard/settings',
      icon: Settings,
      keywords: ['preferences', 'config', 'profile', 'account'],
      type: 'navigation'
    },
    // Crypto functions
    {
      id: 'price-alerts',
      title: 'Price Alerts',
      description: 'Set up cryptocurrency price notifications',
      category: 'Crypto Tools',
      route: '/dashboard/portfolio',
      icon: Zap,
      keywords: ['alerts', 'notifications', 'price', 'crypto', 'notify'],
      type: 'function'
    },
    {
      id: 'portfolio-analytics',
      title: 'Portfolio Analytics',
      description: 'Detailed analysis of your investments',
      category: 'Analytics Tools',
      route: '/dashboard/portfolio',
      icon: TrendingUp,
      keywords: ['analysis', 'performance', 'roi', 'profit', 'loss'],
      type: 'function'
    },
    {
      id: 'profit-calculator',
      title: 'Profit Calculator',
      description: 'Calculate potential profits and losses',
      category: 'Financial Tools',
      route: '/dashboard/portfolio',
      icon: Calculator,
      keywords: ['calculator', 'profit', 'loss', 'calculate', 'math'],
      type: 'function'
    },
    {
      id: 'donut-chart',
      title: 'Portfolio Distribution',
      description: 'Visual breakdown of your holdings',
      category: 'Analytics Tools',
      route: '/dashboard/portfolio',
      icon: PieChart,
      keywords: ['chart', 'distribution', 'breakdown', 'visual', 'pie'],
      type: 'function'
    }
  ], [t]);

  // Memoize content items to prevent infinite re-renders
  const contentItems: SearchItem[] = useMemo(() => [
    ...notes.map(note => ({
      id: `note-${note.id}`,
      title: note.title,
      description: note.content.length > 100 ? `${note.content.substring(0, 100)}...` : note.content,
      category: 'Notes',
      route: '/dashboard/workflow',
      icon: FileText,
      keywords: ['note', 'document', 'text', note.title.toLowerCase()],
      content: note.content,
      type: 'content' as const
    }))
  ], [notes]);

  // Combine all searchable items
  const searchItems = useMemo(() => [...navigationItems, ...contentItems], [navigationItems, contentItems]);

  useEffect(() => {
    if (query.trim() === '') {
      setFilteredItems(searchItems);
      return;
    }

    const filtered = searchItems.filter(item => {
      const searchText = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchText) ||
        item.description.toLowerCase().includes(searchText) ||
        item.category.toLowerCase().includes(searchText) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(searchText)) ||
        (item.content && item.content.toLowerCase().includes(searchText))
      );
    });

    setFilteredItems(filtered);
  }, [query, searchItems]);

  const handleItemSelect = (item: SearchItem) => {
    navigate(item.route);
    setOpen(false);
    setQuery('');
  };

  const categories = [...new Set(filteredItems.map(item => item.category))];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors group">
          <Globe className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            Search all in web...
          </span>
          <Badge variant="outline" className="ml-auto text-xs">
            ⌘K
          </Badge>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Global Search</DialogTitle>
        </DialogHeader>
        <div className="flex items-center border-b px-3">
          <Search className="size-4 text-muted-foreground mr-2" />
          <Input
            placeholder="Search everything in your web app..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>
        <ScrollArea className="max-h-96">
          <div className="p-2">
            {categories.map(category => {
              const categoryItems = filteredItems.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category} className="mb-4">
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {categoryItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleItemSelect(item)}
                        className={cn(
                          "flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer transition-colors",
                          "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <item.icon className="size-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Globe className="size-8 mx-auto mb-2 opacity-50" />
                <p>No content found</p>
                <p className="text-xs">Try searching for pages, notes, or functions</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Keyboard shortcut hook
export function useGlobalSearchShortcut(callback: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [callback]);
}