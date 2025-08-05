import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AIAssistant from "@/components/AIAssistant";
import { AddReminderDialog } from "@/components/reminders/AddReminderDialog";
import { RemindersList } from "@/components/reminders/RemindersList";
import { useReminders } from "@/hooks/useReminders";
import { useGoals } from "@/hooks/useGoals";
import { Plus, Calendar as CalendarIcon, Target, CheckCircle2, Circle, Edit, Trash2, CalendarDays, TrendingUp, Brain, Clock, Play, Pause, Square, Timer, Bell, Palette, Upload, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";
import type { Goal, Step } from "@/hooks/useGoals";
export default function Planning() {
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("goals");
  const [showNote, setShowNote] = useState(false);
  const {
    theme
  } = useTheme();
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    goal_type: 'weekly' as 'weekly' | 'monthly' | 'yearly',
    period: ''
  });
  const [newStep, setNewStep] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();

  // Focus time states
  const [focusTime, setFocusTime] = useState(25); // minutes
  const [remainingTime, setRemainingTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const {
    toast
  } = useToast();
  const {
    getUpcomingReminders,
    getOverdueReminders
  } = useReminders();

  // Focus timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime(time => {
          if (time <= 1) {
            setIsTimerRunning(false);
            toast({
              title: "Focus Session Complete!",
              description: `Great job! You've completed a ${focusTime}-minute focus session${selectedGoal ? ` on "${selectedGoal.title}"` : ''}.`
            });
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, remainingTime, focusTime, selectedGoal, toast]);
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
  const getCurrentPeriod = (goal_type: string) => {
    const now = new Date();
    switch (goal_type) {
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `Week ${Math.ceil(now.getDate() / 7)} of ${now.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        })}`;
      case 'monthly':
        return now.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        });
      case 'yearly':
        return `Year ${now.getFullYear()}`;
      default:
        return '';
    }
  };
  const handleSaveGoal = async () => {
    if (!newGoal.title.trim() || steps.length === 0) {
      toast({
        title: "កំហុស",
        description: "សូមបំពេញចំណងជើងគោលដៅ និងយ៉ាងហោចណាស់មួយជំហាន",
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
      is_completed: false
    };
    if (editingGoal) {
      await updateGoal(editingGoal.id, goalData);
    } else {
      await createGoal(goalData);
    }
    resetForm();
  };
  const resetForm = () => {
    setNewGoal({
      title: '',
      description: '',
      goal_type: 'weekly',
      period: ''
    });
    setSteps([]);
    setSelectedDate(undefined);
    setShowAddForm(false);
    setEditingGoal(null);
  };
  const handleDeleteGoal = async (goalId: string) => {
    await deleteGoalFromDB(goalId);
  };
  const handleToggleStepCompletion = async (goalId: string, stepId: string) => {
    await toggleStepCompletionDB(goalId, stepId);
  };
  const editGoal = (goal: Goal) => {
    console.log('editGoal called with goal:', goal);
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      description: goal.description || '',
      goal_type: goal.goal_type,
      period: goal.period
    });
    setSteps(goal.steps);
    setSelectedDate(undefined); // Reset date when editing
    setShowAddForm(true);
    console.log('showAddForm set to true');
  };

  // Focus timer functions
  const startFocusSession = (goal?: Goal) => {
    setSelectedGoal(goal || null);
    setRemainingTime(focusTime * 60);
    setIsTimerRunning(true);
    setShowFocusTimer(true);
    toast({
      title: "Focus Session Started",
      description: `Starting ${focusTime}-minute focus session${goal ? ` for "${goal.title}"` : ''}.`
    });
  };
  const pauseTimer = () => {
    setIsTimerRunning(false);
  };
  const resumeTimer = () => {
    if (remainingTime > 0) {
      setIsTimerRunning(true);
    }
  };
  const stopTimer = () => {
    setIsTimerRunning(false);
    setRemainingTime(0);
    setSelectedGoal(null);
    setShowFocusTimer(false);
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
  const weeklyGoals = goals.filter(g => g.goal_type === 'weekly');
  const monthlyGoals = goals.filter(g => g.goal_type === 'monthly');
  const yearlyGoals = goals.filter(g => g.goal_type === 'yearly');

  // Load background image from localStorage
  useEffect(() => {
    const savedBackground = localStorage.getItem('planning-background');
    if (savedBackground) {
      setBackgroundImage(savedBackground);
    }
  }, []);
  return <div className="min-h-screen space-y-6 animate-fade-in relative" style={{
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--primary) / 0.05) 50%, hsl(var(--secondary) / 0.08) 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  }}>
      {/* Dreamy background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/40 to-background/60 backdrop-blur-[1px]" />
      
      {/* Header */}
      <div className="relative z-10 glass-panel p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ការរៀបចំគំរោង
            </h1>
            <p className="text-muted-foreground">គ្រប់គ្រងគោលដៅរបស់អ្នកតាមសប្តាហ៍ ខែ និងឆ្នាំ</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveTab("customization")} className="gap-2 glass-effect hover:scale-105 transition-all duration-300">
              <Palette className="h-4 w-4" />
              ការកំណត់រូបរាង
            </Button>
            <Button onClick={() => setShowAddForm(true)} className="gap-2 glass-effect hover:scale-105 transition-all duration-300">
              <Plus className="h-4 w-4" />
              បន្ថែមគោលដៅថ្មី
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="glass-overlay p-2 rounded-xl mb-6">
            {/* iPhone Note Button */}
            
            
            {showNote}
            
            <TabsList className="grid w-full grid-cols-3 bg-transparent border-0">
              <TabsTrigger value="goals" className="flex items-center gap-2 glass-card data-[state=active]:glass-strong">
                <Target className="h-4 w-4" />
                គោលដៅ
              </TabsTrigger>
              <TabsTrigger value="reminders" className="flex items-center gap-2 glass-card data-[state=active]:glass-strong">
                <Bell className="h-4 w-4" />
                note
                {getUpcomingReminders().length > 0 && <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                    {getUpcomingReminders().length}
                  </Badge>}
              </TabsTrigger>
              <TabsTrigger value="ai-assistant" className="flex items-center gap-2 glass-card data-[state=active]:glass-strong">
                <Brain className="h-4 w-4" />
                AI
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="goals" className="mt-6 space-y-6">
            {/* Add/Edit Goal Form */}
            {showAddForm && <div className="glass-panel p-6 animate-slide-down">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground">{editingGoal ? 'កែប្រែគោលដៅ' : 'បន្ថែមគោលដៅថ្មី'}</h3>
                </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">ប្រភេទគោលដៅ</label>
                   <Select value={newGoal.goal_type} onValueChange={(value: 'weekly' | 'monthly' | 'yearly') => setNewGoal({
                  ...newGoal,
                  goal_type: value
                })}>
                     <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">គោលដៅប្រចាំសប្តាហ៍</SelectItem>
                      <SelectItem value="monthly">គោលដៅប្រចាំខែ</SelectItem>
                      <SelectItem value="yearly">គោលដៅប្រចាំឆ្នាំ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">កាលបរិច្ឆេទ</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>ជ្រើសរើសកាលបរិច្ឆេទ</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={selectedDate} onSelect={date => {
                      setSelectedDate(date);
                      if (date) {
                        setNewGoal({
                          ...newGoal,
                          period: format(date, "PPP")
                        });
                      }
                    }} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">ចំណងជើងគោលដៅ</label>
                  <Input placeholder="បញ្ចូលគោលដៅរបស់អ្នក..." value={newGoal.title} onChange={e => setNewGoal({
                  ...newGoal,
                  title: e.target.value
                })} />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">ពិពណ៌នា (ស្រេចចិត្ត)</label>
                  <Textarea placeholder="ពិពណ៌នាលម្អិតអំពីគោលដៅ..." value={newGoal.description} onChange={e => setNewGoal({
                  ...newGoal,
                  description: e.target.value
                })} />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">ជំហានសម្រាប់សម្រេចគោលដៅ</label>
                  <div className="flex gap-2 mb-3">
                    <Input placeholder="បន្ថែមជំហានថ្មី..." value={newStep} onChange={e => setNewStep(e.target.value)} onKeyPress={e => e.key === 'Enter' && addStep()} />
                    <Button type="button" onClick={addStep} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {steps.length > 0 && <div className="space-y-2">
                      {steps.map((step, index) => <div key={step.id} className="flex items-center gap-2 p-2 border rounded">
                          <span className="text-sm text-muted-foreground">ជំហាន {index + 1}:</span>
                          <span className="flex-1">{step.text}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeStep(step.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>)}
                    </div>}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveGoal} className="flex-1">
                    {editingGoal ? 'រក្សាទុក' : 'រក្សាទុក'}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    បោះបង់
                  </Button>
                </div>
                </div>
              </div>}

          {/* Goals Display */}
          <div className="space-y-8">
            {/* Weekly Goals */}
            {weeklyGoals.length > 0 && <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  គោលដៅប្រចាំសប្តាហ៍
                </h2>
                 <div className="grid gap-4">
                  {weeklyGoals.map(goal => <div key={goal.id} className="glass-card p-6 hover:scale-[1.02] transition-all duration-300">
                      <div className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getTypeBadgeColor(goal.goal_type)}>
                                {getTypeIcon(goal.goal_type)}
                                <span className="ml-1">សប្តាហ៍</span>
                              </Badge>
                              {goal.is_completed && <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  បានបញ្ចប់
                                </Badge>}
                            </div>
                            <h3 className="text-lg font-semibold">{goal.title}</h3>
                            <p className="text-sm text-muted-foreground">{goal.period}</p>
                            {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => editGoal(goal)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>លុបគោលដៅ</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    តើអ្នកប្រាកដជាចង់លុបគោលដៅនេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>បោះបង់</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteGoal(goal.id)}>
                                    លុប
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">ជំហានដែលត្រូវអនុវត្ត:</h4>
                          {goal.steps.map(step => <div key={step.id} className="flex items-center gap-2">
                              <button onClick={() => handleToggleStepCompletion(goal.id, step.id)} className="flex-shrink-0">
                                {step.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                              </button>
                              <span className={`text-sm ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {step.text}
                              </span>
                            </div>)}
                        </div>
                      </div>
                    </div>)}
                </div>
              </div>}

            {/* Monthly Goals */}
            {monthlyGoals.length > 0 && <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  គោលដៅប្រចាំខែ
                </h2>
                <div className="grid gap-4">
                  {monthlyGoals.map(goal => <div key={goal.id} className="glass-card p-6 hover:scale-[1.02] transition-all duration-300">
                      <div className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getTypeBadgeColor(goal.goal_type)}>
                                {getTypeIcon(goal.goal_type)}
                                <span className="ml-1">ខែ</span>
                              </Badge>
                              {goal.is_completed && <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  បានបញ្ចប់
                                </Badge>}
                            </div>
                            <h3 className="text-lg font-semibold">{goal.title}</h3>
                            <p className="text-sm text-muted-foreground">{goal.period}</p>
                            {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => {
                          console.log('Edit button clicked');
                          editGoal(goal);
                        }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>លុបគោលដៅ</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    តើអ្នកប្រាកដជាចង់លុបគោលដៅនេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>បោះបង់</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteGoal(goal.id)}>
                                    លុប
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">ជំហានដែលត្រូវអនុវត្ត:</h4>
                          {goal.steps.map(step => <div key={step.id} className="flex items-center gap-2">
                              <button onClick={() => handleToggleStepCompletion(goal.id, step.id)} className="flex-shrink-0">
                                {step.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                              </button>
                              <span className={`text-sm ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {step.text}
                              </span>
                            </div>)}
                        </div>
                      </div>
                    </div>)}
                </div>
              </div>}

            {/* Yearly Goals */}
            {yearlyGoals.length > 0 && <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  គោលដៅប្រចាំឆ្នាំ
                </h2>
                 <div className="grid gap-4">
                  {yearlyGoals.map(goal => <div key={goal.id} className="glass-card p-6 hover:scale-[1.02] transition-all duration-300">
                      <div className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getTypeBadgeColor(goal.goal_type)}>
                                {getTypeIcon(goal.goal_type)}
                                <span className="ml-1">ឆ្នាំ</span>
                              </Badge>
                              {goal.is_completed && <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  បានបញ្ចប់
                                </Badge>}
                            </div>
                            <h3 className="text-lg font-semibold">{goal.title}</h3>
                            <p className="text-sm text-muted-foreground">{goal.period}</p>
                            {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => editGoal(goal)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>លុបគោលដៅ</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    តើអ្នកប្រាកដជាចង់លុបគោលដៅនេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>បោះបង់</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteGoal(goal.id)}>
                                    លុប
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">ជំហានដែលត្រូវអនុវត្ត:</h4>
                          {goal.steps.map(step => <div key={step.id} className="flex items-center gap-2">
                              <button onClick={() => handleToggleStepCompletion(goal.id, step.id)} className="flex-shrink-0">
                                {step.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                              </button>
                              <span className={`text-sm ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {step.text}
                              </span>
                            </div>)}
                        </div>
                      </div>
                    </div>)}
                </div>
              </div>}

            {/* Empty State */}
            {goals.length === 0 && <div className="glass-panel text-center py-12">
                <Target className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary transition-colors duration-1000" style={{
                animation: 'pulse 2s ease-in-out infinite, colorShift 3s ease-in-out infinite'
              }} />
                <h3 className="text-lg font-medium mb-2">មិនទាន់មានគោលដៅ</h3>
                <p className="text-muted-foreground mb-4">
                  ចាប់ផ្តើមដោយការបន្ថែមគោលដៅប្រចាំសប្តាហ៍ ខែ ឬឆ្នាំរបស់អ្នក
                </p>
                <Button onClick={() => setShowAddForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  បន្ថែមគោលដៅដំបូង
                </Button>
              </div>}
          </div>

          {/* Tips Card */}
          <div className="glass-panel p-6 hover:scale-[1.02] transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                គន្លឹះសម្រាប់សរសេរគោលដៅល្អ
              </h3>
            </div>
            <div className="space-y-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3 p-3 glass-overlay rounded-lg hover:scale-105 transition-all duration-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>ជ្រើសរើសគោលដៅច្បាស់លាស់ និងជាក់លាក់ (SMART Goals)</span>
                </li>
                <li className="flex items-start gap-3 p-3 glass-overlay rounded-lg hover:scale-105 transition-all duration-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>បំបែកវាទៅជាជំហានដែលអាចធ្វើបាន</span>
                </li>
                <li className="flex items-start gap-3 p-3 glass-overlay rounded-lg hover:scale-105 transition-all duration-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>ចាប់ផ្តើមតូចៗ ហើយបង្កើនបន្តិចម្តង</span>
                </li>
                <li className="flex items-start gap-3 p-3 glass-overlay rounded-lg hover:scale-105 transition-all duration-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>ពិនិត្យ និងតាមដានការវិឱ្ឌឍន៍ជាទៀងទាត់</span>
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reminders" className="mt-6 space-y-6">
          {/* Reminders Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">note</h2>
                <p className="text-muted-foreground">
                  គ្រប់គ្រងការរំលឹក ព្រឹត្តិការណ៍ និងការងារសំខាន់ៗ
                </p>
              </div>
              <AddReminderDialog>
                <Button className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  បន្ថែមការរំលឹកថ្មី
                </Button>
              </AddReminderDialog>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 group-hover:from-yellow-400/30 group-hover:to-orange-500/30 transition-all duration-300">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">ខាងមុខ (២៤ម៉ោង)</span>
                </div>
                <p className="text-3xl font-bold text-yellow-600 mb-1">
                  {getUpcomingReminders().length}
                </p>
                <div className="h-1 w-full bg-gradient-to-r from-yellow-400/30 to-orange-500/30 rounded-full" />
              </div>
              
              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-red-400/20 to-pink-500/20 group-hover:from-red-400/30 group-hover:to-pink-500/30 transition-all duration-300">
                    <Bell className="h-5 w-5 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">ហួសកំណត់</span>
                </div>
                <p className="text-3xl font-bold text-red-600 mb-1">
                  {getOverdueReminders().length}
                </p>
                <div className="h-1 w-full bg-gradient-to-r from-red-400/30 to-pink-500/30 rounded-full" />
              </div>
              
              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-500/20 group-hover:from-green-400/30 group-hover:to-emerald-500/30 transition-all duration-300">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">សរុបសកម្ម</span>
                </div>
                <p className="text-3xl font-bold text-green-600 mb-1">
                  {getUpcomingReminders().length + getOverdueReminders().length}
                </p>
                <div className="h-1 w-full bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-full" />
              </div>
            </div>

            <RemindersList />
          </div>

        </TabsContent>

        <TabsContent value="ai-assistant" className="mt-6">
          <AIAssistant />
        </TabsContent>

        <TabsContent value="customization" className="mt-6 space-y-6">
          <div className="glass-panel p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Palette className="h-5 w-5" />
                ការកំណត់រូបរាង
              </h3>
              <p className="text-muted-foreground">
                កែប្រែពណ៌ និងរូបភាពផ្ទៃខាងក្រោយ
              </p>
            </div>
            <div className="space-y-6">
              {/* Theme Selection */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">ប្រព័ន្ធពណ៌</label>
                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <span className="text-sm text-muted-foreground">
                      ពណ៌បច្ចុប្បន្ន: {theme === 'dark' ? 'ងងឹត' : theme === 'light' ? 'ភ្លឺ' : 'ស្វ័យប្រវត្តិ'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Background Image Upload */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">រូបភាពផ្ទៃខាងក្រោយ</label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <div className="text-center space-y-4">
                      <Image className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <label htmlFor="background-upload" className="cursor-pointer">
                          <Button variant="outline" className="gap-2" asChild>
                            <span>
                              <Upload className="h-4 w-4" />
                              ជ្រើសរើសរូបភាព
                            </span>
                          </Button>
                        </label>
                        <input id="background-upload" type="file" accept="image/*" className="hidden" onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = event => {
                              const result = event.target?.result as string;
                              setBackgroundImage(result);
                              localStorage.setItem('planning-background', result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        បញ្ចូលរូបភាពពីឧបករណ៍របស់អ្នក (JPG, PNG, GIF)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Background Preview */}
                {backgroundImage && <div className="space-y-2">
                    <label className="text-sm font-medium">មុខតាវ</label>
                    <div className="relative">
                      <img src={backgroundImage} alt="Background preview" className="w-full h-32 object-cover rounded-lg" />
                      <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => {
                      setBackgroundImage(null);
                      localStorage.removeItem('planning-background');
                    }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>}
              </div>

              {/* Customization Tips */}
              <div className="glass-overlay p-4 rounded-lg">
                <h4 className="font-medium mb-2">គន្លឹះការកំណត់រូបរាង</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• រូបភាពដែលមានគុណភាពល្អបំផុតគឺ 1920x1080 pixels</li>
                  <li>• ជ្រើសរើសរូបភាពដែលមិនរំខានដល់ការអាន</li>
                  <li>• ប្រើពណ៌ស្រាលសម្រាប់ការងារយូរ</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>


        <TabsContent value="focus" className="mt-6 space-y-6">
          {/* Focus Timer Section */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                ពេលវេលាយកចិត្តទុកដាក់
              </CardTitle>
              <p className="text-muted-foreground">
                ប្រើបច្ចេកទេស Pomodoro ដើម្បីកំណត់ការយកចិត្តទុកដាក់លើគោលដៅរបស់អ្នក
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {!showFocusTimer ? <>
                  {/* Timer Settings */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">រយៈពេលយកចិត្តទុកដាក់ (នាទី)</label>
                      <Select value={focusTime.toString()} onValueChange={value => setFocusTime(parseInt(value))}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">១៥ នាទី</SelectItem>
                          <SelectItem value="25">២៥ នាទី (Pomodoro)</SelectItem>
                          <SelectItem value="30">៣០ នាទី</SelectItem>
                          <SelectItem value="45">៤៥ នាទី</SelectItem>
                          <SelectItem value="60">១ ម៉ោង</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Goal Selection */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">ជ្រើសរើសគោលដៅដើម្បីយកចិត្តទុកដាក់ (ស្រេចចិត្ត)</label>
                      <Select value={selectedGoal?.id || "none"} onValueChange={value => {
                      if (value === "none") {
                        setSelectedGoal(null);
                      } else {
                        const goal = goals.find(g => g.id === value);
                        setSelectedGoal(goal || null);
                      }
                    }}>
                        <SelectTrigger>
                          <SelectValue placeholder="ជ្រើសរើសគោលដៅ..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">មិនជ្រើសរើសគោលដៅ</SelectItem>
                          {goals.map(goal => <SelectItem key={goal.id} value={goal.id}>
                              {goal.title} ({goal.goal_type})
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedGoal && <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getTypeBadgeColor(selectedGoal.goal_type)}>
                              {getTypeIcon(selectedGoal.goal_type)}
                              <span className="ml-1">
                                {selectedGoal.goal_type === 'weekly' ? 'សប្តាហ៍' : selectedGoal.goal_type === 'monthly' ? 'ខែ' : 'ឆ្នាំ'}
                              </span>
                            </Badge>
                          </div>
                          <h3 className="font-medium">{selectedGoal.title}</h3>
                          {selectedGoal.description && <p className="text-sm text-muted-foreground mt-1">{selectedGoal.description}</p>}
                        </CardContent>
                      </Card>}
                  </div>

                  <Button onClick={() => startFocusSession(selectedGoal)} className="w-full gap-2" size="lg">
                    <Play className="h-4 w-4" />
                    ចាប់ផ្តើមការយកចិត្តទុកដាក់ ({focusTime} នាទី)
                  </Button>
                </> : <>
                  {/* Active Timer Display */}
                  <div className="text-center space-y-6">
                    <div className="text-6xl font-mono font-bold text-primary">
                      {formatTime(remainingTime)}
                    </div>
                    
                    {selectedGoal && <div>
                        <p className="text-sm text-muted-foreground">កំពុងយកចិត្តទុកដាក់លើ:</p>
                        <h3 className="text-xl font-semibold">{selectedGoal.title}</h3>
                      </div>}

                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{
                      width: `${(focusTime * 60 - remainingTime) / (focusTime * 60) * 100}%`
                    }} />
                    </div>

                    <div className="flex gap-4 justify-center">
                      {isTimerRunning ? <Button onClick={pauseTimer} variant="outline" size="lg" className="gap-2">
                          <Pause className="h-4 w-4" />
                          ផ្អាក
                        </Button> : <Button onClick={resumeTimer} size="lg" className="gap-2" disabled={remainingTime === 0}>
                          <Play className="h-4 w-4" />
                          បន្ត
                        </Button>}
                      <Button onClick={stopTimer} variant="destructive" size="lg" className="gap-2">
                        <Square className="h-4 w-4" />
                        បញ្ឈប់
                      </Button>
                    </div>
                  </div>
                </>}
            </CardContent>
          </Card>

          {/* Quick Focus Actions for Goals */}
          {goals.length > 0 && !showFocusTimer && <Card>
              <CardHeader>
                <CardTitle>ការយកចិត្តទុកដាក់រហ័ស</CardTitle>
                <p className="text-muted-foreground">
                  ចុចលើគោលដៅណាមួយដើម្បីចាប់ផ្តើមការយកចិត្តទុកដាក់ភ្លាមៗ
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {goals.slice(0, 5).map(goal => <div key={goal.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Badge className={getTypeBadgeColor(goal.goal_type)} variant="secondary">
                          {getTypeIcon(goal.goal_type)}
                        </Badge>
                        <div>
                          <h4 className="font-medium">{goal.title}</h4>
                          <p className="text-sm text-muted-foreground">{goal.period}</p>
                        </div>
                      </div>
                      <Button onClick={() => startFocusSession(goal)} size="sm" className="gap-2">
                        <Clock className="h-3 w-3" />
                        យកចិត្តទុកដាក់
                      </Button>
                    </div>)}
                </div>
              </CardContent>
            </Card>}
        </TabsContent>
        </Tabs>
      </div>

      <style dangerouslySetInnerHTML={{
      __html: `
          @keyframes colorShift {
            0% { color: hsl(var(--primary)); }
            25% { color: hsl(var(--destructive)); }
            50% { color: hsl(var(--warning)); }
            75% { color: hsl(var(--success)); }
            100% { color: hsl(var(--primary)); }
          }
        `
    }} />
    </div>;
}