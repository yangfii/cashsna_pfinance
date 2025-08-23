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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-teal-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Personal Workflow Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your tasks, habits, and time blocks for maximum productivity
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Task Completion</p>
                  <p className="text-3xl font-bold">{stats.taskCompletion}%</p>
                </div>
                <CheckSquare className="h-8 w-8 text-blue-200" />
              </div>
              <Progress value={stats.taskCompletion} className="mt-3 bg-blue-400/30" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm font-medium">Today's Habits</p>
                  <p className="text-3xl font-bold">{stats.habitsCompleted}/{stats.totalActiveHabits}</p>
                </div>
                <Flame className="h-8 w-8 text-teal-200" />
              </div>
              <Progress 
                value={stats.totalActiveHabits > 0 ? (stats.habitsCompleted / stats.totalActiveHabits) * 100 : 0} 
                className="mt-3 bg-teal-400/30" 
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Time Blocks</p>
                  <p className="text-3xl font-bold">{stats.timeBlockCompletion}%</p>
                </div>
                <Timer className="h-8 w-8 text-purple-200" />
              </div>
              <Progress value={stats.timeBlockCompletion} className="mt-3 bg-purple-400/30" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Total Tasks</p>
                  <p className="text-3xl font-bold">{stats.totalTasks}</p>
                </div>
                <ListTodo className="h-8 w-8 text-orange-200" />
              </div>
              <div className="mt-3 text-sm text-orange-100">
                {stats.completedTasks} completed
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="habits" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Habits
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Time Blocks
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Management</h2>
              <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>Add a new task to your workflow</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        placeholder="Enter task title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newTask.description}
                        onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                        placeholder="Enter task description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={newTask.estimated_duration}
                          onChange={(e) => setNewTask({...newTask, estimated_duration: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input
                        id="due_date"
                        type="datetime-local"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                      />
                    </div>
                    <Button onClick={handleCreateTask} className="w-full">
                      Create Task
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {tasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <button 
                          onClick={() => handleTaskStatusChange(task.id, task.status === 'completed' ? 'todo' : 'completed')}
                          className="mt-1"
                        >
                          {getStatusIcon(task.status)}
                        </button>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={getPriorityColor(task.priority) as any}>
                              {task.priority}
                            </Badge>
                            {task.due_date && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="h-3 w-3" />
                                {format(new Date(task.due_date), 'MMM d, HH:mm')}
                              </div>
                            )}
                            {task.estimated_duration && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Timer className="h-3 w-3" />
                                {task.estimated_duration}m
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Habits Tab */}
          <TabsContent value="habits" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Habit Tracker</h2>
              <Dialog open={showHabitDialog} onOpenChange={setShowHabitDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Habit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Habit</DialogTitle>
                    <DialogDescription>Start tracking a new habit</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="habit-name">Habit Name</Label>
                      <Input
                        id="habit-name"
                        value={newHabit.name}
                        onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                        placeholder="e.g., Drink 8 glasses of water"
                      />
                    </div>
                    <div>
                      <Label htmlFor="habit-description">Description</Label>
                      <Textarea
                        id="habit-description"
                        value={newHabit.description}
                        onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                        placeholder="Describe your habit"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select value={newHabit.frequency} onValueChange={(value) => setNewHabit({...newHabit, frequency: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="target">Target Count</Label>
                        <Input
                          id="target"
                          type="number"
                          value={newHabit.target_count}
                          onChange={(e) => setNewHabit({...newHabit, target_count: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    <Button onClick={handleCreateHabit} className="w-full">
                      Create Habit
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {habits.filter(habit => habit.is_active).map((habit) => {
                const todayEntry = habitEntries.find(
                  entry => entry.habit_id === habit.id && entry.date === todayDate
                );
                const completedToday = todayEntry?.completed_count || 0;
                const progress = Math.min((completedToday / habit.target_count) * 100, 100);

                return (
                  <Card key={habit.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{habit.name}</h3>
                          {habit.description && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                              {habit.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <div className="text-sm text-gray-500">
                              {completedToday}/{habit.target_count} today
                            </div>
                            <div className="flex items-center gap-1 text-sm text-orange-500">
                              <Flame className="h-3 w-3" />
                              {habit.streak_count} day streak
                            </div>
                          </div>
                          <Progress value={progress} className="mt-2" />
                        </div>
                        <Button
                          onClick={() => handleHabitComplete(habit.id)}
                          disabled={completedToday >= habit.target_count}
                          size="sm"
                          className="ml-4"
                        >
                          {completedToday >= habit.target_count ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Time Blocks Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Time Blocking</h2>
              <Dialog open={showTimeBlockDialog} onOpenChange={setShowTimeBlockDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Time Block
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Time Block</DialogTitle>
                    <DialogDescription>Schedule a focused work session</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="block-title">Title</Label>
                      <Input
                        id="block-title"
                        value={newTimeBlock.title}
                        onChange={(e) => setNewTimeBlock({...newTimeBlock, title: e.target.value})}
                        placeholder="Enter time block title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="block-description">Description</Label>
                      <Textarea
                        id="block-description"
                        value={newTimeBlock.description}
                        onChange={(e) => setNewTimeBlock({...newTimeBlock, description: e.target.value})}
                        placeholder="What will you work on?"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-time">Start Time</Label>
                        <Input
                          id="start-time"
                          type="datetime-local"
                          value={newTimeBlock.start_time}
                          onChange={(e) => setNewTimeBlock({...newTimeBlock, start_time: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-time">End Time</Label>
                        <Input
                          id="end-time"
                          type="datetime-local"
                          value={newTimeBlock.end_time}
                          onChange={(e) => setNewTimeBlock({...newTimeBlock, end_time: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="block-type">Type</Label>
                      <Select value={newTimeBlock.block_type} onValueChange={(value) => setNewTimeBlock({...newTimeBlock, block_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="break">Break</SelectItem>
                          <SelectItem value="focus">Focus</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="exercise">Exercise</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateTimeBlock} className="w-full">
                      Create Time Block
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {timeBlocks.slice(0, 10).map((block) => (
                <Card key={block.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{block.title}</h3>
                          <Badge variant="outline">{block.block_type}</Badge>
                          {block.is_completed && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        {block.description && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                            {block.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {format(new Date(block.start_time), 'MMM d, HH:mm')} - {format(new Date(block.end_time), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Productivity Analytics</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Tasks</span>
                      <span className="font-semibold">{stats.totalTasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed Tasks</span>
                      <span className="font-semibold text-green-600">{stats.completedTasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Habits</span>
                      <span className="font-semibold">{stats.totalActiveHabits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Habits Completed Today</span>
                      <span className="font-semibold text-blue-600">{stats.habitsCompleted}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Task Completion Rate</span>
                        <span>{stats.taskCompletion}%</span>
                      </div>
                      <Progress value={stats.taskCompletion} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Time Block Completion</span>
                        <span>{stats.timeBlockCompletion}%</span>
                      </div>
                      <Progress value={stats.timeBlockCompletion} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Daily Habit Progress</span>
                        <span>{stats.totalActiveHabits > 0 ? Math.round((stats.habitsCompleted / stats.totalActiveHabits) * 100) : 0}%</span>
                      </div>
                      <Progress 
                        value={stats.totalActiveHabits > 0 ? (stats.habitsCompleted / stats.totalActiveHabits) * 100 : 0} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Workflow;