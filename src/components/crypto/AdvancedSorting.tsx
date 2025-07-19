
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowUp, ArrowDown, Settings } from "lucide-react";

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

interface AdvancedSortingProps {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  secondarySort?: SortOption;
  onSecondarySortChange?: (sort: SortOption | undefined) => void;
}

const SORT_OPTIONS = [
  { value: 'value', label: 'Portfolio Value' },
  { value: 'symbol', label: 'Symbol' },
  { value: 'name', label: 'Name' },
  { value: 'change', label: '24h Change' },
  { value: 'amount', label: 'Amount' },
  { value: 'purchase_price', label: 'Purchase Price' },
  { value: 'purchase_date', label: 'Purchase Date' },
  { value: 'gain_loss', label: 'Gain/Loss' },
  { value: 'gain_loss_percent', label: 'Gain/Loss %' },
];

export default function AdvancedSorting({
  sortBy,
  sortDirection,
  onSortChange,
  secondarySort,
  onSecondarySortChange
}: AdvancedSortingProps) {
  const currentSortLabel = SORT_OPTIONS.find(option => option.value === sortBy)?.label || 'Value';
  
  const toggleDirection = () => {
    onSortChange(sortBy, sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleSortChange = (newSortBy: string) => {
    onSortChange(newSortBy, 'desc'); // Default to descending for most cases
  };

  return (
    <div className="flex items-center gap-2">
      {/* Quick sort toggle */}
      <Select value={sortBy} onValueChange={handleSortChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Direction toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleDirection}
        className="px-2"
      >
        {sortDirection === 'desc' ? (
          <ArrowDown className="h-4 w-4" />
        ) : (
          <ArrowUp className="h-4 w-4" />
        )}
      </Button>

      {/* Advanced sorting options */}
      {onSecondarySortChange && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Settings className="h-4 w-4 mr-1" />
              Advanced
              {secondarySort && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                  2
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Advanced Sorting
              </h4>

              {/* Primary Sort */}
              <div>
                <Label className="text-sm font-medium">Primary Sort</Label>
                <div className="flex gap-2 mt-2">
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={sortDirection} 
                    onValueChange={(dir: 'asc' | 'desc') => onSortChange(sortBy, dir)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Desc</SelectItem>
                      <SelectItem value="asc">Asc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Secondary Sort */}
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Secondary Sort</Label>
                  {secondarySort && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSecondarySortChange(undefined)}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <Select 
                    value={secondarySort?.field || ''} 
                    onValueChange={(field) => 
                      field && onSecondarySortChange({
                        field,
                        direction: 'desc',
                        label: SORT_OPTIONS.find(o => o.value === field)?.label || field
                      })
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select secondary sort" />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.filter(option => option.value !== sortBy).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {secondarySort && (
                    <Select 
                      value={secondarySort.direction} 
                      onValueChange={(dir: 'asc' | 'desc') => 
                        onSecondarySortChange({...secondarySort, direction: dir})
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Desc</SelectItem>
                        <SelectItem value="asc">Asc</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Current sorting display */}
              {(sortBy || secondarySort) && (
                <div className="pt-2 border-t">
                  <Label className="text-sm font-medium">Current Sorting</Label>
                  <div className="mt-2 space-y-1">
                    <Badge variant="outline" className="text-xs">
                      1. {currentSortLabel} ({sortDirection === 'desc' ? 'High to Low' : 'Low to High'})
                    </Badge>
                    {secondarySort && (
                      <Badge variant="outline" className="text-xs">
                        2. {secondarySort.label} ({secondarySort.direction === 'desc' ? 'High to Low' : 'Low to High'})
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
