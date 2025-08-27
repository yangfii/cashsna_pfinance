import { useCallback } from 'react';
import { useLocalDatabase, LocalRecord } from './useLocalDatabase';
import { useAuth } from './useAuth';

// Offline-first data access layer
export function useOfflineFirst() {
  const { query, isOnline, isSyncing, syncAllTables } = useLocalDatabase();
  const { user } = useAuth();

  // Transactions
  const useTransactions = () => {
    const transactionQuery = query<LocalRecord & {
      amount: number;
      date: string;
      type: string;
      category: string;
      note?: string;
      image_url?: string;
    }>('transactions');

    return {
      getAll: () => transactionQuery.select(record => record.user_id === user?.id),
      getById: (id: string) => transactionQuery.findById(id),
      create: (data: { amount: number; date: string; type: string; category: string; note?: string; image_url?: string }) => 
        transactionQuery.insert(data),
      update: (id: string, data: Partial<{ amount: number; date: string; type: string; category: string; note?: string; image_url?: string }>) => 
        transactionQuery.update(id, data),
      delete: (id: string) => transactionQuery.delete(id),
      getByDateRange: (startDate: string, endDate: string) => 
        transactionQuery.select(record => 
          record.user_id === user?.id && 
          record.date >= startDate && 
          record.date <= endDate
        )
    };
  };

  // Categories
  const useCategories = () => {
    const categoryQuery = query<LocalRecord & {
      name: string;
      type: string;
      color: string;
    }>('categories');

    return {
      getAll: () => categoryQuery.select(record => record.user_id === user?.id),
      getById: (id: string) => categoryQuery.findById(id),
      create: (data: { name: string; type: string; color?: string }) => 
        categoryQuery.insert({ ...data, color: data.color || 'blue' }),
      update: (id: string, data: Partial<{ name: string; type: string; color: string }>) => 
        categoryQuery.update(id, data),
      delete: (id: string) => categoryQuery.delete(id),
      getByType: (type: string) => 
        categoryQuery.select(record => record.user_id === user?.id && record.type === type)
    };
  };

  // Notes
  const useNotes = () => {
    const noteQuery = query<LocalRecord & {
      title?: string;
      content: any;
      folder_id?: string;
      is_favorite: boolean;
      tags: string[];
    }>('notes');

    return {
      getAll: () => noteQuery.select(record => record.user_id === user?.id),
      getById: (id: string) => noteQuery.findById(id),
      create: (data: { title?: string; content: any; folder_id?: string; tags?: string[] }) => 
        noteQuery.insert({ 
          ...data, 
          is_favorite: false,
          tags: data.tags || []
        }),
      update: (id: string, data: Partial<{ title?: string; content: any; folder_id?: string; is_favorite: boolean; tags: string[] }>) => 
        noteQuery.update(id, data),
      delete: (id: string) => noteQuery.delete(id),
      getFavorites: () => 
        noteQuery.select(record => record.user_id === user?.id && record.is_favorite),
      getByFolder: (folderId: string) => 
        noteQuery.select(record => record.user_id === user?.id && record.folder_id === folderId)
    };
  };

  // Crypto Holdings
  const useCryptoHoldings = () => {
    const holdingQuery = query<LocalRecord & {
      symbol: string;
      name: string;
      amount: number;
      purchase_price: number;
      purchase_date: string;
      notes?: string;
    }>('crypto_holdings');

    return {
      getAll: () => holdingQuery.select(record => record.user_id === user?.id),
      getById: (id: string) => holdingQuery.findById(id),
      create: (data: { symbol: string; name: string; amount: number; purchase_price: number; purchase_date: string; notes?: string }) => 
        holdingQuery.insert(data),
      update: (id: string, data: Partial<{ symbol: string; name: string; amount: number; purchase_price: number; purchase_date: string; notes?: string }>) => 
        holdingQuery.update(id, data),
      delete: (id: string) => holdingQuery.delete(id),
      getBySymbol: (symbol: string) => 
        holdingQuery.select(record => record.user_id === user?.id && record.symbol === symbol)
    };
  };

  // Tasks
  const useTasks = () => {
    const taskQuery = query<LocalRecord & {
      title: string;
      description?: string;
      priority: string;
      status: string;
      due_date?: string;
      completed_at?: string;
      tags: string[];
    }>('tasks');

    return {
      getAll: () => taskQuery.select(record => record.user_id === user?.id),
      getById: (id: string) => taskQuery.findById(id),
      create: (data: { title: string; description?: string; priority?: string; status?: string; due_date?: string; tags?: string[] }) => 
        taskQuery.insert({
          ...data,
          priority: data.priority || 'medium',
          status: data.status || 'todo',
          tags: data.tags || []
        }),
      update: (id: string, data: Partial<{ title: string; description?: string; priority: string; status: string; due_date?: string; completed_at?: string; tags: string[] }>) => 
        taskQuery.update(id, data),
      delete: (id: string) => taskQuery.delete(id),
      getByStatus: (status: string) => 
        taskQuery.select(record => record.user_id === user?.id && record.status === status),
      getPending: () => 
        taskQuery.select(record => record.user_id === user?.id && record.status !== 'completed')
    };
  };

  // Habits
  const useHabits = () => {
    const habitQuery = query<LocalRecord & {
      name: string;
      description?: string;
      frequency: string;
      target_count: number;
      is_active: boolean;
      color?: string;
      icon?: string;
    }>('habits');

    return {
      getAll: () => habitQuery.select(record => record.user_id === user?.id),
      getById: (id: string) => habitQuery.findById(id),
      create: (data: { name: string; description?: string; frequency?: string; target_count?: number; color?: string; icon?: string }) => 
        habitQuery.insert({
          ...data,
          frequency: data.frequency || 'daily',
          target_count: data.target_count || 1,
          is_active: true,
          color: data.color || 'blue',
          icon: data.icon || 'circle'
        }),
      update: (id: string, data: Partial<{ name: string; description?: string; frequency: string; target_count: number; is_active: boolean; color?: string; icon?: string }>) => 
        habitQuery.update(id, data),
      delete: (id: string) => habitQuery.delete(id),
      getActive: () => 
        habitQuery.select(record => record.user_id === user?.id && record.is_active)
    };
  };

  const forceSync = useCallback(async () => {
    if (isOnline) {
      await syncAllTables();
    }
  }, [isOnline, syncAllTables]);

  return {
    isOnline,
    isSyncing,
    forceSync,
    transactions: useTransactions(),
    categories: useCategories(),
    notes: useNotes(),
    cryptoHoldings: useCryptoHoldings(),
    tasks: useTasks(),
    habits: useHabits()
  };
}