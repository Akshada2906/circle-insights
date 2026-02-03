import { useState } from 'react';
import { Circle } from '@/types/dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Cloud, Database, Brain, Shield, Settings, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CirclePanelProps {
  circles: Circle[];
  onUpdate: (circle: Circle) => void;
}

const circleIcons: Record<string, typeof Cloud> = {
  Cloud,
  Data: Database,
  AI: Brain,
  Security: Shield,
  DevOps: Settings,
};

const getPenetrationColor = (percentage: number) => {
  if (percentage >= 70) return 'text-success';
  if (percentage >= 40) return 'text-warning';
  return 'text-destructive';
};

const getPenetrationBg = (percentage: number) => {
  if (percentage >= 70) return 'from-success/20 to-success/5';
  if (percentage >= 40) return 'from-warning/20 to-warning/5';
  return 'from-destructive/20 to-destructive/5';
};

export function CirclePanel({ circles, onUpdate }: CirclePanelProps) {
  const [activeCircle, setActiveCircle] = useState(circles[0]?.id || '');
  const [activeTab, setActiveTab] = useState('overview');

  const handleFieldUpdate = (circleId: string, field: keyof Circle, value: string | number) => {
    const circle = circles.find(c => c.id === circleId);
    if (circle) {
      onUpdate({ ...circle, [field]: value });
    }
  };

  const selectedCircle = circles.find(c => c.id === activeCircle);

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-chart-4/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-chart-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Circle Penetration</h2>
            <p className="text-sm text-muted-foreground">Track and analyze circle engagement</p>
          </div>
        </div>
      </div>

      {/* Circle Selection */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {circles.map((circle) => {
          const Icon = circleIcons[circle.circle_name] || Cloud;
          const isActive = activeCircle === circle.id;
          
          return (
            <button
              key={circle.id}
              onClick={() => setActiveCircle(circle.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium whitespace-nowrap">{circle.circle_name}</span>
              <Badge
                className={`ml-1 ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : getPenetrationColor(circle.penetration_percentage)}`}
              >
                {circle.penetration_percentage}%
              </Badge>
            </button>
          );
        })}
      </div>

      {selectedCircle && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-muted/50 p-1 rounded-xl mb-4">
            <TabsTrigger value="overview" className="flex-1 rounded-lg data-[state=active]:bg-card">
              Overview
            </TabsTrigger>
            <TabsTrigger value="work" className="flex-1 rounded-lg data-[state=active]:bg-card">
              Current Work
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex-1 rounded-lg data-[state=active]:bg-card">
              AI Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0 animate-slide-in">
            <div className={`p-6 rounded-xl bg-gradient-to-br ${getPenetrationBg(selectedCircle.penetration_percentage)}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">{selectedCircle.circle_name} Penetration</h3>
                <div className="flex items-center gap-2">
                  {selectedCircle.current_work ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-warning" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {selectedCircle.current_work ? 'Active Engagement' : 'No Active Work'}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Penetration Percentage
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedCircle.penetration_percentage}
                    onChange={(e) => handleFieldUpdate(selectedCircle.id, 'penetration_percentage', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedCircle.penetration_percentage}
                      onChange={(e) => handleFieldUpdate(selectedCircle.id, 'penetration_percentage', parseInt(e.target.value) || 0)}
                      className="w-16 text-center bg-secondary/50 rounded-lg px-2 py-1 text-lg font-semibold text-foreground"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              <div className="progress-track h-3">
                <div
                  className={`progress-fill ${
                    selectedCircle.penetration_percentage >= 70
                      ? 'bg-gradient-to-r from-success to-success/70'
                      : selectedCircle.penetration_percentage >= 40
                      ? 'bg-gradient-to-r from-warning to-warning/70'
                      : 'bg-gradient-to-r from-destructive to-destructive/70'
                  }`}
                  style={{ width: `${selectedCircle.penetration_percentage}%` }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="work" className="mt-0 space-y-4 animate-slide-in">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Current Work / SOW
              </label>
              <Textarea
                value={selectedCircle.current_work}
                onChange={(e) => handleFieldUpdate(selectedCircle.id, 'current_work', e.target.value)}
                placeholder="Enter current work or SOW details..."
                className="min-h-[100px] bg-muted/50 border-border/50 focus:border-primary"
              />
            </div>

            {!selectedCircle.current_work && (
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl">
                <label className="block text-sm font-medium text-warning mb-2">
                  Reason for No Work
                </label>
                <Textarea
                  value={selectedCircle.reason_for_no_work || ''}
                  onChange={(e) => handleFieldUpdate(selectedCircle.id, 'reason_for_no_work', e.target.value)}
                  placeholder="Explain why there's no current engagement..."
                  className="min-h-[80px] bg-warning/5 border-warning/20 focus:border-warning"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai" className="mt-0 animate-slide-in">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-primary animate-pulse-glow" />
                <h4 className="font-medium text-foreground">AI-Powered Suggestions</h4>
              </div>
              
              {selectedCircle.ai_suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-primary/20 rounded-lg mt-0.5">
                      <Sparkles className="w-3 h-3 text-primary" />
                    </div>
                    <p className="text-foreground">{suggestion}</p>
                  </div>
                </div>
              ))}

              <button className="w-full p-3 mt-4 bg-gradient-to-r from-primary to-chart-4 text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity">
                Generate New Analysis
              </button>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
