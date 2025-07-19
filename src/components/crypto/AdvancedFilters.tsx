
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Filter, X, Settings, TrendingUp, TrendingDown, DollarSign, Calendar, Wallet } from "lucide-react";

export interface FilterOptions {
  valueRange: { min: number | null; max: number | null };
  performance: 'all' | 'gainers' | 'losers' | 'break_even';
  walletType: string[];
  dateRange: { from: Date | null; to: Date | null };
  amountRange: { min: number | null; max: number | null };
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  walletTypes: string[];
  activeFiltersCount: number;
}

const FILTER_PRESETS = [
  { name: "My Winners", icon: TrendingUp, filters: { performance: 'gainers' as const } },
  { name: "Need Attention", icon: TrendingDown, filters: { performance: 'losers' as const } },
  { name: "High Value", icon: DollarSign, filters: { valueRange: { min: 1000, max: null } } },
];

export default function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  walletTypes, 
  activeFiltersCount 
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      valueRange: { min: null, max: null },
      performance: 'all',
      walletType: [],
      dateRange: { from: null, to: null },
      amountRange: { min: null, max: null }
    });
  };

  const applyPreset = (preset: typeof FILTER_PRESETS[0]) => {
    const newFilters = { ...filters };
    Object.assign(newFilters, preset.filters);
    onFiltersChange(newFilters);
    setIsOpen(false);
  };

  const getActiveFilters = () => {
    const active: Array<{ key: string; label: string; onRemove: () => void }> = [];
    
    if (filters.performance !== 'all') {
      active.push({
        key: 'performance',
        label: filters.performance.charAt(0).toUpperCase() + filters.performance.slice(1).replace('_', ' '),
        onRemove: () => handleFilterChange('performance', 'all')
      });
    }
    
    if (filters.valueRange.min !== null || filters.valueRange.max !== null) {
      const label = `Value: ${filters.valueRange.min ? `$${filters.valueRange.min}+` : ''}${
        filters.valueRange.max ? ` - $${filters.valueRange.max}` : ''
      }`;
      active.push({
        key: 'valueRange',
        label,
        onRemove: () => handleFilterChange('valueRange', { min: null, max: null })
      });
    }
    
    if (filters.walletType.length > 0) {
      active.push({
        key: 'walletType',
        label: `Wallets: ${filters.walletType.length}`,
        onRemove: () => handleFilterChange('walletType', [])
      });
    }
    
    return active;
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-4 w-4 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Advanced Filters
                </h4>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear All
                  </Button>
                )}
              </div>

              {/* Filter Presets */}
              <div>
                <Label className="text-sm font-medium">Quick Filters</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {FILTER_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => applyPreset(preset)}
                    >
                      <preset.icon className="h-3 w-3 mr-1" />
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Performance Filter */}
              <div>
                <Label className="text-sm font-medium">Performance</Label>
                <Select 
                  value={filters.performance} 
                  onValueChange={(value) => handleFilterChange('performance', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assets</SelectItem>
                    <SelectItem value="gainers">Gainers Only</SelectItem>
                    <SelectItem value="losers">Losers Only</SelectItem>
                    <SelectItem value="break_even">Break Even</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Value Range Filter */}
              <div>
                <Label className="text-sm font-medium">Portfolio Value Range</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Min ($)"
                    type="number"
                    value={filters.valueRange.min || ''}
                    onChange={(e) => handleFilterChange('valueRange', {
                      ...filters.valueRange,
                      min: e.target.value ? parseFloat(e.target.value) : null
                    })}
                  />
                  <Input
                    placeholder="Max ($)"
                    type="number"
                    value={filters.valueRange.max || ''}
                    onChange={(e) => handleFilterChange('valueRange', {
                      ...filters.valueRange,
                      max: e.target.value ? parseFloat(e.target.value) : null
                    })}
                  />
                </div>
              </div>

              {/* Wallet Type Filter */}
              {walletTypes.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Wallet Types</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {walletTypes.map((type) => (
                      <Badge
                        key={type}
                        variant={filters.walletType.includes(type) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => {
                          const newTypes = filters.walletType.includes(type)
                            ? filters.walletType.filter(t => t !== type)
                            : [...filters.walletType, type];
                          handleFilterChange('walletType', newTypes);
                        }}
                      >
                        <Wallet className="h-3 w-3 mr-1" />
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Quick preset buttons */}
        <div className="hidden md:flex gap-1">
          {FILTER_PRESETS.slice(0, 2).map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => applyPreset(preset)}
            >
              <preset.icon className="h-3 w-3 mr-1" />
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="flex items-center gap-1 text-xs px-2 py-1"
            >
              {filter.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-3 w-3 p-0 hover:bg-transparent"
                onClick={filter.onRemove}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
