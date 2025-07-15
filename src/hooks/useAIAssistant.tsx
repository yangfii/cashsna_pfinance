import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

export const useAIAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const sendChatMessage = useCallback(async (message: string, context?: string) => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          message,
          userId: user.id,
          context
        }
      });

      if (error) {
        console.error('Chat assistant error:', error);
        return 'Sorry, the AI assistant is currently not available. Please try again later.';
      }
      return data.response;
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      return new Promise<string>((resolve, reject) => {
        reader.onload = async () => {
          try {
            const arrayBuffer = reader.result as ArrayBuffer;
            const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

            const { data, error } = await supabase.functions.invoke('voice-assistant', {
              body: {
                action: 'transcribe',
                audio: base64Audio
              }
            });

            if (error) throw error;
            resolve(data.text);
          } catch (err) {
            reject(err);
          }
        };
        reader.readAsArrayBuffer(audioBlob);
      });
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Error",
        description: "Failed to transcribe audio. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const synthesizeSpeech = useCallback(async (text: string, voice: string = 'alloy') => {
    try {
      const { data, error } = await supabase.functions.invoke('voice-assistant', {
        body: {
          action: 'synthesize',
          text,
          voice
        }
      });

      if (error) throw error;

      const audioData = data.audioContent;
      const audioBlob = new Blob([
        Uint8Array.from(atob(audioData), c => c.charCodeAt(0))
      ], { type: 'audio/mp3' });

      return audioBlob;
    } catch (error) {
      console.error('Speech synthesis error:', error);
      toast({
        title: "Error",
        description: "Failed to synthesize speech. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  const categorizeTransaction = useCallback(async (transaction: any) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('financial-ai', {
        body: {
          action: 'categorize',
          userId: user.id,
          data: transaction
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Categorization error:', error);
      toast({
        title: "Error",
        description: "Failed to categorize transaction. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast]);

  const analyzeFinances = useCallback(async () => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('financial-ai', {
        body: {
          action: 'analyze',
          userId: user.id
        }
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to run financial analysis. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const generateBudgetPlan = useCallback(async (prompt?: string) => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('financial-ai', {
        body: {
          action: 'budget',
          userId: user.id,
          data: { prompt }
        }
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error('Budget planning error:', error);
      toast({
        title: "Error",
        description: "Failed to generate budget plan. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const generateReport = useCallback(async (prompt?: string) => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('financial-ai', {
        body: {
          action: 'report',
          userId: user.id,
          data: { prompt }
        }
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const analyzeMarketTrends = useCallback(async () => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('financial-ai', {
        body: {
          action: 'market-trends',
          userId: user.id
        }
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error('Market trends analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to analyze market trends. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const generateMonthlyReport = useCallback(async () => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('financial-ai', {
        body: {
          action: 'monthly-report',
          userId: user.id
        }
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error('Monthly report generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate monthly report. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const assessRiskStatus = useCallback(async () => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('financial-ai', {
        body: {
          action: 'risk-assessment',
          userId: user.id
        }
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error('Risk assessment error:', error);
      toast({
        title: "Error",
        description: "Failed to assess risk status. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  return {
    isLoading,
    sendChatMessage,
    transcribeAudio,
    synthesizeSpeech,
    categorizeTransaction,
    analyzeFinances,
    generateBudgetPlan,
    generateReport,
    analyzeMarketTrends,
    generateMonthlyReport,
    assessRiskStatus
  };
};