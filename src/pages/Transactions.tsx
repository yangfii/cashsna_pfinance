import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar as CalendarIcon, Filter, Search, Edit, Trash2, Save, Camera, Upload, Eye } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
type Transaction = {
  id: string;
  user_id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  note: string | null;
  date: string;
  created_at: string;
  updated_at: string;
  image_url: string | null;
};
const incomeCategories = ["ប្រាក់ខែ", "បន្ថែម", "លក់របស់", "ការដាក់វិនិយោគ", "Crypto investment"];
const expenseCategories = ["អាហារ", "Research Costs", "ដឹកជញ្ជូន", "សុខភាព", "កម្សាន្ត", "សំលៀកបំពាក់", "គ្រួសារ", "ថ្លៃអុីនធ័រណេត"];
export default function Transactions() {
  const {
    user
  } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "",
    note: "",
    date: new Date(),
    imageUrl: null as string | null
  });
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Fetch transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, [user]);
  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('date', {
        ascending: false
      });
      if (error) throw error;
      // Cast the data to match our Transaction type
      setTransactions((data || []).map(item => ({
        ...item,
        type: item.type as "income" | "expense"
      })));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('មានបញ្ហាក្នុងការទាញយកទិន្នន័យ');
    } finally {
      setLoading(false);
    }
  };
  const filteredTransactions = transactions.filter(transaction => {
    const searchInNote = transaction.note || "";
    const matchesSearch = transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) || searchInNote.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || transaction.type === filterType;
    return matchesSearch && matchesType;
  });
  const handleAddTransaction = async () => {
    if (!user) return;
    console.log('Add transaction button clicked', formData);

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      console.log('Invalid amount:', formData.amount);
      toast.error('សូមបញ្ចូលចំនួនទឹកប្រាក់ត្រឹមត្រូវ');
      return;
    }
    if (!formData.category) {
      console.log('No category selected');
      toast.error('សូមជ្រើសរើសប្រភេទ');
      return;
    }
    console.log('Validation passed, creating transaction...');
    try {
      const {
        data,
        error
      } = await supabase.from('transactions').insert([{
        user_id: user.id,
        type: formData.type as "income" | "expense",
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: format(formData.date, "yyyy-MM-dd"),
        note: formData.note || null,
        image_url: formData.imageUrl
      }]).select().single();
      if (error) throw error;
      setTransactions([{
        ...data,
        type: data.type as "income" | "expense"
      }, ...transactions]);
      setFormData({
        type: "expense",
        amount: "",
        category: "",
        note: "",
        date: new Date(),
        imageUrl: null
      });
      setDialogOpen(false);

      // Success message
      toast.success(formData.type === "income" ? 'បានបន្ថែមចំណូលជោគជ័យ!' : 'បានបន្ថែមចំណាយជោគជ័យ!');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ');
    }
  };
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      note: transaction.note || "",
      date: new Date(transaction.date),
      imageUrl: transaction.image_url
    });
    setDialogOpen(true);
  };
  const handleDeleteTransaction = async (id: string) => {
    try {
      const {
        error
      } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      setTransactions(transactions.filter(t => t.id !== id));
      toast.success('ប្រតិបត្តិការត្រូវបានលុបជោគជ័យ!');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('មានបញ្ហាក្នុងការលុបទិន្នន័យ');
    }
  };
  const handleUpdateTransaction = async () => {
    if (!editingTransaction || !user) return;
    console.log('Update transaction button clicked', formData);

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      console.log('Invalid amount:', formData.amount);
      toast.error('សូមបញ្ចូលចំនួនទឹកប្រាក់ត្រឹមត្រូវ');
      return;
    }
    if (!formData.category) {
      console.log('No category selected');
      toast.error('សូមជ្រើសរើសប្រភេទ');
      return;
    }
    console.log('Validation passed, updating transaction...');
    try {
      const {
        data,
        error
      } = await supabase.from('transactions').update({
        type: formData.type as "income" | "expense",
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: format(formData.date, "yyyy-MM-dd"),
        note: formData.note || null
      }).eq('id', editingTransaction.id).select().single();
      if (error) throw error;
      setTransactions(transactions.map(t => t.id === editingTransaction.id ? {
        ...data,
        type: data.type as "income" | "expense"
      } : t));
      setFormData({
        type: "expense",
        amount: "",
        category: "",
        note: "",
        date: new Date(),
        imageUrl: null
      });
      setEditingTransaction(null);
      setDialogOpen(false);
      toast.success('ប្រតិបត្តិការត្រូវបានកែប្រែជោគជ័យ!');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('មានបញ្ហាក្នុងការកែប្រែទិន្នន័យ');
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('km-KH', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      toast.error('សូមជ្រើសរើសរូបភាពតែប៉ុណ្ណោះ');
      return;
    }
    setIsProcessingImage(true);
    toast.loading('កំពុងដំណើរការរូបភាព...', {
      id: 'processing-image'
    });
    try {
      // Upload image to Supabase storage first
      const fileExt = file.name.split('.').pop();
      const fileName = `receipt_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const {
        error: uploadError
      } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Process receipt with AI
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);
      formDataUpload.append('userId', user.id);
      const response = await fetch('https://giziyaymzuydlnbjzhsc.supabase.co/functions/v1/process-receipt', {
        method: 'POST',
        body: formDataUpload,
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpeml5YXltenV5ZGxuYmp6aHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MDU3MDUsImV4cCI6MjA2NzI4MTcwNX0.ueksNc6W4vmdg6gW7S-Vo2sa-hV7SROTdkMXwndz4pA`
        }
      });
      let extractedData = null;
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          extractedData = result.data;
        }
      }

      // Pre-populate form with extracted data or defaults
      setFormData({
        type: extractedData?.type || "expense",
        amount: extractedData?.amount?.toString() || "",
        category: extractedData?.category || "",
        note: extractedData?.description || "",
        date: extractedData?.date ? new Date(extractedData.date) : new Date(),
        imageUrl: publicUrl
      });
      toast.success('បានស្កេនវិក័យបត្រជោគជ័យ!', {
        id: 'processing-image'
      });
    } catch (error) {
      console.error('Error processing receipt:', error);
      toast.error('មានបញ្ហាក្នុងការស្កេនវិក័យបត្រ', {
        id: 'processing-image'
      });
    } finally {
      setIsProcessingImage(false);
    }
  };
  return <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">ប្រតិបត្តិការ</h1>
          <p className="text-muted-foreground">គ្រប់គ្រងចំណូលនិងចំណាយរបស់អ្នក</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-primary border-0 hover:shadow-glow transition-smooth" onClick={() => {
            setEditingTransaction(null);
            setFormData({
              type: "expense",
              amount: "",
              category: "",
              note: "",
              date: new Date(),
              imageUrl: null
            });
          }}>
              <Plus className="h-4 w-4" />
              បន្ថែមប្រតិបត្តិការ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'កែប្រែប្រតិបត្តិការ' : 'បន្ថែមប្រតិបត្តិការថ្មី'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>ស្កេនវិក័យបត្រ</Label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => document.getElementById('receipt-upload')?.click()} disabled={isProcessingImage}>
                    {isProcessingImage ? <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                        កំពុងដំណើរការ...
                      </> : <>
                        <Camera className="h-4 w-4" />
                        ថតរូប
                      </>}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => document.getElementById('receipt-upload')?.click()} disabled={isProcessingImage}>
                    <Upload className="h-4 w-4" />
                    បញ្ចូលរូប
                  </Button>
                </div>
                <input id="receipt-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} capture="environment" />
                <p className="text-xs text-muted-foreground text-center">
                  ថតរូបឬបញ្ចូលរូបវិក័យបត្រដើម្បីបង្កើតប្រតិបត្តិការដោយស្វ័យប្រវត្តិ
                </p>
              </div>

              {/* Transaction Type */}
              <div className="space-y-2">
                <Label>ប្រភេទ</Label>
                <Select value={formData.type} onValueChange={value => setFormData({
                ...formData,
                type: value,
                category: ""
              })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">ចំណូល</SelectItem>
                    <SelectItem value="expense">ចំណាយ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label>ចំនួនទឹកប្រាក់</Label>
                <Input type="number" placeholder="0.00" value={formData.amount} onChange={e => setFormData({
                ...formData,
                amount: e.target.value
              })} />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>ប្រភេទ</Label>
                <Select value={formData.category} onValueChange={value => setFormData({
                ...formData,
                category: value
              })}>
                  <SelectTrigger>
                    <SelectValue placeholder="ជ្រើសរើសប្រភេទ" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.type === "income" ? incomeCategories : expenseCategories).map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label>កាលបរិច្ឆេទ</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={formData.date} onSelect={date => date && setFormData({
                    ...formData,
                    date
                  })} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label>កំណត់ចំណាំ</Label>
                <Textarea placeholder="បន្ថែមកំណត់ចំណាំ..." value={formData.note} onChange={e => setFormData({
                ...formData,
                note: e.target.value
              })} />
              </div>

              <Button onClick={() => {
              console.log('Save button clicked - formData:', formData);
              console.log('Button disabled check:', !formData.amount || !formData.category || parseFloat(formData.amount) <= 0);
              console.log('Editing mode:', !!editingTransaction);
              if (editingTransaction) {
                handleUpdateTransaction();
              } else {
                handleAddTransaction();
              }
            }} className="w-full bg-gradient-primary border-0 hover:shadow-glow transition-smooth gap-2" disabled={!formData.amount || !formData.category || parseFloat(formData.amount) <= 0}>
                <Save className="h-4 w-4" />
                {editingTransaction ? 'កែប្រែ' : 'រក្សា'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="stat-card py-0">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="ស្វែងរកប្រតិបត្តិការ..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ទាំងអស់</SelectItem>
                <SelectItem value="income">ចំណូល</SelectItem>
                <SelectItem value="expense">ចំណាយ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle>
            បញ្ជីប្រតិបត្តិការ ({filteredTransactions.length}
            {filteredTransactions.length !== transactions.length && ` ចេញពី ${transactions.length}`})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-8 text-muted-foreground">
              <p>កំពុងទាញយកទិន្នន័យ...</p>
            </div> : <div className="space-y-3">
                {filteredTransactions.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                  <p>រកមិនឃើញប្រតិបត្តិការ</p>
                </div> : filteredTransactions.map((transaction, index) => <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out animate-fade-in gap-3" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                     <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                       <div className={cn("w-3 h-8 sm:h-10 rounded-full flex-shrink-0", transaction.type === "income" ? "bg-gradient-income" : "bg-gradient-expense")} />
                       <div className="min-w-0 flex-1">
                         <div className="flex flex-wrap items-center gap-2 mb-1">
                           <p className="font-medium text-sm sm:text-base truncate">{transaction.category}</p>
                           <Badge variant={transaction.type === "income" ? "secondary" : "destructive"} className={cn("text-xs flex-shrink-0", transaction.type === "income" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400")}>
                             {transaction.type === "income" ? "ចំណូល" : "ចំណាយ"}
                           </Badge>
                           {transaction.image_url && <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0" onClick={() => setViewingImage(transaction.image_url)}>
                               <Eye className="h-3 w-3 text-primary" />
                             </Button>}
                         </div>
                         <p className="text-xs sm:text-sm text-muted-foreground truncate">{transaction.note}</p>
                         <p className="text-xs text-muted-foreground">{transaction.date}</p>
                       </div>
                     </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                      <div className="text-left sm:text-right">
                        <p className={cn("font-bold text-base sm:text-lg", transaction.type === "income" ? "text-emerald-600" : "text-red-600")}>
                          {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                       <div className="flex gap-1 flex-shrink-0">
                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditTransaction(transaction)}>
                           <Edit className="h-3 w-3" />
                         </Button>
                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteTransaction(transaction.id)}>
                           <Trash2 className="h-3 w-3" />
                         </Button>
                       </div>
                    </div>
                  </div>)}
            </div>}
        </CardContent>
      </Card>

      {/* Image Viewing Dialog */}
      <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>រូបភាពវិក័យបត្រ</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {viewingImage && <img src={viewingImage} alt="Receipt" className="max-w-full max-h-96 object-contain rounded-lg" />}
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}