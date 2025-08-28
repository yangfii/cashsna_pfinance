import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkflow } from '@/hooks/useWorkflow';
import { useLanguage } from '@/hooks/useLanguage';
import { 
  CheckCircle2, 
  Clock, 
  Target, 
  Calendar, 
  Plus, 
  BarChart3, 
  Flame, 
  Timer,
  ListTodo,
  Zap,
  TrendingUp,
  CheckSquare,
  Circle,
  AlertCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { format } from 'date-fns';

const Workflow = () => {
  const { t } = useLanguage();
  const { 
    tasks, 
    habits, 
    habitEntries, 
    timeBlocks, 
    projects, 
    loading,
    createTask,
    createHabit,
    createTimeBlock,
    createProject,
    updateTask,
    logHabitEntry,
    getProductivityStats 
  } = useWorkflow();

  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showHabitDialog, setShowHabitDialog] = useState(false);
  const [showTimeBlockDialog, setShowTimeBlockDialog] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    estimated_duration: 60
  });

  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    target_count: 1,
    color: 'blue',
    icon: 'circle'
  });

  const [newTimeBlock, setNewTimeBlock] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    block_type: 'work',
    color: 'blue'
  });

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    color: 'blue',
    target_date: ''
  });

  const stats = getProductivityStats();
  const todayDate = new Date().toISOString().split('T')[0];

  const handleCreateTask = async () => {
    await createTask(newTask);
    setNewTask({ title: '', description: '', priority: 'medium', due_date: '', estimated_duration: 60 });
    setShowTaskDialog(false);
  };

  const handleCreateHabit = async () => {
    await createHabit(newHabit);
    setNewHabit({ name: '', description: '', frequency: 'daily', target_count: 1, color: 'blue', icon: 'circle' });
    setShowHabitDialog(false);
  };

  const handleCreateTimeBlock = async () => {
    await createTimeBlock(newTimeBlock);
    setNewTimeBlock({ title: '', description: '', start_time: '', end_time: '', block_type: 'work', color: 'blue' });
    setShowTimeBlockDialog(false);
  };

  const handleCreateProject = async () => {
    await createProject(newProject);
    setNewProject({ name: '', description: '', color: 'blue', target_date: '' });
    setShowProjectDialog(false);
  };

  const handleTaskStatusChange = async (taskId: string, status: string) => {
    await updateTask(taskId, { 
      status, 
      completed_at: status === 'completed' ? new Date().toISOString() : null 
    });
  };

  const handleHabitComplete = async (habitId: string) => {
    const existingEntry = habitEntries.find(
      entry => entry.habit_id === habitId && entry.date === todayDate
    );
    const currentCount = existingEntry?.completed_count || 0;
    await logHabitEntry(habitId, todayDate, currentCount + 1);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'todo': return <Circle className="h-4 w-4 text-gray-400" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-cyan-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 bg-gradient-to-r from-sky-300 to-cyan-300 dark:from-sky-700 dark:to-cyan-700 rounded-2xl p-8 text-gray-800 dark:text-white">
          <h1 className="text-4xl font-bold mb-2">
            Good morning, Alex! 👋
          </h1>
          <p className="text-lg mb-6 opacity-90">
            Ready to make today productive? Here's your personal workflow dashboard.
          </p>
          <div className="flex gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
              Start Focus Session
            </Button>
            <Button variant="outline" className="border-white/20 text-gray-800 dark:text-white hover:bg-white/10">
              Review Goals
            </Button>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Focus Time */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Focus Time</span>
                </div>
                <span className="text-sm font-medium text-green-600">+12%</span>
              </div>
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">6h 32m</span>
              </div>
              <div className="mb-2">
                <span className="text-sm text-gray-500">Progress</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white ml-auto block">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </CardContent>
          </Card>

          {/* Goals Achieved */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Goals Achieved</span>
                </div>
                <span className="text-sm font-medium text-green-600">+3</span>
              </div>
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">8/12</span>
              </div>
              <div className="mb-2">
                <span className="text-sm text-gray-500">Progress</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white ml-auto block">67%</span>
              </div>
              <Progress value={67} className="h-2" />
            </CardContent>
          </Card>

          {/* Productivity Score */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Productivity Score</span>
                </div>
                <span className="text-sm font-medium text-green-600">+8%</span>
              </div>
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">92%</span>
              </div>
              <div className="mb-2">
                <span className="text-sm text-gray-500">Progress</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white ml-auto block">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </CardContent>
          </Card>

          {/* Weekly Streak */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Weekly Streak</span>
                </div>
                <span className="text-orange-600">🔥</span>
              </div>
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">5 days</span>
              </div>
              <div className="mb-2">
                <span className="text-sm text-gray-500">Progress</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white ml-auto block">71%</span>
              </div>
              <Progress value={71} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Tasks */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">Today's Tasks</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">2 remaining</span>
                    <Button size="sm" className="w-8 h-8 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input type="text" placeholder="Add a new task..." className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Circle className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <span className="font-medium">Review quarterly reports</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="destructive" className="text-xs">High</Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            2:00 PM
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">×</Button>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Circle className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <span className="font-medium">Call client about project update</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">Medium</Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            3:30 PM
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">×</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-xl font-bold">Today's Schedule</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">7 blocks</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Schedule Item */}
                  <div className="flex items-start gap-4 p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-r-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-300 min-w-[80px]">
                      9:00 AM - 9:30 AM
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Morning Planning</span>
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Focus</Badge>
                      </div>
                      <div className="text-sm text-gray-500">Progress: 100%</div>
                      <Progress value={100} className="h-1 mt-2" />
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-300 min-w-[80px]">
                      9:30 AM - 11:30 AM
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Deep Work Session</span>
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">Focus</Badge>
                      </div>
                      <div className="text-sm text-gray-500">Progress: 60%</div>
                      <Progress value={60} className="h-1 mt-2" />
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-r-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-300 min-w-[80px]">
                      11:30 AM - 12:00 PM
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Team Standup</span>
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">Meeting</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
                  <div className="text-2xl font-bold mb-2">Keep up the great work! 🎯</div>
                  <div className="text-gray-600 dark:text-gray-300 mb-4">
                    You're on track to have your most productive day yet.
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" size="sm">View Analytics</Button>
                    <Button variant="outline" size="sm">Export Data</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Daily Habits */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg font-bold">Daily Habits</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Plus className="h-4 w-4 text-green-500" />
                    <Badge variant="secondary" className="bg-green-100 text-green-800">50% Complete</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Habit Item */}
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💪</span>
                        <span className="font-medium">Morning Exercise</span>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">7</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      7 day streak • Target: 30 days
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Circle className="h-5 w-5 text-gray-400" />
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📚</span>
                        <span className="font-medium">Read for 30min</span>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">12</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      12 day streak • Target: 365 days
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Circle className="h-5 w-5 text-gray-400" />
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💧</span>
                        <span className="font-medium">Drink 8 glasses of water</span>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">5</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      5 day streak • Target: 30 days
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Progress */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg font-bold">Today's Progress</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <span className="text-2xl font-bold">2 of 4 completed</span>
                </div>
                <Progress value={50} className="h-3 mb-4" />
                <div className="text-center text-gray-600 dark:text-gray-300">
                  You're halfway there! Keep going! 💪
                </div>
              </CardContent>
            </Card>

            {/* Quick Notes */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    <CardTitle className="text-lg font-bold">Quick Notes</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">📌</span>
                    <span className="text-sm text-gray-500">2 notes</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <textarea 
                  placeholder="Jot down your thoughts, ideas, or reminders..."
                  className="w-full h-20 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-between items-center mt-4">
                  <Button variant="secondary" size="sm">Save Note</Button>
                  <Button variant="ghost" size="sm">Cancel</Button>
                </div>

                {/* Recent Notes */}
                <div className="mt-6 space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">work</Badge>
                      <span className="text-xs text-gray-500">2h ago</span>
                    </div>
                    <p className="text-sm">Remember to follow up on the client proposal by Friday. They seemed interested in the advanced analytics package.</p>
                  </div>

                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">idea</Badge>
                      <span className="text-xs text-gray-500">5h ago</span>
                    </div>
                    <p className="text-sm">Idea: Create a personal dashboard that shows all important metrics in one place. Could be a great side project.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workflow;