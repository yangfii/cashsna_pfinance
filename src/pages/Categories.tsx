import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, FolderOpen, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const defaultCategories = {
  income: [
    { id: 1, name: "ប្រាក់ខែ", color: "emerald", count: 12 },
    { id: 2, name: "បន្ថែម", color: "green", count: 8 },
    { id: 3, name: "លក់របស់", color: "teal", count: 3 },
    { id: 4, name: "ការដាក់វិនិយោគ", color: "cyan", count: 2 },
  ],
  expense: [
    { id: 5, name: "អាហារ", color: "red", count: 25 },
    { id: 6, name: "ឆេះប្រេង", color: "orange", count: 15 },
    { id: 7, name: "ដឹកជញ្ជូន", color: "amber", count: 18 },
    { id: 8, name: "សុខភាព", color: "rose", count: 5 },
    { id: 9, name: "កម្សាន្ត", color: "pink", count: 8 },
    { id: 10, name: "សំលៀកបំពាក់", color: "purple", count: 6 },
  ]
};

export default function Categories() {
  const [categories, setCategories] = useState(defaultCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    color: "blue"
  });

  const colors = [
    "red", "orange", "amber", "yellow", "lime", "green", 
    "emerald", "teal", "cyan", "sky", "blue", "indigo", 
    "violet", "purple", "fuchsia", "pink", "rose"
  ];

  const handleSaveCategory = () => {
    if (!formData.name.trim()) return;

    if (editingCategory) {
      // Edit existing category
      const type = editingCategory.type as keyof typeof categories;
      setCategories(prev => ({
        ...prev,
        [type]: prev[type].map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, name: formData.name, color: formData.color }
            : cat
        )
      }));
    } else {
      // Add new category
      const newCategory = {
        id: Date.now(),
        name: formData.name,
        color: formData.color,
        count: 0
      };

      const type = formData.type as keyof typeof categories;
      setCategories(prev => ({
        ...prev,
        [type]: [...prev[type], newCategory]
      }));
    }

    resetForm();
  };

  const handleEditCategory = (category: any, type: string) => {
    setEditingCategory({ ...category, type });
    setFormData({
      name: category.name,
      type: type,
      color: category.color
    });
    setDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: number, type: keyof typeof categories) => {
    setCategories(prev => ({
      ...prev,
      [type]: prev[type].filter(cat => cat.id !== categoryId)
    }));
  };

  const resetForm = () => {
    setFormData({ name: "", type: "expense", color: "blue" });
    setEditingCategory(null);
    setDialogOpen(false);
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      lime: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400",
      green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      teal: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
      cyan: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
      sky: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
      blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      violet: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
      purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      fuchsia: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
      pink: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
      rose: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">ប្រភេទចំណូល/ចំណាយ</h1>
          <p className="text-muted-foreground">គ្រប់គ្រងប្រភេទនៃប្រតិបត្តិការរបស់អ្នក</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-primary border-0 hover:shadow-glow transition-smooth">
              <Plus className="h-4 w-4" />
              បន្ថែមប្រភេទ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "កែសម្រួលប្រភេទ" : "បន្ថែមប្រភេទថ្មី"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>ឈ្មោះប្រភេទ</Label>
                <Input
                  placeholder="បញ្ចូលឈ្មោះប្រភេទ"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>ប្រភេទ</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({...formData, type: value})}
                  disabled={!!editingCategory}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">ចំណូល</SelectItem>
                    <SelectItem value="expense">ចំណាយ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ពណ៌</Label>
                <div className="grid grid-cols-6 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({...formData, color})}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-smooth",
                        formData.color === color ? "border-foreground" : "border-transparent",
                        `bg-${color}-500`
                      )}
                    />
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveCategory} className="w-full bg-gradient-primary border-0">
                {editingCategory ? "រក្សាទុកការកែប្រែ" : "បន្ថែមប្រភេទ"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Income Categories */}
      <Card className="stat-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-income rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-emerald-800 dark:text-emerald-400">
                ប្រភេទចំណូល ({categories.income.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                ប្រភេទសម្រាប់កត់ត្រាចំណូល
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.income.map((category, index) => (
              <div
                key={category.id}
                className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth animate-bounce-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => handleEditCategory(category, 'income')}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteCategory(category.id, 'income')}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={getColorClasses(category.color)}>
                    {category.count} ប្រតិបត្តិការ
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expense Categories */}
      <Card className="stat-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-expense rounded-lg">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-red-800 dark:text-red-400">
                ប្រភេទចំណាយ ({categories.expense.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                ប្រភេទសម្រាប់កត់ត្រាចំណាយ
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.expense.map((category, index) => (
              <div
                key={category.id}
                className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth animate-bounce-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-4 w-4 text-red-600" />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => handleEditCategory(category, 'expense')}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteCategory(category.id, 'expense')}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={getColorClasses(category.color)}>
                    {category.count} ប្រតិបត្តិការ
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}