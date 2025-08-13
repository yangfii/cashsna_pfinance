import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage, localStorageManager } from './useLocalStorage';
import { useAuth } from './useAuth';

interface SyncQueue {
  id: string;
  table: string;
  action: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useLocalStorage<SyncQueue[]>('cashsnap_sync_queue', []);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user } = useAuth();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && syncQueue.length > 0 && !isSyncing) {
      syncToServer();
    }
  }, [isOnline, syncQueue.length]);

  // Add operation to sync queue
  const addToSyncQueue = (table: string, action: 'insert' | 'update' | 'delete', data: any) => {
    const queueItem: SyncQueue = {
      id: crypto.randomUUID(),
      table,
      action,
      data,
      timestamp: Date.now()
    };

    setSyncQueue(prev => [...prev, queueItem]);
  };

  // Sync queued operations to server
  const syncToServer = async () => {
    if (!user || syncQueue.length === 0) return;

    setIsSyncing(true);
    const failedOperations: SyncQueue[] = [];

    for (const operation of syncQueue) {
      try {
        switch (operation.action) {
          case 'insert':
            if (operation.table === 'categories') {
              await supabase.from('categories').insert(operation.data);
            } else if (operation.table === 'transactions') {
              await supabase.from('transactions').insert(operation.data);
            } else if (operation.table === 'notes') {
              await supabase.from('notes').insert(operation.data);
            }
            break;
          case 'update':
            if (operation.table === 'categories') {
              await supabase.from('categories')
                .update(operation.data)
                .eq('id', operation.data.id)
                .eq('user_id', user.id);
            } else if (operation.table === 'transactions') {
              await supabase.from('transactions')
                .update(operation.data)
                .eq('id', operation.data.id)
                .eq('user_id', user.id);
            } else if (operation.table === 'notes') {
              await supabase.from('notes')
                .update(operation.data)
                .eq('id', operation.data.id)
                .eq('user_id', user.id);
            }
            break;
          case 'delete':
            if (operation.table === 'categories') {
              await supabase.from('categories')
                .delete()
                .eq('id', operation.data.id)
                .eq('user_id', user.id);
            } else if (operation.table === 'transactions') {
              await supabase.from('transactions')
                .delete()
                .eq('id', operation.data.id)
                .eq('user_id', user.id);
            } else if (operation.table === 'notes') {
              await supabase.from('notes')
                .delete()
                .eq('id', operation.data.id)
                .eq('user_id', user.id);
            }
            break;
        }
      } catch (error) {
        console.error('Sync failed for operation:', operation, error);
        failedOperations.push(operation);
      }
    }

    // Keep only failed operations in queue
    setSyncQueue(failedOperations);
    setIsSyncing(false);

    return failedOperations.length === 0;
  };

  // Clear sync queue
  const clearSyncQueue = () => {
    setSyncQueue([]);
  };

  return {
    isOnline,
    isSyncing,
    syncQueue,
    addToSyncQueue,
    syncToServer,
    clearSyncQueue
  };
}
