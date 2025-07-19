import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_type: 'event' | 'task' | 'payment' | 'meeting' | 'birthday' | 'deadline';
  priority: 'low' | 'medium' | 'high';
  category?: string;
  due_date: string;
  is_recurring: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_end_date?: string;
  notification_methods: string[];
  is_completed: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadReminders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('is_active', true)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setReminders(data as Reminder[] || []);
    } catch (error: any) {
      console.error('Error loading reminders:', error);
      toast({
        title: "Error",
        description: "Failed to load reminders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createReminder = async (reminderData: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert([{
          ...reminderData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setReminders(prev => [...prev, data as Reminder]);
      toast({
        title: "Success",
        description: "Reminder created successfully",
      });

      return data;
    } catch (error: any) {
      console.error('Error creating reminder:', error);
      toast({
        title: "Error",
        description: "Failed to create reminder",
        variant: "destructive",
      });
    }
  };

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setReminders(prev => prev.map(reminder => 
        reminder.id === id ? data as Reminder : reminder
      ));

      toast({
        title: "Success",
        description: "Reminder updated successfully",
      });

      return data;
    } catch (error: any) {
      console.error('Error updating reminder:', error);
      toast({
        title: "Error",
        description: "Failed to update reminder",
        variant: "destructive",
      });
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setReminders(prev => prev.filter(reminder => reminder.id !== id));
      
      toast({
        title: "Success",
        description: "Reminder deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting reminder:', error);
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive",
      });
    }
  };

  const toggleCompletion = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    await updateReminder(id, { is_completed: !reminder.is_completed });
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return reminders.filter(reminder => {
      const dueDate = new Date(reminder.due_date);
      return dueDate >= now && dueDate <= next24Hours && !reminder.is_completed;
    });
  };

  const getOverdueReminders = () => {
    const now = new Date();
    return reminders.filter(reminder => {
      const dueDate = new Date(reminder.due_date);
      return dueDate < now && !reminder.is_completed;
    });
  };

  useEffect(() => {
    loadReminders();
  }, [user]);

  return {
    reminders,
    loading,
    createReminder,
    updateReminder,
    deleteReminder,
    toggleCompletion,
    getUpcomingReminders,
    getOverdueReminders,
    refresh: loadReminders,
  };
}