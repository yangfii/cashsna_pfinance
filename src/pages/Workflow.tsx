import React, { useState, useEffect } from 'react';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useWorkflow } from '@/hooks/useWorkflow';
import { useGoals } from '@/hooks/useGoals';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  Clock, 
  Target, 
  Calendar as CalendarIcon, 
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
  PauseCircle,
  Edit,
  Trash2,
  CalendarDays,
  Brain
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Goal, Step } from '@/hooks/useGoals';

const Workflow = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { 
    tasks, 
    habits, 
    habitEntries, 
    projects, 
    loading,
    createTask,
    createHabit,
    createProject,
    updateTask,
    deleteTask,
    logHabitEntry,
    getProductivityStats 
  } = useWorkflow();

  // Goals functionality
  const {
    goals,
    loading: goalsLoading,
    createGoal,
    updateGoal,
    deleteGoal: deleteGoalFromDB,
    toggleGoalCompletion,
    toggleStepCompletion: toggleStepCompletionDB,
    addStep: addStepToDB,
    removeStep: removeStepFromDB
  } = useGoals();

  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showHabitDialog, setShowHabitDialog] = useState(false);
  
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  // Goals states
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    goal_type: 'weekly' as 'weekly' | 'monthly' | 'yearly',
    period: '',
    color: '#3b82f6'
  });
  const [newStep, setNewStep] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    estimated_duration: 60,
    steps: [] as Array<{id: string, text: string, completed: boolean}>
  });

  const [newTaskStep, setNewTaskStep] = useState('');

  const [priorityFilter, setPriorityFilter] = useState('all');

  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    target_count: 1,
    color: 'blue',
    icon: 'circle'
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
    setNewTask({ title: '', description: '', priority: 'medium', due_date: '', estimated_duration: 60, steps: [] });
    setNewTaskStep('');
    setShowTaskDialog(false);
  };

  const handleEditTask = (task: any) => {
    setEditingTask({
      ...task,
      due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
      steps: task.steps || []
    });
    setShowEditTaskDialog(true);
  };

  const handleUpdateTask = async () => {
    if (editingTask) {
      await updateTask(editingTask.id, editingTask);
      setEditingTask(null);
      setShowEditTaskDialog(false);
    }
  };

  // Task step management functions
  const addTaskStep = () => {
    if (newTaskStep.trim()) {
      const step = {
        id: Date.now().toString(),
        text: newTaskStep.trim(),
        completed: false
      };
      setNewTask({...newTask, steps: [...newTask.steps, step]});
      setNewTaskStep('');
    }
  };

  const removeTaskStep = (stepId: string) => {
    setNewTask({...newTask, steps: newTask.steps.filter(s => s.id !== stepId)});
  };

  const toggleTaskStepCompletion = async (taskId: string, stepId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedSteps = (task.steps || []).map((step: any) => 
        step.id === stepId ? { ...step, completed: !step.completed } : step
      );
      await updateTask(taskId, { steps: updatedSteps });
    }
  };

  const addEditTaskStep = () => {
    if (editingTask && newTaskStep.trim()) {
      const step = {
        id: Date.now().toString(),
        text: newTaskStep.trim(),
        completed: false
      };
      setEditingTask({...editingTask, steps: [...(editingTask.steps || []), step]});
      setNewTaskStep('');
    }
  };

  const removeEditTaskStep = (stepId: string) => {
    if (editingTask) {
      setEditingTask({...editingTask, steps: (editingTask.steps || []).filter((s: any) => s.id !== stepId)});
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const handleCreateHabit = async () => {
    await createHabit(newHabit);
    setNewHabit({ name: '', description: '', frequency: 'daily', target_count: 1, color: 'blue', icon: 'circle' });
    setShowHabitDialog(false);
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
      case 'important': return 'destructive';
      case 'urgent': return 'destructive';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'secondary';
    }
  };

  const filteredTasks = priorityFilter === 'all' 
    ? tasks 
    : tasks.filter(task => task.priority === priorityFilter);

  // Goals helper functions
  const getCurrentPeriod = (goal_type: string) => {
    const now = new Date();
    switch (goal_type) {
      case 'weekly':
        return `Week ${Math.ceil(now.getDate() / 7)} of ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      case 'monthly':
        return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'yearly':
        return `Year ${now.getFullYear()}`;
      default:
        return '';
    }
  };

  const addStep = () => {
    if (newStep.trim()) {
      const step: Step = {
        id: Date.now().toString(),
        text: newStep.trim(),
        completed: false
      };
      setSteps([...steps, step]);
      setNewStep('');
    }
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(s => s.id !== stepId));
  };

  const handleSaveGoal = async () => {
    if (!newGoal.title.trim() || steps.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in the goal title and add at least one step",
        variant: "destructive"
      });
      return;
    }

    const goalData = {
      title: newGoal.title,
      description: newGoal.description,
      goal_type: newGoal.goal_type,
      period: newGoal.period || getCurrentPeriod(newGoal.goal_type),
      steps: steps,
      is_completed: false,
      color: newGoal.color
    };

    if (editingGoal) {
      await updateGoal(editingGoal.id, goalData);
    } else {
      await createGoal(goalData);
    }
    resetGoalForm();
  };

  const resetGoalForm = () => {
    setNewGoal({
      title: '',
      description: '',
      goal_type: 'weekly',
      period: '',
      color: '#3b82f6'
    });
    setSteps([]);
    setSelectedDate(undefined);
    setShowGoalDialog(false);
    setEditingGoal(null);
  };

  const handleDeleteGoal = async (goalId: string) => {
    await deleteGoalFromDB(goalId);
  };

  const handleToggleStepCompletion = async (goalId: string, stepId: string) => {
    await toggleStepCompletionDB(goalId, stepId);
  };

  const editGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      description: goal.description || '',
      goal_type: goal.goal_type,
      period: goal.period,
      color: goal.color || '#3b82f6'
    });
    setSteps(goal.steps);
    setSelectedDate(undefined);
    setShowGoalDialog(true);
  };

  const getTypeIcon = (goal_type: string) => {
    switch (goal_type) {
      case 'weekly':
        return <CalendarIcon className="h-4 w-4" />;
      case 'monthly':
        return <CalendarDays className="h-4 w-4" />;
      case 'yearly':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (goal_type: string) => {
    switch (goal_type) {
      case 'weekly':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'monthly':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'yearly':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
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

  if (loading || goalsLoading) {
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
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="habits" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Habits
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Management</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Label className="text-sm">Filter by priority:</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                            <SelectItem value="important">Important</SelectItem>
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
                    
                    {/* Steps section */}
                    <div>
                      <Label>Steps</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={newTaskStep}
                            onChange={(e) => setNewTaskStep(e.target.value)}
                            placeholder="Add a step..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addTaskStep();
                              }
                            }}
                          />
                          <Button type="button" onClick={addTaskStep} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {newTask.steps.length > 0 && (
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {newTask.steps.map((step) => (
                              <div key={step.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                                <span className="text-sm flex-1">{step.text}</span>
                                <Button
                                  type="button"
                                  onClick={() => removeTaskStep(step.id)}
                                  size="sm"
                                  variant="ghost"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button onClick={handleCreateTask} className="w-full">
                      Create Task
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {filteredTasks.map((task) => (
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
                            
                            {/* Display steps if any */}
                            {task.steps && task.steps.length > 0 && (
                              <div className="mt-3">
                                <div className="text-xs text-gray-500 mb-1">Steps:</div>
                                <div className="space-y-1">
                                  {task.steps.map((step: any) => (
                                    <div key={step.id} className="flex items-center gap-2 text-sm">
                                      <button 
                                        onClick={() => toggleTaskStepCompletion(task.id, step.id)}
                                        className="flex-shrink-0"
                                      >
                                        {step.completed ? (
                                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        ) : (
                                          <Circle className="h-3 w-3 text-gray-400" />
                                        )}
                                      </button>
                                      <span className={`${step.completed ? 'line-through text-gray-500' : ''}`}>
                                        {step.text}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={() => handleEditTask(task)}
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={() => handleDeleteTask(task.id)}
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Edit Task Dialog */}
            <Dialog open={showEditTaskDialog} onOpenChange={setShowEditTaskDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Task</DialogTitle>
                  <DialogDescription>Update task details</DialogDescription>
                </DialogHeader>
                {editingTask && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-title">Title</Label>
                      <Input
                        id="edit-title"
                        value={editingTask.title}
                        onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                        placeholder="Enter task title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editingTask.description || ''}
                        onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                        placeholder="Enter task description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-priority">Priority</Label>
                        <Select 
                          value={editingTask.priority} 
                          onValueChange={(value) => setEditingTask({...editingTask, priority: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="important">Important</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-duration">Duration (minutes)</Label>
                        <Input
                          id="edit-duration"
                          type="number"
                          value={editingTask.estimated_duration || ''}
                          onChange={(e) => setEditingTask({...editingTask, estimated_duration: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-due_date">Due Date</Label>
                      <Input
                        id="edit-due_date"
                        type="datetime-local"
                        value={editingTask.due_date}
                        onChange={(e) => setEditingTask({...editingTask, due_date: e.target.value})}
                      />
                     </div>
                     
                     {/* Steps section */}
                     <div>
                       <Label>Steps</Label>
                       <div className="space-y-2">
                         <div className="flex gap-2">
                           <Input
                             value={newTaskStep}
                             onChange={(e) => setNewTaskStep(e.target.value)}
                             placeholder="Add a step..."
                             onKeyPress={(e) => {
                               if (e.key === 'Enter') {
                                 e.preventDefault();
                                 addEditTaskStep();
                               }
                             }}
                           />
                           <Button type="button" onClick={addEditTaskStep} size="sm">
                             <Plus className="h-4 w-4" />
                           </Button>
                         </div>
                         {editingTask.steps && editingTask.steps.length > 0 && (
                           <div className="space-y-1 max-h-32 overflow-y-auto">
                             {editingTask.steps.map((step: any) => (
                               <div key={step.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                                 <button 
                                   onClick={() => {
                                     const updatedSteps = editingTask.steps.map((s: any) => 
                                       s.id === step.id ? { ...s, completed: !s.completed } : s
                                     );
                                     setEditingTask({...editingTask, steps: updatedSteps});
                                   }}
                                   className="flex-shrink-0"
                                 >
                                   {step.completed ? (
                                     <CheckCircle2 className="h-3 w-3 text-green-500" />
                                   ) : (
                                     <Circle className="h-3 w-3 text-gray-400" />
                                   )}
                                 </button>
                                 <span className={`text-sm flex-1 ${step.completed ? 'line-through text-gray-500' : ''}`}>
                                   {step.text}
                                 </span>
                                 <Button
                                   type="button"
                                   onClick={() => removeEditTaskStep(step.id)}
                                   size="sm"
                                   variant="ghost"
                                 >
                                   <Trash2 className="h-3 w-3" />
                                 </Button>
                               </div>
                             ))}
                           </div>
                         )}
                       </div>
                     </div>
                     
                     <Button onClick={handleUpdateTask} className="w-full">
                       Update Task
                     </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Goal Management</h2>
              <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
                    <DialogDescription>
                      {editingGoal ? 'Update your goal details' : 'Add a new goal to track your progress'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="goal-type">Goal Type</Label>
                      <Select 
                        value={newGoal.goal_type} 
                        onValueChange={(value: 'weekly' | 'monthly' | 'yearly') => setNewGoal({...newGoal, goal_type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly Goal</SelectItem>
                          <SelectItem value="monthly">Monthly Goal</SelectItem>
                          <SelectItem value="yearly">Yearly Goal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="goal-title">Title</Label>
                      <Input
                        id="goal-title"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                        placeholder="Enter goal title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="goal-description">Description</Label>
                      <Textarea
                        id="goal-description"
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                        placeholder="Describe your goal"
                      />
                    </div>

                    <div>
                      <Label htmlFor="goal-color">Color</Label>
                      <Input
                        id="goal-color"
                        type="color"
                        value={newGoal.color}
                        onChange={(e) => setNewGoal({...newGoal, color: e.target.value})}
                        className="w-full h-10"
                      />
                    </div>

                    <div>
                      <Label htmlFor="period">Period</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : <span>Select date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar 
                            mode="single" 
                            selected={selectedDate} 
                            onSelect={(date) => {
                              setSelectedDate(date);
                              if (date) {
                                setNewGoal({...newGoal, period: format(date, "PPP")});
                              }
                            }} 
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>Steps</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={newStep}
                            onChange={(e) => setNewStep(e.target.value)}
                            placeholder="Add a step"
                            onKeyPress={(e) => e.key === 'Enter' && addStep()}
                          />
                          <Button type="button" onClick={addStep}>Add</Button>
                        </div>
                        <div className="space-y-1">
                          {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                              <span className="flex-1">{step.text}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeStep(step.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleSaveGoal} className="w-full">
                      {editingGoal ? 'Update Goal' : 'Create Goal'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {goals.map((goal) => (
                <Card key={goal.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <button 
                          onClick={() => toggleGoalCompletion(goal.id)}
                          className="mt-1"
                        >
                          {goal.is_completed ? 
                            <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                            <Circle className="h-5 w-5 text-gray-400" />
                          }
                        </button>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${goal.is_completed ? 'line-through text-gray-500' : ''}`}>
                            {goal.title}
                          </h3>
                          {goal.description && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                              {goal.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={getTypeBadgeColor(goal.goal_type)}>
                              {getTypeIcon(goal.goal_type)}
                              <span className="ml-1">{goal.goal_type}</span>
                            </Badge>
                            <span className="text-sm text-gray-500">{goal.period}</span>
                          </div>
                          
                          {/* Steps */}
                          {goal.steps && goal.steps.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {goal.steps.map((step) => (
                                <div key={step.id} className="flex items-center gap-2 text-sm">
                                  <button
                                    onClick={() => handleToggleStepCompletion(goal.id, step.id)}
                                    className="flex-shrink-0"
                                  >
                                    {step.completed ? 
                                      <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                                      <Circle className="h-4 w-4 text-gray-400" />
                                    }
                                  </button>
                                  <span className={step.completed ? 'line-through text-gray-500' : ''}>
                                    {step.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editGoal(goal)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{goal.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteGoal(goal.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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