import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocalDatabase } from '@/hooks/useLocalDatabase';

export function OfflineIndicator() {
  const { isOnline, isSyncing, syncQueue, syncAllTables } = useLocalDatabase();

  if (isOnline && syncQueue === 0) {
    return (
      <Badge variant="outline" className="bg-background/80 text-foreground border-border">
        <Wifi className="w-3 h-3 mr-1" />
        Online
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isOnline ? "default" : "destructive"} className="bg-background/80">
        {isOnline ? (
          <Wifi className="w-3 h-3 mr-1" />
        ) : (
          <WifiOff className="w-3 h-3 mr-1" />
        )}
        {isOnline ? `${syncQueue} pending` : 'Offline'}
      </Badge>
      
      {isOnline && syncQueue > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={syncAllTables}
          disabled={isSyncing}
          className="h-6 px-2"
        >
          {isSyncing ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
        </Button>
      )}
    </div>
  );
}