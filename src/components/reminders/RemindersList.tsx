import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, isToday, isTomorrow, isPast, isThisWeek } from 'date-fns';
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  Briefcase, 
  Heart, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useReminders, type Reminder } from '@/hooks/useReminders';
import { cn } from '@/lib/utils';

const reminderTypeIcons = {
  event: CalendarIcon,
  task: Clock,
  payment: AlertTriangle,
  meeting: Briefcase,
  birthday: Heart,
  deadline: Bell,
};

const priorityColors = {
  low: 'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-red-100 text-red-800 border-red-300',
};

export function RemindersList() {
  const { reminders, loading, toggleCompletion, deleteReminder, getUpcomingReminders, getOverdueReminders } = useReminders();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('all');

  const getFilteredReminders = () => {
    switch (filter) {
      case 'upcoming':
        return getUpcomingReminders();
      case 'overdue':
        return getOverdueReminders();
      case 'completed':
        return reminders.filter(r => r.is_completed);
      default:
        return reminders;
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return `Overdue (${format(date, 'MMM d')})`;
    if (isThisWeek(date)) return format(date, 'EEEE');
    return format(date, 'MMM d, yyyy');
  };

  const getDueDateColor = (dateString: string, isCompleted: boolean) => {
    if (isCompleted) return 'text-muted-foreground';
    
    const date = new Date(dateString);
    if (isPast(date)) return 'text-red-600';
    if (isToday(date)) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  const filteredReminders = getFilteredReminders();
  const upcomingCount = getUpcomingReminders().length;
  const overdueCount = getOverdueReminders().length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({reminders.length})
        </Button>
        <Button
          variant={filter === 'upcoming' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('upcoming')}
          className="relative"
        >
          Upcoming
          {upcomingCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {upcomingCount}
            </Badge>
          )}
        </Button>
        <Button
          variant={filter === 'overdue' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('overdue')}
          className="relative"
        >
          Overdue
          {overdueCount > 0 && (
            <Badge variant="destructive" className="ml-1 text-xs">
              {overdueCount}
            </Badge>
          )}
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Completed ({reminders.filter(r => r.is_completed).length})
        </Button>
      </div>

      {/* Reminders list */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No reminders found for this filter.</p>
            </CardContent>
          </Card>
        ) : (
          filteredReminders.map((reminder) => {
            const IconComponent = reminderTypeIcons[reminder.reminder_type];
            const dueDate = new Date(reminder.due_date);
            const isOverdue = isPast(dueDate) && !reminder.is_completed;
            
            return (
              <Card 
                key={reminder.id} 
                className={cn(
                  "transition-all duration-200",
                  reminder.is_completed && "opacity-60",
                  isOverdue && "border-red-200 bg-red-50/50"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={reminder.is_completed}
                      onCheckedChange={() => toggleCompletion(reminder.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <h3 className={cn(
                          "font-medium truncate",
                          reminder.is_completed && "line-through text-muted-foreground"
                        )}>
                          {reminder.title}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", priorityColors[reminder.priority])}
                        >
                          {reminder.priority}
                        </Badge>
                        {isOverdue && (
                          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      {reminder.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {reminder.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className={getDueDateColor(reminder.due_date, reminder.is_completed)}>
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatDueDate(reminder.due_date)}
                        </span>
                        
                        {reminder.category && (
                          <Badge variant="secondary" className="text-xs">
                            {reminder.category}
                          </Badge>
                        )}
                        
                        {reminder.is_recurring && (
                          <Badge variant="outline" className="text-xs">
                            {reminder.recurrence_pattern}
                          </Badge>
                        )}
                        
                        <div className="flex items-center gap-1">
                          {reminder.notification_methods.includes('push') && (
                            <Bell className="h-3 w-3 text-muted-foreground" />
                          )}
                          {reminder.notification_methods.includes('email') && (
                            <span className="text-xs text-muted-foreground">📧</span>
                          )}
                          {reminder.notification_methods.includes('sms') && (
                            <span className="text-xs text-muted-foreground">📱</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteReminder(reminder.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}