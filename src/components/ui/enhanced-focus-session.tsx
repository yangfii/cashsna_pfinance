import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { RippleButton } from './ripple-button';
import { Progress } from './progress';
import { Badge } from './badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Play, Pause, Square, Timer, Target, Brain, Volume2, VolumeX, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Slider } from './slider';
import { Switch } from './switch';

interface EnhancedFocusSessionProps {
  isOpen: boolean;
  onClose: () => void;
  goalTitle?: string;
  onComplete?: () => void;
}

export const EnhancedFocusSession: React.FC<EnhancedFocusSessionProps> = ({
  isOpen,
  onClose,
  goalTitle,
  onComplete
}) => {
  const [duration, setDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoBreak, setAutoBreak] = useState(true);
  const [breakDuration, setBreakDuration] = useState(5);
  const [breathingActive, setBreathingActive] = useState(false);
  const { toast } = useToast();

  const totalTime = duration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Audio context for sounds
  const playSound = (frequency: number, duration: number) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Audio not supported');
    }
  };

  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            playSound(800, 1000); // Success sound
            toast({
              title: "🎉 Focus Session Complete!",
              description: `Excellent work! You've completed a ${duration}-minute focus session${goalTitle ? ` on "${goalTitle}"` : ''}.`,
              duration: 5000
            });
            
            if (autoBreak) {
              toast({
                title: "🛌 Break Time!",
                description: `Take a ${breakDuration}-minute break. You've earned it!`,
                duration: 3000
              });
            }
            
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, duration, goalTitle, toast, onComplete, autoBreak, breakDuration]);

  const handleStart = () => {
    setIsRunning(true);
    playSound(600, 300); // Start sound
    toast({
      title: "🧠 Focus Session Started",
      description: `${duration}-minute deep focus session. You've got this!`
    });
  };

  const handlePause = () => {
    setIsRunning(false);
    playSound(400, 200); // Pause sound
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    playSound(300, 400); // Stop sound
    onClose();
  };

  const startBreathingExercise = () => {
    setBreathingActive(true);
    setIsBreathing(true);
    
    // 4-7-8 breathing pattern
    const breathingCycle = () => {
      // Inhale for 4 seconds
      setTimeout(() => {
        toast({ title: "💨 Breathe in slowly...", duration: 1000 });
      }, 0);
      
      // Hold for 7 seconds
      setTimeout(() => {
        toast({ title: "🫁 Hold your breath...", duration: 1000 });
      }, 4000);
      
      // Exhale for 8 seconds
      setTimeout(() => {
        toast({ title: "😌 Breathe out slowly...", duration: 1000 });
      }, 11000);
    };

    breathingCycle();
    
    setTimeout(() => {
      setIsBreathing(false);
      setBreathingActive(false);
      toast({ title: "✨ Great! You're refreshed and ready to focus.", duration: 2000 });
    }, 19000);
  };

  const getMotivationalMessage = () => {
    if (progress < 25) return "🚀 You're just getting started!";
    if (progress < 50) return "💪 Building momentum!";
    if (progress < 75) return "🔥 You're in the zone!";
    if (progress < 90) return "🎯 Almost there!";
    return "🏆 Final stretch!";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            Enhanced Focus Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Goal Display */}
          {goalTitle && (
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">{goalTitle}</p>
              </div>
            </div>
          )}

          {/* Timer Display */}
          <div className="text-center space-y-4">
            <div className={cn(
              'text-5xl font-mono font-bold transition-all duration-300',
              isRunning && 'text-primary animate-pulse',
              isBreathing && 'animate-breathe scale-110'
            )}>
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={progress} 
                className={cn(
                  "h-4 bg-muted/50 transition-all duration-300",
                  isRunning && "animate-glow"
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(progress)}%</span>
                <span>{getMotivationalMessage()}</span>
              </div>
            </div>
          </div>

          {/* Status & Motivation */}
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant={isRunning ? "default" : "secondary"} className="animate-pulse">
              {isRunning ? "🔥 Deep Focus" : timeLeft === totalTime ? "⏳ Ready" : "⏸️ Paused"}
            </Badge>
            {progress > 0 && (
              <Badge variant="outline" className="text-primary border-primary">
                {progress > 75 ? "🏆 Almost done!" : "💪 Keep going!"}
              </Badge>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-2 flex-wrap">
            {!isRunning ? (
              <RippleButton 
                onClick={handleStart} 
                className="gap-2" 
                variant="premium"
                disabled={breathingActive}
              >
                <Play className="h-4 w-4" />
                {timeLeft === totalTime ? 'Start Focus' : 'Resume'}
              </RippleButton>
            ) : (
              <RippleButton onClick={handlePause} variant="outline" className="gap-2">
                <Pause className="h-4 w-4" />
                Pause
              </RippleButton>
            )}
            
            <RippleButton 
              onClick={handleStop} 
              variant="destructive" 
              size="sm" 
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </RippleButton>

            <RippleButton 
              onClick={startBreathingExercise} 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              disabled={breathingActive}
            >
              <Brain className="h-4 w-4" />
              {breathingActive ? 'Breathing...' : 'Breathe'}
            </RippleButton>

            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <Card className="p-4 space-y-4 animate-scale-in">
              <h4 className="font-medium">Settings</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Focus Duration</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[duration]}
                      onValueChange={(value) => setDuration(value[0])}
                      max={60}
                      min={5}
                      step={5}
                      className="w-20"
                    />
                    <span className="text-sm w-8">{duration}m</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm">Sound Effects</label>
                  <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm">Auto Break</label>
                  <Switch checked={autoBreak} onCheckedChange={setAutoBreak} />
                </div>

                {autoBreak && (
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Break Duration</label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[breakDuration]}
                        onValueChange={(value) => setBreakDuration(value[0])}
                        max={15}
                        min={5}
                        step={5}
                        className="w-20"
                      />
                      <span className="text-sm w-8">{breakDuration}m</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Breathing Exercise Indicator */}
          {breathingActive && (
            <div className="text-center space-y-3 animate-fade-in">
              <div className="inline-block w-20 h-20 rounded-full bg-primary/20 animate-breathe" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Deep Breathing Exercise</p>
                <p className="text-xs text-muted-foreground">
                  Follow the 4-7-8 pattern: inhale, hold, exhale
                </p>
              </div>
            </div>
          )}

          {/* Progress Milestones */}
          {progress > 0 && (
            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p>💡 Remember to stay hydrated and maintain good posture</p>
              {progress > 50 && (
                <p className="text-primary font-medium animate-pulse">
                  🎯 You're past the halfway mark! Excellent focus!
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};