import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, FolderOpen, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<{ income: Category[]; expense: Category[] }>({
    income: [],
    expense: []
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    color: "green"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [transactionCounts, setTransactionCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const colors = [
    "red", "orange", "amber", "yellow", "lime", "green", 
    "emerald", "teal", "cyan", "sky", "blue", "indigo", 
    "violet", "purple", "fuchsia", "pink", "rose"
  ];

  const fetchTransactionCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('category, id')
        .order('category');

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach(transaction => {
        counts[transaction.category] = (counts[transaction.category] || 0) + 1;
      });
      
      setTransactionCounts(counts);
    } catch (error) {
      console.error('Error fetching transaction counts:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchTransactionCounts()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const categorizedData = {
        income: (data?.filter(cat => cat.type === 'income') || []) as Category[],
        expense: (data?.filter(cat => cat.type === 'expense') || []) as Category[]
      };

      setCategories(categorizedData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    }
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error", 
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      if (editingCategory) {
        // Edit existing category - update transactions if name changed
        const oldCategoryName = editingCategory.name;
        const newCategoryName = formData.name.trim();
        
        const { error: categoryError } = await supabase
          .from('categories')
          .update({
            name: newCategoryName,
            color: formData.color,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id)
          .eq('user_id', user.id);

        if (categoryError) throw categoryError;

        // Update all transactions with the old category name to use the new name
        if (oldCategoryName !== newCategoryName) {
          const { error: transactionError } = await supabase
            .from('transactions')
            .update({ category: newCategoryName })
            .eq('category', oldCategoryName)
            .eq('user_id', user.id);

          if (transactionError) {
            console.error('Error updating transactions:', transactionError);
            toast({
              title: "Warning",
              description: "Category updated but some transactions may not be synced",
              variant: "destructive"
            });
          }
        }

        toast({
          title: "Success",
          description: "Category updated successfully"
        });
      } else {
        // Add new category
        const { error } = await supabase
          .from('categories')
          .insert({
            name: formData.name.trim(),
            type: formData.type as 'income' | 'expense',
            color: formData.color,
            user_id: user.id
          });

        if (error) throw error;

        toast({
          title: "Success", 
          description: "Category created successfully"
        });
      }

      // Refresh data to ensure accuracy
      await Promise.all([fetchCategories(), fetchTransactionCounts()]);
      resetForm();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save category",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color
    });
    setDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    try {
      // First, get the category name before deletion
      const { data: categoryData, error: fetchError } = await supabase
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const categoryName = categoryData.name;

      // Check if there are transactions using this category
      const { data: transactionData, error: transactionCheckError } = await supabase
        .from('transactions')
        .select('id')
        .eq('category', categoryName)
        .eq('user_id', user.id);

      if (transactionCheckError) throw transactionCheckError;

      // If there are transactions, update them to "Uncategorized"
      if (transactionData && transactionData.length > 0) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ category: 'Uncategorized' })
          .eq('category', categoryName)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        toast({
          title: "Info",
          description: `${transactionData.length} transactions moved to "Uncategorized"`,
        });
      }

      // Delete the category
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      toast({
        title: "Success",
        description: "Category deleted successfully"
      });

      // Refresh data to ensure accuracy
      await Promise.all([fetchCategories(), fetchTransactionCounts()]);
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", type: "expense", color: "green" });
    setEditingCategory(null);
    setDialogOpen(false);
  };

  const getTransactionCount = (categoryName: string) => {
    return transactionCounts[categoryName] || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
    return colorMap[color] || colorMap.green;
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
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label>ប្រភេទ</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({...formData, type: value})}
                  disabled={!!editingCategory || saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ជ្រើសរើសប្រភេទ" />
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
                      disabled={saving}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-smooth",
                        formData.color === color ? "border-foreground" : "border-transparent",
                        saving ? "opacity-50 cursor-not-allowed" : "",
                        `bg-${color}-500`
                      )}
                    />
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleSaveCategory} 
                className="w-full bg-gradient-primary border-0" 
                disabled={saving}
              >
                {saving ? "កំពុងរក្សាទុក..." : editingCategory ? "រក្សាទុកការកែប្រែ" : "បន្ថែមប្រភេទ"}
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
              <TrendingUp className="h-5 w-5 text-constructive-foreground" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.income.map((category, index) => (
              <div
                key={category.id}
                className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth animate-bounce-in cursor-pointer"
                style={{animationDelay: `${index * 0.1}s`}}
                onClick={() => navigate(`/dashboard/transactions?category=${encodeURIComponent(category.name)}`)}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(category);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={getColorClasses(category.color)}>
                    {getTransactionCount(category.name)} ប្រតិបត្តិការ
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
              <TrendingDown className="h-5 w-5 text-destructive-foreground" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.expense.map((category, index) => (
              <div
                key={category.id}
                className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth animate-bounce-in cursor-pointer"
                style={{animationDelay: `${index * 0.1}s`}}
                onClick={() => navigate(`/dashboard/transactions?category=${encodeURIComponent(category.name)}`)}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(category);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={getColorClasses(category.color)}>
                    {getTransactionCount(category.name)} ប្រតិបត្តិការ
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
