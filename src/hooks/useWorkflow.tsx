import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// Use the actual database types from Supabase
type DbTask = {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  due_date?: string | null;
  completed_at?: string | null;
  estimated_duration?: number | null;
  actual_duration?: number | null;
  tags: string[];
  project_id?: string | null;
  parent_task_id?: string | null;
  steps?: Array<{id: string, text: string, completed: boolean}> | null;
  created_at: string;
  updated_at: string;
};

type DbHabit = {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  frequency: string;
  target_count: number;
  color: string;
  icon: string;
  is_active: boolean;
  streak_count: number;
  best_streak: number;
  total_completions: number;
  created_at: string;
  updated_at: string;
};

type DbHabitEntry = {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  completed_count: number;
  notes?: string | null;
  created_at: string;
};


type DbProject = {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  color: string;
  status: string;
  target_date?: string | null;
  created_at: string;
  updated_at: string;
};

export const useWorkflow = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [habits, setHabits] = useState<DbHabit[]>([]);
  const [habitEntries, setHabitEntries] = useState<DbHabitEntry[]>([]);
  
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all workflow data
  const fetchWorkflowData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const [tasksRes, habitsRes, habitEntriesRes, projectsRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('habit_entries').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (habitsRes.error) throw habitsRes.error;
      if (habitEntriesRes.error) throw habitEntriesRes.error;
      if (projectsRes.error) throw projectsRes.error;

      setTasks((tasksRes.data || []).map(task => ({
        ...task,
        steps: task.steps ? JSON.parse(JSON.stringify(task.steps)) as Array<{id: string, text: string, completed: boolean}> : []
      })));
      setHabits(habitsRes.data || []);
      setHabitEntries(habitEntriesRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (error) {
      console.error('Error fetching workflow data:', error);
      toast({
        title: "Error",
        description: "Failed to load workflow data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Task operations
  const createTask = async (taskData: {
    title: string;
    description?: string;
    priority?: string;
    status?: string;
    due_date?: string;
    estimated_duration?: number;
    tags?: string[];
    project_id?: string;
    steps?: Array<{id: string, text: string, completed: boolean}>;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [{
        ...data,
        steps: data.steps ? JSON.parse(JSON.stringify(data.steps)) as Array<{id: string, text: string, completed: boolean}> : []
      }, ...prev]);
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const updateTask = async (taskId: string, updates: Partial<DbTask>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => prev.map(task => task.id === taskId ? {
        ...data,
        steps: data.steps ? JSON.parse(JSON.stringify(data.steps)) as Array<{id: string, text: string, completed: boolean}> : []
      } : task));
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  // Habit operations
  const createHabit = async (habitData: {
    name: string;
    description?: string;
    frequency?: string;
    target_count?: number;
    color?: string;
    icon?: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert([{ ...habitData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setHabits(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Habit created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating habit:', error);
      toast({
        title: "Error",
        description: "Failed to create habit",
        variant: "destructive",
      });
    }
  };

  const logHabitEntry = async (habitId: string, date: string, completedCount: number, notes?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habit_entries')
        .upsert({
          habit_id: habitId,
          user_id: user.id,
          date,
          completed_count: completedCount,
          notes
        })
        .select()
        .single();

      if (error) throw error;

      setHabitEntries(prev => {
        const filtered = prev.filter(entry => !(entry.habit_id === habitId && entry.date === date));
        return [data, ...filtered];
      });

      toast({
        title: "Success",
        description: "Habit logged successfully",
      });
      return data;
    } catch (error) {
      console.error('Error logging habit:', error);
      toast({
        title: "Error",
        description: "Failed to log habit",
        variant: "destructive",
      });
    }
  };

  const updateHabit = async (habitId: string, updates: Partial<DbHabit>) => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', habitId)
        .select()
        .single();

      if (error) throw error;

      setHabits(prev => prev.map(habit => habit.id === habitId ? data : habit));
      return data;
    } catch (error) {
      console.error('Error updating habit:', error);
      toast({
        title: "Error",
        description: "Failed to update habit",
        variant: "destructive",
      });
    }
  };


  // Project operations
  const createProject = async (projectData: {
    name: string;
    description?: string;
    color?: string;
    status?: string;
    target_date?: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ ...projectData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchWorkflowData();
    }
  }, [user]);

  // Calculate productivity stats
  const getProductivityStats = () => {
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const activeHabits = habits.filter(habit => habit.is_active).length;
    const todayEntries = habitEntries.filter(entry => entry.date === new Date().toISOString().split('T')[0]);
    const todayCompletedHabits = todayEntries.length;


    return {
      taskCompletion: Math.round(completionRate),
      habitsCompleted: todayCompletedHabits,
      totalActiveHabits: activeHabits,
      totalTasks,
      completedTasks
    };
  };

  return {
    // Data
    tasks,
    habits,
    habitEntries,
    projects,
    loading,
    
    // Task operations
    createTask,
    updateTask,
    deleteTask,
    
    // Habit operations
    createHabit,
    updateHabit,
    logHabitEntry,
    
    
    // Project operations
    createProject,
    
    // Utils
    refetch: fetchWorkflowData,
    getProductivityStats
  };
};