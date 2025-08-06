import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { Progress } from './progress';
import { Badge } from './badge';
import { Play, Pause, Square, Timer, Target, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FocusTimerProps {
  duration?: number; // in minutes
  goalTitle?: string;
  onComplete?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  duration = 25,
  goalTitle,
  onComplete,
  onCancel,
  className
}) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const { toast } = useToast();

  const totalTime = duration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            toast({
              title: "🎉 Focus Session Complete!",
              description: `Great job! You've completed a ${duration}-minute focus session${goalTitle ? ` on "${goalTitle}"` : ''}.`,
              duration: 5000
            });
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, duration, goalTitle, toast, onComplete]);

  const handleStart = () => {
    setIsRunning(true);
    toast({
      title: "🧠 Focus Session Started",
      description: `Starting ${duration}-minute focus session. Stay focused!`
    });
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    onCancel?.();
  };

  const startBreathingExercise = () => {
    setIsBreathing(true);
    setTimeout(() => setIsBreathing(false), 4000); // 4-second breathing cycle
  };

  return (
    <Card className={cn(
      'relative overflow-hidden',
      'bg-gradient-to-br from-primary/10 via-background to-primary/5',
      'border-primary/20 shadow-lg',
      className
    )}>
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Focus Session</h3>
          </div>
          {goalTitle && (
            <div className="flex items-center justify-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{goalTitle}</p>
            </div>
          )}
        </div>

        {/* Timer Display */}
        <div className="text-center space-y-4">
          <div className={cn(
            'text-6xl font-mono font-bold',
            'transition-all duration-300',
            isRunning && 'text-primary',
            isBreathing && 'animate-pulse scale-110'
          )}>
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={progress} 
              className="h-3 bg-muted/50"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-center gap-2">
          <Badge variant={isRunning ? "default" : "secondary"}>
            {isRunning ? "🔥 Focused" : timeLeft === totalTime ? "⏳ Ready" : "⏸️ Paused"}
          </Badge>
          {progress > 50 && (
            <Badge variant="outline" className="text-primary border-primary">
              💪 Great Progress!
            </Badge>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          {!isRunning ? (
            <Button onClick={handleStart} className="gap-2">
              <Play className="h-4 w-4" />
              {timeLeft === totalTime ? 'Start' : 'Resume'}
            </Button>
          ) : (
            <Button onClick={handlePause} variant="outline" className="gap-2">
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}
          
          <Button onClick={handleStop} variant="destructive" size="sm" className="gap-2">
            <Square className="h-4 w-4" />
            Stop
          </Button>

          <Button 
            onClick={startBreathingExercise} 
            variant="ghost" 
            size="sm" 
            className="gap-2"
          >
            <Brain className="h-4 w-4" />
            Breathe
          </Button>
        </div>

        {/* Breathing Exercise Indicator */}
        {isBreathing && (
          <div className="text-center">
            <div className="inline-block w-16 h-16 rounded-full bg-primary/20 animate-ping" />
            <p className="text-sm text-muted-foreground mt-2">
              Breathe in... and out...
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>💡 Tip: Take deep breaths and stay hydrated</p>
          {progress > 75 && (
            <p className="text-primary font-medium">🎯 You're almost there! Keep going!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};