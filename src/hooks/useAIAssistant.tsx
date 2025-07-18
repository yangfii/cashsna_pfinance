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


  const categorizeTransaction = useCallback(async (transaction: any) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('financial-ai', {
        body: {
          action: 'categorize',
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
          action: 'analyze'
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
          action: 'market-trends'
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
          action: 'monthly-report'
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
          action: 'risk-assessment'
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
    categorizeTransaction,
    analyzeFinances,
    generateBudgetPlan,
    generateReport,
    analyzeMarketTrends,
    generateMonthlyReport,
    assessRiskStatus
  };
};