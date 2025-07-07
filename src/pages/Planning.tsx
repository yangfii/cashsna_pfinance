import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Calendar, 
  Target, 
  CheckCircle2, 
  Circle, 
  Edit, 
  Trash2,
  CalendarDays,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Step {
  id: string;
  text: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  type: 'weekly' | 'monthly' | 'yearly';
  period: string;
  steps: Step[];
  completed: boolean;
  createdAt: string;
}

export default function Planning() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'weekly' as 'weekly' | 'monthly' | 'yearly',
    period: ''
  });
  const [newStep, setNewStep] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const { toast } = useToast();

  // Load goals from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('planning-goals');
    if (saved) {
      setGoals(JSON.parse(saved));
    }
  }, []);

  // Save goals to localStorage
  useEffect(() => {
    localStorage.setItem('planning-goals', JSON.stringify(goals));
  }, [goals]);

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

  const getCurrentPeriod = (type: string) => {
    const now = new Date();
    switch (type) {
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `Week ${Math.ceil(now.getDate() / 7)} of ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      case 'monthly':
        return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'yearly':
        return `Year ${now.getFullYear()}`;
      default:
        return '';
    }
  };

  const handleSaveGoal = () => {
    if (!newGoal.title.trim() || steps.length === 0) {
      toast({
        title: "កំហុស",
        description: "សូមបំពេញចំណងជើងគោលដៅ និងយ៉ាងហោចណាស់មួយជំហាន",
        variant: "destructive",
      });
      return;
    }

    const goal: Goal = {
      id: editingGoal?.id || Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      type: newGoal.type,
      period: newGoal.period || getCurrentPeriod(newGoal.type),
      steps: steps,
      completed: false,
      createdAt: editingGoal?.createdAt || new Date().toISOString()
    };

    if (editingGoal) {
      setGoals(goals.map(g => g.id === editingGoal.id ? goal : g));
      toast({
        title: "គោលដៅត្រូវបានកែប្រែ",
        description: "គោលដៅរបស់អ្នកត្រូវបានកែប្រែជោគជ័យ",
      });
    } else {
      setGoals([...goals, goal]);
      toast({
        title: "គោលដៅត្រូវបានបន្ថែម",
        description: "គោលដៅថ្មីរបស់អ្នកត្រូវបានបន្ថែមជោគជ័យ",
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setNewGoal({ title: '', description: '', type: 'weekly', period: '' });
    setSteps([]);
    setShowAddForm(false);
    setEditingGoal(null);
  };

  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
    toast({
      title: "គោលដៅត្រូវបានលុប",
      description: "គោលដៅត្រូវបានលុបជោគជ័យ",
      variant: "destructive",
    });
  };

  const toggleStepCompletion = (goalId: string, stepId: string) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const updatedSteps = goal.steps.map(step =>
          step.id === stepId ? { ...step, completed: !step.completed } : step
        );
        const allCompleted = updatedSteps.every(step => step.completed);
        return { ...goal, steps: updatedSteps, completed: allCompleted };
      }
      return goal;
    }));
  };

  const editGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      description: goal.description || '',
      type: goal.type,
      period: goal.period
    });
    setSteps(goal.steps);
    setShowAddForm(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weekly': return <Calendar className="h-4 w-4" />;
      case 'monthly': return <CalendarDays className="h-4 w-4" />;
      case 'yearly': return <TrendingUp className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'weekly': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'monthly': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'yearly': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const weeklyGoals = goals.filter(g => g.type === 'weekly');
  const monthlyGoals = goals.filter(g => g.type === 'monthly');
  const yearlyGoals = goals.filter(g => g.type === 'yearly');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">ការរៀបចំគំរោង</h1>
          <p className="text-muted-foreground">គ្រប់គ្រងគោលដៅរបស់អ្នកតាមសប្តាហ៍ ខែ និងឆ្នាំ</p>
        </div>
        
        <Button 
          onClick={() => setShowAddForm(true)} 
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          បន្ថែមគោលដៅថ្មី
        </Button>
      </div>

      {/* Add/Edit Goal Form */}
      {showAddForm && (
        <Card className="animate-slide-down">
          <CardHeader>
            <CardTitle>{editingGoal ? 'កែប្រែគោលដៅ' : 'បន្ថែមគោលដៅថ្មី'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">ប្រភេទគោលដៅ</label>
              <Select value={newGoal.type} onValueChange={(value: 'weekly' | 'monthly' | 'yearly') => setNewGoal({...newGoal, type: value})}>
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
              <label className="text-sm font-medium mb-2 block">រយៈពេល</label>
              <Input
                placeholder={getCurrentPeriod(newGoal.type)}
                value={newGoal.period}
                onChange={(e) => setNewGoal({...newGoal, period: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">ចំណងជើងគោលដៅ</label>
              <Input
                placeholder="បញ្ចូលគោលដៅរបស់អ្នក..."
                value={newGoal.title}
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">ពិពណ៌នា (ស្រេចចិត្ត)</label>
              <Textarea
                placeholder="ពិពណ៌នាលម្អិតអំពីគោលដៅ..."
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">ជំហានសម្រាប់សម្រេចគោលដៅ</label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="បន្ថែមជំហានថ្មី..."
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addStep()}
                />
                <Button type="button" onClick={addStep} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {steps.length > 0 && (
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-2 p-2 border rounded">
                      <span className="text-sm text-muted-foreground">ជំហាន {index + 1}:</span>
                      <span className="flex-1">{step.text}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(step.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveGoal} className="flex-1">
                {editingGoal ? 'កែប្រែ' : 'រក្សាទុក'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                បោះបង់
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals Display */}
      <div className="space-y-8">
        {/* Weekly Goals */}
        {weeklyGoals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              គោលដៅប្រចាំសប្តាហ៍
            </h2>
            <div className="grid gap-4">
              {weeklyGoals.map((goal) => (
                <Card key={goal.id} className="stat-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeBadgeColor(goal.type)}>
                            {getTypeIcon(goal.type)}
                            <span className="ml-1">សប្តាហ៍</span>
                          </Badge>
                          {goal.completed && (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              បានបញ្ចប់
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{goal.period}</p>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        )}
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
                              <AlertDialogAction onClick={() => deleteGoal(goal.id)}>
                                លុប
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">ជំហានដែលត្រូវអនុវត្ត:</h4>
                      {goal.steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-2">
                          <button
                            onClick={() => toggleStepCompletion(goal.id, step.id)}
                            className="flex-shrink-0"
                          >
                            {step.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                          <span className={`text-sm ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {step.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Goals */}
        {monthlyGoals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              គោលដៅប្រចាំខែ
            </h2>
            <div className="grid gap-4">
              {monthlyGoals.map((goal) => (
                <Card key={goal.id} className="stat-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeBadgeColor(goal.type)}>
                            {getTypeIcon(goal.type)}
                            <span className="ml-1">ខែ</span>
                          </Badge>
                          {goal.completed && (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              បានបញ្ចប់
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{goal.period}</p>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        )}
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
                              <AlertDialogAction onClick={() => deleteGoal(goal.id)}>
                                លុប
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">ជំហានដែលត្រូវអនុវត្ត:</h4>
                      {goal.steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-2">
                          <button
                            onClick={() => toggleStepCompletion(goal.id, step.id)}
                            className="flex-shrink-0"
                          >
                            {step.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                          <span className={`text-sm ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {step.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Yearly Goals */}
        {yearlyGoals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              គោលដៅប្រចាំឆ្នាំ
            </h2>
            <div className="grid gap-4">
              {yearlyGoals.map((goal) => (
                <Card key={goal.id} className="stat-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeBadgeColor(goal.type)}>
                            {getTypeIcon(goal.type)}
                            <span className="ml-1">ឆ្នាំ</span>
                          </Badge>
                          {goal.completed && (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              បានបញ្ចប់
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{goal.period}</p>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        )}
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
                              <AlertDialogAction onClick={() => deleteGoal(goal.id)}>
                                លុប
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">ជំហានដែលត្រូវអនុវត្ត:</h4>
                      {goal.steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-2">
                          <button
                            onClick={() => toggleStepCompletion(goal.id, step.id)}
                            className="flex-shrink-0"
                          >
                            {step.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                          <span className={`text-sm ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {step.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">មិនទាន់មានគោលដៅ</h3>
              <p className="text-muted-foreground mb-4">
                ចាប់ផ្តើមដោយការបន្ថែមគោលដៅប្រចាំសប្តាហ៍ ខែ ឬឆ្នាំរបស់អ្នក
              </p>
              <Button onClick={() => setShowAddForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                បន្ថែមគោលដៅដំបូង
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tips Card */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            គន្លឹះសម្រាប់សរសេរគោលដៅល្អ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>ជ្រើសរើសគោលដៅច្បាស់លាស់ និងជាក់លាក់ (SMART Goals)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>បំបែកវាទៅជាជំហានដែលអាចធ្វើបាន</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>ចាប់ផ្តើមតូចៗ ហើយបង្កើនបន្តិចម្តង</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>ពិនិត្យ និងតាមដានความរីកចម្រើនជាទៀងទាត់</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}