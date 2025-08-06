import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, Calendar, Edit3, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DailyPNLData {
  date: string;
  pnl: number;
}

interface DailyPNLCalendarProps {
  positiveColor?: string;
  negativeColor?: string;
  positiveBgColor?: string;
  negativeBgColor?: string;
}

// Mock data for demonstration - in real app this would come from props or API
const mockPNLData: DailyPNLData[] = [
  { date: '2025-08-01', pnl: 0.00 },
  { date: '2025-08-02', pnl: -1.50 },
  { date: '2025-08-03', pnl: -0.00 },
  { date: '2025-08-04', pnl: -0.00 },
  { date: '2025-08-05', pnl: 0.00 },
  { date: '2025-08-06', pnl: 25.43 },
  { date: '2025-08-07', pnl: 17.21 },
  { date: '2025-08-08', pnl: -17.12 },
  { date: '2025-08-09', pnl: 3.55 },
  { date: '2025-08-10', pnl: -63.69 },
  { date: '2025-08-11', pnl: 0.00 },
  { date: '2025-08-12', pnl: 0.00 },
  { date: '2025-08-13', pnl: 0.00 },
  { date: '2025-08-14', pnl: -4.22 },
  { date: '2025-08-15', pnl: -11.52 },
  { date: '2025-08-16', pnl: -13.54 },
  { date: '2025-08-17', pnl: -25.01 },
  { date: '2025-08-18', pnl: 109.37 },
  { date: '2025-08-19', pnl: 70.03 },
  { date: '2025-08-20', pnl: 4.57 },
  { date: '2025-08-21', pnl: -352.53 },
  { date: '2025-08-22', pnl: 0.00 },
  { date: '2025-08-23', pnl: 85.88 },
  { date: '2025-08-24', pnl: -181.21 },
  { date: '2025-08-25', pnl: 0.00 },
  { date: '2025-08-26', pnl: 0.00 },
  { date: '2025-08-27', pnl: 0.00 },
  { date: '2025-08-28', pnl: 0.00 },
  { date: '2025-08-29', pnl: 0.00 },
  { date: '2025-08-30', pnl: 0.00 },
  { date: '2025-08-31', pnl: 0.00 },
];

export default function DailyPNLCalendar({
  positiveColor = "text-emerald-400",
  negativeColor = "text-rose-400", 
  positiveBgColor = "bg-emerald-500/10 border-emerald-500/20",
  negativeBgColor = "bg-rose-500/10 border-rose-500/20"
}: DailyPNLCalendarProps = {}) {
  const { user } = useAuth();
  // Fixed date: August 7th, 2025
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 7)); // August 7th, 2025 (month is 0-indexed)
  const [pnlData, setPnlData] = useState<DailyPNLData[]>([]);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Load PNL data from database
  useEffect(() => {
    if (user) {
      loadPNLData();
    }
  }, [user, currentDate]);

  // Update time every second for real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadPNLData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('daily_pnl')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`)
        .lte('date', `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-31`);

      if (error) throw error;

      const formattedData = data.map(item => ({
        date: item.date,
        pnl: parseFloat(item.pnl.toString())
      }));

      setPnlData(formattedData);
    } catch (error) {
      console.error('Error loading PNL data:', error);
      toast.error('Failed to load PNL data');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePNL = async (date: string, value: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('daily_pnl')
        .upsert({
          user_id: user.id,
          date,
          pnl: value
        });

      if (error) throw error;

      // Update local state
      setPnlData(prev => {
        const existing = prev.find(d => d.date === date);
        if (existing) {
          return prev.map(d => d.date === date ? { ...d, pnl: value } : d);
        } else {
          return [...prev, { date, pnl: value }];
        }
      });

      toast.success('PNL data saved successfully');
    } catch (error) {
      console.error('Error saving PNL data:', error);
      toast.error('Failed to save PNL data');
    }
  };

  const startEditing = (date: string, currentValue: number) => {
    setEditingCell(date);
    setEditValue(currentValue.toString());
  };

  const saveEdit = async (date: string) => {
    const numValue = parseFloat(editValue) || 0;
    await updatePNL(date, numValue);
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const formatPNL = (value: number) => {
    if (value === 0) return '0.00';
    if (value > 0) return `+${value.toFixed(2)}`;
    return value.toFixed(2); // Already has minus sign
  };

  const getPNLColor = (value: number) => {
    if (value > 0) return positiveColor;
    if (value < 0) return negativeColor;
    return 'text-muted-foreground';
  };

  const getPNLBackground = (value: number) => {
    if (value > 0) return positiveBgColor;
    if (value < 0) return negativeBgColor;
    return 'bg-muted/50 border-border';
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-start-${i}`} className="h-20" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = pnlData.find(d => d.date === dateStr);
      const pnl = dayData?.pnl || 0;
      const isEditing = editingCell === dateStr;
      
      // Check if this is "today" (August 7th, 2025)
      const isToday = dateStr === '2025-08-07';

      days.push(
        <div
          key={day}
          className={cn(
            "h-20 border rounded-lg p-2 flex flex-col justify-between text-center transition-all duration-200 hover:scale-105 cursor-pointer relative group",
            getPNLBackground(pnl),
            isEditing && "ring-2 ring-primary",
            isToday && "ring-2 ring-blue-500 bg-blue-500/10"
          )}
          onClick={() => !isEditing && startEditing(dateStr, pnl)}
        >
          <div className={cn("font-medium text-lg", isToday ? "text-blue-600 font-bold" : "text-foreground")}>{day}</div>
          
          {isEditing ? (
            <div className="flex items-center gap-1 text-xs">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className={cn(
                  "h-6 text-xs text-center border-0 p-0 bg-transparent focus:ring-1 focus:ring-primary",
                  parseFloat(editValue) > 0 ? positiveColor : parseFloat(editValue) < 0 ? negativeColor : "text-muted-foreground"
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit(dateStr);
                  if (e.key === 'Escape') cancelEdit();
                }}
                autoFocus
              />
              <div className="flex flex-col gap-0.5">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-3 w-3 p-0 text-green-500 hover:text-green-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    saveEdit(dateStr);
                  }}
                >
                  <Check className="h-2 w-2" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-3 w-3 p-0 text-red-500 hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelEdit();
                  }}
                >
                  <X className="h-2 w-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1">
              <div className={cn("text-sm font-semibold", getPNLColor(pnl))}>
                {formatPNL(pnl)}
              </div>
              <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: '2-digit' 
  });

  // Fixed "today" as August 7th, 2025 with real-time clock
  const fixedToday = new Date(2025, 7, 7); // August 7th, 2025
  const todayString = fixedToday.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Daily PNL</h2>
            <p className="text-sm text-muted-foreground">Today: {todayString} • {timeString}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <BarChart3 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Calendar className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth('prev')}
            className="text-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-xl font-semibold text-foreground min-w-[120px] text-center">
            {monthYear}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth('next')}
            className="text-foreground hover:text-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
            <div key={day} className="text-center text-muted-foreground font-medium py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {renderCalendarDays()}
        </div>
      </CardContent>
    </Card>
  );
}