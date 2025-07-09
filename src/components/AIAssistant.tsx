import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  Volume2, 
  Brain, 
  TrendingUp, 
  FileText,
  Send,
  Loader2
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

export default function AIAssistant({ initialTab = 'chat' }: AIAssistantProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [reportContent, setReportContent] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
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

      if (error) throw error;

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        const { data, error } = await supabase.functions.invoke('voice-assistant', {
          body: {
            action: 'transcribe',
            audio: base64Audio
          }
        });

        if (error) throw error;

        const transcribedText = data.text;
        setInputMessage(transcribedText);
        
        // Automatically send the transcribed message
        await sendChatMessage(transcribedText);
      };
      reader.readAsArrayBuffer(audioBlob);
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Error",
        description: "Failed to transcribe audio. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('voice-assistant', {
        body: {
          action: 'synthesize',
          text,
          voice: 'alloy'
        }
      });

      if (error) throw error;

      const audioData = data.audioContent;
      const audioBlob = new Blob([
        Uint8Array.from(atob(audioData), c => c.charCodeAt(0))
      ], { type: 'audio/mp3' });

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error('Speech synthesis error:', error);
      toast({
        title: "Error",
        description: "Failed to synthesize speech. Please try again.",
        variant: "destructive"
      });
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

      if (error) throw error;

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

      if (error) throw error;

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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Financial Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <ScrollArea className="h-96 w-full border rounded-lg p-4">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
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
                placeholder="Ask me anything about your finances..."
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage(inputMessage)}
                disabled={isLoading}
              />
              <Button
                onClick={() => sendChatMessage(inputMessage)}
                disabled={isLoading || !inputMessage.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-4">
            <div className="text-center space-y-4">
              <div className="flex justify-center gap-4">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "destructive" : "default"}
                  size="lg"
                  disabled={isLoading}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>
              </div>

              {chatMessages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Recent messages:</p>
                  <div className="space-y-2">
                    {chatMessages.slice(-3).map((message) => (
                      <div key={message.id} className="flex items-center gap-2">
                        <Badge variant={message.sender === 'user' ? 'default' : 'secondary'}>
                          {message.sender === 'user' ? 'You' : 'AI'}
                        </Badge>
                        <p className="text-sm">{message.content}</p>
                        {message.sender === 'ai' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => speakText(message.content)}
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="text-center">
              <Button onClick={runFinancialAnalysis} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Run Analysis
                  </>
                )}
              </Button>
            </div>

            {analysisResult && (
              <ScrollArea className="h-96 w-full border rounded-lg p-4">
                <div className="whitespace-pre-wrap text-sm">
                  {analysisResult}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="text-center">
              <Button onClick={generateReport} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>

            {reportContent && (
              <ScrollArea className="h-96 w-full border rounded-lg p-4">
                <div className="whitespace-pre-wrap text-sm">
                  {reportContent}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}