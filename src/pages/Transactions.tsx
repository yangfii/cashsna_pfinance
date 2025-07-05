import { useState } from "react";
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
import { Plus, Calendar as CalendarIcon, Filter, Search, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const mockTransactions = [
  { id: 1, type: "income", amount: 1500, category: "ប្រាក់ខែ", date: "2024-07-01", note: "ប្រាក់ខែខុបម្ភៈ" },
  { id: 2, type: "expense", amount: 50, category: "អាហារ", date: "2024-07-02", note: "អាហារពេលល្ងាច" },
  { id: 3, type: "expense", amount: 30, category: "ឆេះប្រេង", date: "2024-07-02", note: "ចាក់ប្រេងម៉ូតូ" },
  { id: 4, type: "income", amount: 200, category: "បន្ថែម", date: "2024-07-03", note: "ចំណូលបន្ថែម" },
  { id: 5, type: "expense", amount: 25, category: "ដឹកជញ្ជូន", date: "2024-07-03", note: "តាក់ស៊ី" },
  { id: 6, type: "expense", amount: 120, category: "សុខភាព", date: "2024-07-04", note: "ពេទ្យ" },
  { id: 7, type: "income", amount: 80, category: "លក់របស់", date: "2024-07-04", note: "លក់វត្ថុចាស់" },
];

const incomeCategories = ["ប្រាក់ខែ", "បន្ថែម", "លក់របស់", "ការដាក់វិនិយោគ"];
const expenseCategories = ["អាហារ", "ឆេះប្រេង", "ដឹកជញ្ជូន", "សុខភាព", "កម្សាន្ត", "សំលៀកបំពាក់"];

export default function Transactions() {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "",
    note: "",
    date: new Date()
  });

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.note.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || transaction.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddTransaction = () => {
    if (!formData.amount || !formData.category) return;
    
    const newTransaction = {
      id: Date.now(),
      type: formData.type as "income" | "expense",
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: format(formData.date, "yyyy-MM-dd"),
      note: formData.note || "-"
    };

    setTransactions([newTransaction, ...transactions]);
    setFormData({
      type: "expense",
      amount: "",
      category: "",
      note: "",
      date: new Date()
    });
    setDialogOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('km-KH', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">ប្រតិបត្តិការ</h1>
          <p className="text-muted-foreground">គ្រប់គ្រងចំណូលនិងចំណាយរបស់អ្នក</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-primary border-0 hover:shadow-glow transition-smooth">
              <Plus className="h-4 w-4" />
              បន្ថែមប្រតិបត្តិការ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>បន្ថែមប្រតិបត្តិការថ្មី</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Transaction Type */}
              <div className="space-y-2">
                <Label>ប្រភេទ</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value, category: ""})}>
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
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>ប្រភេទ</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="ជ្រើសរើសប្រភេទ" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.type === "income" ? incomeCategories : expenseCategories).map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
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
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && setFormData({...formData, date})}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label>កំណត់ចំណាំ</Label>
                <Textarea
                  placeholder="បន្ថែមកំណត់ចំណាំ..."
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                />
              </div>

              <Button onClick={handleAddTransaction} className="w-full bg-gradient-primary border-0">
                រក្សាទុក
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ស្វែងរកប្រតិបត្តិការ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
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
          <CardTitle>បញ្ជីប្រតិបត្តិការ ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>រកមិនឃើញប្រតិបត្តិការ</p>
              </div>
            ) : (
              filteredTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth animate-slide-up"
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "w-3 h-10 rounded-full",
                      transaction.type === "income" ? "bg-gradient-income" : "bg-gradient-expense"
                    )} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{transaction.category}</p>
                        <Badge 
                          variant={transaction.type === "income" ? "secondary" : "destructive"}
                          className={cn(
                            "text-xs",
                            transaction.type === "income" 
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" 
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          )}
                        >
                          {transaction.type === "income" ? "ចំណូល" : "ចំណាយ"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{transaction.note}</p>
                      <p className="text-xs text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={cn(
                        "font-bold text-lg",
                        transaction.type === "income" ? "text-emerald-600" : "text-red-600"
                      )}>
                        {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}