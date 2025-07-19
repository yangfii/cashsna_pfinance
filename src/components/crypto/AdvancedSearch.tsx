
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { CryptoHolding } from "@/hooks/useCryptoData";

interface AdvancedSearchProps {
  holdings: CryptoHolding[];
  onSearch: (searchTerm: string) => void;
  searchTerm: string;
}

export default function AdvancedSearch({ holdings, onSearch, searchTerm }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<CryptoHolding[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('cryptoSearchHistory');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      if (term.length > 0) {
        const filtered = holdings.filter(holding =>
          holding.symbol.toLowerCase().includes(term.toLowerCase()) ||
          holding.name.toLowerCase().includes(term.toLowerCase()) ||
          holding.wallet_type?.toLowerCase().includes(term.toLowerCase()) ||
          holding.notes?.toLowerCase().includes(term.toLowerCase())
        ).slice(0, 5);
        setSuggestions(filtered);
      } else {
        setSuggestions([]);
      }
    }, 300),
    [holdings]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleSearch = (term: string) => {
    onSearch(term);
    if (term && !recentSearches.includes(term)) {
      const newRecentSearches = [term, ...recentSearches.slice(0, 4)];
      setRecentSearches(newRecentSearches);
      localStorage.setItem('cryptoSearchHistory', JSON.stringify(newRecentSearches));
    }
    setIsOpen(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('cryptoSearchHistory');
  };

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets, wallets, notes..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => onSearch('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandList>
              {suggestions.length > 0 && (
                <CommandGroup heading="Suggestions">
                  {suggestions.map((holding) => (
                    <CommandItem
                      key={holding.id}
                      onSelect={() => handleSearch(holding.symbol)}
                      className="flex items-center gap-2"
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-medium">{holding.symbol}</span>
                      <span className="text-sm text-muted-foreground">{holding.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {recentSearches.length > 0 && (
                <CommandGroup heading="Recent Searches">
                  <div className="flex justify-between items-center px-2 py-1">
                    <span className="text-xs text-muted-foreground">Recent</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={clearRecentSearches}
                    >
                      Clear
                    </Button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => handleSearch(search)}
                      className="flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      <span>{search}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {suggestions.length === 0 && recentSearches.length === 0 && searchTerm && (
                <CommandEmpty>No results found for "{searchTerm}"</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}
