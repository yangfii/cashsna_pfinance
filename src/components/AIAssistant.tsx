import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  MessageCircle, 
  Brain, 
  TrendingUp, 
  FileText,
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
  BarChart3,
  Calendar,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIAssistantProps {
  initialTab?: string;
}

const AIFeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  isLoading, 
  variant = "default" 
}: {
  icon: any;
  title: string;
  description: string;
  onClick: () => void;
  isLoading?: boolean;
  variant?: "default" | "primary";
}) => (
  <Card className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
    variant === "primary" ? "border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10" : ""
  }`} onClick={onClick}>
    <CardContent className="p-6">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${
          variant === "primary" ? "bg-gradient-primary text-white" : "bg-muted"
        }`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Processing...</span>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const MessageBubble = ({ message }: { message: ChatMessage }) => (
  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`flex items-start space-x-3 max-w-[85%] ${
      message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
    }`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        message.sender === 'user' 
          ? 'bg-gradient-primary text-white' 
          : 'bg-muted border'
      }`}>
        {message.sender === 'user' ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      <div className={`rounded-2xl px-4 py-3 ${
        message.sender === 'user'
          ? 'bg-gradient-primary text-white'
          : 'bg-muted border'
      }`}>
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div className="flex items-center justify-between mt-2">
          <p className={`text-xs ${
            message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
          }`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default function AIAssistant({ initialTab = 'chat' }: AIAssistantProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [reportContent, setReportContent] = useState<string>('');
  const [marketTrendsResult, setMarketTrendsResult] = useState<string>('');
  const [monthlyReportContent, setMonthlyReportContent] = useState<string>('');
  const [riskAssessmentResult, setRiskAssessmentResult] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const sendChatMessage = async (message: string) => {
    if (!user || !message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          message,
          userId: user.id,
          context: 'General financial assistance'
        }
      });

      if (error) {
        console.error('Chat assistant error:', error);
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: 'Sorry, the AI assistant is currently not configured. Please contact your administrator to set up the required API keys.',
          sender: 'ai',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMessage]);
        return;
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };


  const runFinancialAnalysis = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('financial-ai', {
        body: {
          action: 'analyze',
          userId: user.id
        }
      });

      if (error) {
        console.error('Financial analysis error:', error);
        setAnalysisResult('Sorry, the financial analysis feature is currently not configured. Please contact your administrator to set up the required API keys.');
        return;
      }

      setAnalysisResult(data.response);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to run financial analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('financial-ai', {
        body: {
          action: 'report',
          userId: user.id
        }
      });

      if (error) {
        console.error('Report generation error:', error);
        setReportContent('Sorry, the report generation feature is currently not configured. Please contact your administrator to set up the required API keys.');
        return;
      }

      setReportContent(data.response);
    } catch (error) {
      console.error('Report error:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeMarketTrends = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('financial-ai', {
        body: {
          action: 'market-trends',
          userId: user.id
        }
      });

      if (error) {
        console.error('Market trends analysis error:', error);
        setMarketTrendsResult('Sorry, the market trends analysis feature is currently not configured. Please contact your administrator to set up the required API keys.');
        return;
      }

      setMarketTrendsResult(data.response);
    } catch (error) {
      console.error('Market trends error:', error);
      toast({
        title: "Error",
        description: "Failed to analyze market trends. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMonthlyReport = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('financial-ai', {
        body: {
          action: 'monthly-report',
          userId: user.id
        }
      });

      if (error) {
        console.error('Monthly report generation error:', error);
        setMonthlyReportContent('Sorry, the monthly report generation feature is currently not configured. Please contact your administrator to set up the required API keys.');
        return;
      }

      setMonthlyReportContent(data.response);
    } catch (error) {
      console.error('Monthly report error:', error);
      toast({
        title: "Error",
        description: "Failed to generate monthly report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const assessRiskStatus = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('financial-ai', {
        body: {
          action: 'risk-assessment',
          userId: user.id
        }
      });

      if (error) {
        console.error('Risk assessment error:', error);
        setRiskAssessmentResult('Sorry, the risk assessment feature is currently not configured. Please contact your administrator to set up the required API keys.');
        return;
      }

      setRiskAssessmentResult(data.response);
    } catch (error) {
      console.error('Risk assessment error:', error);
      toast({
        title: "Error",
        description: "Failed to assess risk status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Financial Assistant</h2>
            <p className="text-sm text-muted-foreground font-normal">
              Your intelligent companion for financial insights and guidance
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-11">
            <TabsTrigger value="chat" className="flex items-center gap-2 text-xs">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2 text-xs">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 text-xs">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4 mt-6">
            <div className="space-y-4">
              <ScrollArea className="h-80 w-full border rounded-lg bg-muted/30">
                <div className="p-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8 space-y-3">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Start a conversation</h3>
                        <p className="text-xs text-muted-foreground">Ask me anything about your finances!</p>
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <MessageBubble 
                        key={message.id} 
                        message={message} 
                      />
                    ))
                  )}
                  
                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-muted border rounded-2xl px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about budgeting, expenses, or financial planning..."
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage(inputMessage)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={() => sendChatMessage(inputMessage)}
                  disabled={isLoading || !inputMessage.trim()}
                  size="icon"
                  className="bg-gradient-primary hover:shadow-glow transition-smooth"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>


          <TabsContent value="analysis" className="space-y-6 mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <AIFeatureCard
                icon={TrendingUp}
                title="Financial Analysis"
                description="Get comprehensive insights into your spending patterns, income trends, and financial health."
                onClick={runFinancialAnalysis}
                isLoading={isLoading}
                variant="primary"
              />
              
              <AIFeatureCard
                icon={BarChart3}
                title="Market Trends"
                description="Analyze crypto market trends and get insights on price movements and market sentiment."
                onClick={analyzeMarketTrends}
                isLoading={isLoading}
                variant="primary"
              />
              
              <AIFeatureCard
                icon={Shield}
                title="Risk Assessment"
                description="Evaluate your portfolio's risk level and get personalized recommendations for risk management."
                onClick={assessRiskStatus}
                isLoading={isLoading}
                variant="primary"
              />
            </div>

            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Financial Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80 w-full">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {analysisResult}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {marketTrendsResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Market Trends Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80 w-full">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {marketTrendsResult}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {riskAssessmentResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Risk Assessment Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80 w-full">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {riskAssessmentResult}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6 mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <AIFeatureCard
                icon={FileText}
                title="Financial Report"
                description="Generate detailed financial reports with insights, recommendations, and actionable steps."
                onClick={generateReport}
                isLoading={isLoading}
                variant="primary"
              />
              
              <AIFeatureCard
                icon={Calendar}
                title="Monthly Report"
                description="Generate comprehensive monthly reports with performance analysis and portfolio insights."
                onClick={generateMonthlyReport}
                isLoading={isLoading}
                variant="primary"
              />
            </div>

            {reportContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Financial Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80 w-full">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {reportContent}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {monthlyReportContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Monthly Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80 w-full">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {monthlyReportContent}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}