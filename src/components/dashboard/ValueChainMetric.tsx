import { useState } from 'react';
import { ValueChainStage } from '@/types/dashboard';
import { Textarea } from '@/components/ui/textarea';
import { Boxes, ArrowRight, Cpu, Wrench, Briefcase } from 'lucide-react';

interface ValueChainMetricProps {
  stages: ValueChainStage[];
  onUpdate: (stage: ValueChainStage) => void;
}

const stageIcons: Record<string, typeof Boxes> = {
  Resources: Boxes,
  Technology: Cpu,
  Engineering: Wrench,
  Business: Briefcase,
};

const stageColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  Resources: {
    bg: 'bg-chart-3/10',
    text: 'text-chart-3',
    border: 'border-chart-3/30',
    gradient: 'from-chart-3 to-chart-3/50',
  },
  Technology: {
    bg: 'bg-chart-1/10',
    text: 'text-chart-1',
    border: 'border-chart-1/30',
    gradient: 'from-chart-1 to-chart-1/50',
  },
  Engineering: {
    bg: 'bg-chart-2/10',
    text: 'text-chart-2',
    border: 'border-chart-2/30',
    gradient: 'from-chart-2 to-chart-2/50',
  },
  Business: {
    bg: 'bg-chart-4/10',
    text: 'text-chart-4',
    border: 'border-chart-4/30',
    gradient: 'from-chart-4 to-chart-4/50',
  },
};

export function ValueChainMetric({ stages, onUpdate }: ValueChainMetricProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-chart-1/10 rounded-lg">
            <ArrowRight className="w-5 h-5 text-chart-1" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Value Chain Metrics</h2>
            <p className="text-sm text-muted-foreground">4-stage value chain flow analysis</p>
          </div>
        </div>
      </div>

      {/* Flow Visualization */}
      <div className="flex items-stretch gap-2 mb-6 overflow-x-auto pb-2">
        {sortedStages.map((stage, index) => {
          const Icon = stageIcons[stage.stage_name] || Boxes;
          const colors = stageColors[stage.stage_name];
          const isSelected = selectedStage === stage.id;

          return (
            <div key={stage.id} className="flex items-center flex-1 min-w-[160px]">
              <button
                onClick={() => setSelectedStage(isSelected ? null : stage.id)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? `${colors.bg} ${colors.border} shadow-lg`
                    : 'bg-muted/30 border-transparent hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                  </div>
                  <span className="font-medium text-foreground text-sm">{stage.stage_name}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className={`font-semibold ${colors.text}`}>{stage.current_percentage}%</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill bg-gradient-to-r ${colors.gradient}`}
                      style={{ width: `${stage.current_percentage}%` }}
                    />
                  </div>
                </div>
              </button>

              {index < sortedStages.length - 1 && (
                <ArrowRight className="w-5 h-5 text-muted-foreground/50 mx-1 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* State Capture Analysis */}
      {selectedStage && (
        <div className="animate-slide-in">
          {sortedStages
            .filter((stage) => stage.id === selectedStage)
            .map((stage) => {
              const colors = stageColors[stage.stage_name];
              
              return (
                <div
                  key={stage.id}
                  className={`p-5 rounded-xl border ${colors.border} ${colors.bg}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-medium ${colors.text}`}>
                      {stage.stage_name} - State Capture Analysis
                    </h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={stage.current_percentage}
                        onChange={(e) =>
                          onUpdate({ ...stage, current_percentage: parseInt(e.target.value) || 0 })
                        }
                        className="w-16 text-center bg-card border border-border rounded-lg px-2 py-1 text-sm font-semibold text-foreground"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                  
                  <Textarea
                    value={stage.state_capture_analysis}
                    onChange={(e) => onUpdate({ ...stage, state_capture_analysis: e.target.value })}
                    placeholder="Enter state capture analysis..."
                    className="min-h-[120px] bg-card/50 border-border/50 focus:border-primary"
                  />
                </div>
              );
            })}
        </div>
      )}

      {!selectedStage && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Click on a stage to view and edit the state capture analysis</p>
        </div>
      )}
    </div>
  );
}
