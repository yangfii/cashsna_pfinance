import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from './useLocalStorage';
import { useAuth } from './useAuth';

export interface LocalRecord {
  id: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  synced?: boolean;
  last_sync?: string;
  [key: string]: any;
}

export interface LocalDatabase {
  [tableName: string]: LocalRecord[];
}

// Comprehensive local database hook
export function useLocalDatabase() {
  const [database, setDatabase] = useLocalStorage<LocalDatabase>('cashsnap_database', {});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useLocalStorage<any[]>('cashsnap_sync_queue', []);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user } = useAuth();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (user) syncAllTables();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // Initialize tables if they don't exist
  const initTable = useCallback((tableName: string) => {
    setDatabase(prev => ({
      ...prev,
      [tableName]: prev[tableName] || []
    }));
  }, [setDatabase]);

  // Generic CRUD operations for local storage
  const localInsert = useCallback((tableName: string, record: Omit<LocalRecord, 'id' | 'created_at' | 'updated_at'>) => {
    const newRecord: LocalRecord = {
      ...record,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: user?.id,
      synced: false
    };

    setDatabase(prev => ({
      ...prev,
      [tableName]: [...(prev[tableName] || []), newRecord]
    }));

    // Add to sync queue for later
    setSyncQueue(prev => [...prev, {
      id: crypto.randomUUID(),
      table: tableName,
      action: 'insert',
      data: newRecord,
      timestamp: Date.now()
    }]);

    return newRecord;
  }, [setDatabase, setSyncQueue, user?.id]);

  const localUpdate = useCallback((tableName: string, id: string, updates: Partial<LocalRecord>) => {
    const updatedRecord = {
      ...updates,
      updated_at: new Date().toISOString(),
      synced: false
    };

    setDatabase(prev => ({
      ...prev,
      [tableName]: (prev[tableName] || []).map(record => 
        record.id === id ? { ...record, ...updatedRecord } : record
      )
    }));

    // Add to sync queue
    setSyncQueue(prev => [...prev, {
      id: crypto.randomUUID(),
      table: tableName,
      action: 'update',
      data: { id, ...updatedRecord },
      timestamp: Date.now()
    }]);

    return updatedRecord;
  }, [setDatabase, setSyncQueue]);

  const localDelete = useCallback((tableName: string, id: string) => {
    setDatabase(prev => ({
      ...prev,
      [tableName]: (prev[tableName] || []).filter(record => record.id !== id)
    }));

    // Add to sync queue
    setSyncQueue(prev => [...prev, {
      id: crypto.randomUUID(),
      table: tableName,
      action: 'delete',
      data: { id },
      timestamp: Date.now()
    }]);
  }, [setDatabase, setSyncQueue]);

  const localSelect = useCallback((tableName: string, filter?: (record: LocalRecord) => boolean) => {
    const records = database[tableName] || [];
    return filter ? records.filter(filter) : records;
  }, [database]);

  // Sync specific table with Supabase
  const syncTable = useCallback(async (tableName: string) => {
    if (!user || !isOnline) return;

    try {
      // Fetch latest data from Supabase - use any type to avoid TypeScript issues
      const { data: remoteData, error } = await (supabase as any)
        .from(tableName)
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local database with remote data
      if (remoteData) {
        const localRecords = database[tableName] || [];
        const mergedData = [...remoteData];

        // Add local-only records that haven't been synced
        localRecords.forEach(localRecord => {
          if (!localRecord.synced && !remoteData.find(r => r.id === localRecord.id)) {
            mergedData.push(localRecord);
          }
        });

        setDatabase(prev => ({
          ...prev,
          [tableName]: mergedData.map(record => ({
            ...record,
            synced: true,
            last_sync: new Date().toISOString()
          }))
        }));
      }
    } catch (error) {
      console.error(`Error syncing table ${tableName}:`, error);
    }
  }, [user, isOnline, database, setDatabase]);

  // Sync all tables
  const syncAllTables = useCallback(async () => {
    if (!user || !isOnline || isSyncing) return;

    setIsSyncing(true);
    const tables = [
      'transactions', 'categories', 'notes', 'reminders', 'goals',
      'habits', 'habit_entries', 'tasks', 'time_blocks', 'projects',
      'crypto_holdings', 'crypto_alerts', 'daily_pnl', 'portfolio_snapshots'
    ];

    // Process sync queue first
    for (const queueItem of syncQueue) {
      try {
        switch (queueItem.action) {
          case 'insert':
            await (supabase as any).from(queueItem.table).insert(queueItem.data);
            break;
          case 'update':
            await (supabase as any).from(queueItem.table)
              .update(queueItem.data)
              .eq('id', queueItem.data.id)
              .eq('user_id', user.id);
            break;
          case 'delete':
            await (supabase as any).from(queueItem.table)
              .delete()
              .eq('id', queueItem.data.id)
              .eq('user_id', user.id);
            break;
        }
      } catch (error) {
        console.error('Sync queue item failed:', queueItem, error);
      }
    }

    // Clear sync queue after processing
    setSyncQueue([]);

    // Sync all tables
    for (const table of tables) {
      await syncTable(table);
    }

    setIsSyncing(false);
  }, [user, isOnline, isSyncing, syncQueue, setSyncQueue, syncTable]);

  // Load data from remote on first load
  useEffect(() => {
    if (user && isOnline && Object.keys(database).length === 0) {
      syncAllTables();
    }
  }, [user, isOnline]);

  // Enhanced query functions
  const query = useCallback(<T extends LocalRecord>(tableName: string) => {
    initTable(tableName);
    const records = database[tableName] || [];

    return {
      select: (filter?: (record: T) => boolean) => {
        return filter ? records.filter(filter) as T[] : records as T[];
      },
      
      insert: (data: Omit<T, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
        return localInsert(tableName, data) as T;
      },
      
      update: (id: string, data: Partial<T>) => {
        return localUpdate(tableName, id, data);
      },
      
      delete: (id: string) => {
        return localDelete(tableName, id);
      },

      findById: (id: string) => {
        return records.find(record => record.id === id) as T | undefined;
      },

      findByUserId: (userId: string) => {
        return records.filter(record => record.user_id === userId) as T[];
      },

      count: (filter?: (record: T) => boolean) => {
        const filtered = filter ? records.filter(filter) : records;
        return filtered.length;
      }
    };
  }, [database, initTable, localInsert, localUpdate, localDelete]);

  return {
    database,
    isOnline,
    isSyncing,
    syncQueue: syncQueue.length,
    query,
    syncTable,
    syncAllTables,
    initTable,
    clearLocalData: () => setDatabase({}),
    exportData: () => database,
    importData: (data: LocalDatabase) => setDatabase(data)
  };
}