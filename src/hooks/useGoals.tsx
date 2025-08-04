
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: 'weekly' | 'monthly' | 'yearly';
  period: string;
  steps: string[];
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadGoals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading goals:', error);
        toast.error('Failed to load goals');
        return;
      }

      setGoals(data || []);
    } catch (err) {
      console.error('Unexpected error loading goals:', err);
      toast.error('An unexpected error occurred while loading goals');
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('You must be logged in to create goals');
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{
          ...goalData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating goal:', error);
        toast.error('Failed to create goal');
        return null;
      }

      setGoals(prev => [data, ...prev]);
      toast.success('Goal created successfully!');
      return data;
    } catch (err) {
      console.error('Unexpected error creating goal:', err);
      toast.error('An unexpected error occurred while creating the goal');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (id: string, updates: Partial<Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) {
      toast.error('You must be logged in to update goals');
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating goal:', error);
        toast.error('Failed to update goal');
        return null;
      }

      setGoals(prev => prev.map(goal => goal.id === id ? data : goal));
      toast.success('Goal updated successfully!');
      return data;
    } catch (err) {
      console.error('Unexpected error updating goal:', err);
      toast.error('An unexpected error occurred while updating the goal');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete goals');
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting goal:', error);
        toast.error('Failed to delete goal');
        return false;
      }

      setGoals(prev => prev.filter(goal => goal.id !== id));
      toast.success('Goal deleted successfully!');
      return true;
    } catch (err) {
      console.error('Unexpected error deleting goal:', err);
      toast.error('An unexpected error occurred while deleting the goal');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleGoalCompletion = async (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return null;

    return await updateGoal(id, { completed: !goal.completed });
  };

  // Migrate localStorage data to database
  const migrateLocalStorageData = async () => {
    if (!user) return;

    try {
      const localGoals = localStorage.getItem('finance-goals');
      if (!localGoals) return;

      const parsedGoals = JSON.parse(localGoals);
      if (!Array.isArray(parsedGoals) || parsedGoals.length === 0) return;

      console.log('Migrating goals from localStorage to database:', parsedGoals);
      
      for (const localGoal of parsedGoals) {
        await createGoal({
          title: localGoal.title || 'Untitled Goal',
          description: localGoal.description || '',
          type: localGoal.type || 'monthly',
          period: localGoal.period || new Date().toISOString().slice(0, 7),
          steps: Array.isArray(localGoal.steps) ? localGoal.steps : [],
          completed: Boolean(localGoal.completed)
        });
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('finance-goals');
      toast.success('Your goals have been migrated to the cloud!');
    } catch (err) {
      console.error('Error migrating localStorage data:', err);
      toast.error('Failed to migrate local goals data');
    }
  };

  useEffect(() => {
    if (user) {
      loadGoals();
      migrateLocalStorageData();
    }
  }, [user]);

  return {
    goals,
    loading,
    loadGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    toggleGoalCompletion,
    migrateLocalStorageData
  };
};
