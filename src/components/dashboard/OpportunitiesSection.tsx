import { useState } from 'react';
import { Opportunity } from '@/types/dashboard';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Target, Shield, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface OpportunitiesSectionProps {
  opportunity: Opportunity;
  onUpdate: (opportunity: Opportunity) => void;
}

export function OpportunitiesSection({ opportunity, onUpdate }: OpportunitiesSectionProps) {
  const [expandedAI, setExpandedAI] = useState(true);

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Opportunities & Competitors</h2>
            <p className="text-sm text-muted-foreground">AI analysis and competitive intelligence</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* AI Analysis Box */}
        <div className="space-y-4">
          <button
            onClick={() => setExpandedAI(!expandedAI)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-chart-4/10 rounded-xl border border-primary/20 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-primary animate-pulse-glow" />
              <span className="font-medium text-foreground">AI Opportunity Analysis</span>
            </div>
            {expandedAI ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {expandedAI && (
            <div className="p-4 bg-muted/30 rounded-xl border border-border/50 animate-slide-in">
              <div className="prose prose-sm prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                  {opportunity.ai_analysis.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <p key={i} className="font-semibold text-foreground mt-3 mb-1">
                          {line.replace(/\*\*/g, '')}
                        </p>
                      );
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <p key={i} className="pl-4 flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {line.substring(2)}
                        </p>
                      );
                    }
                    if (line.match(/^\d\./)) {
                      return (
                        <p key={i} className="pl-4">
                          {line}
                        </p>
                      );
                    }
                    return line ? <p key={i}>{line}</p> : <br key={i} />;
                  })}
                </div>
              </div>
              
              <button className="w-full mt-4 p-2.5 bg-gradient-to-r from-primary to-chart-4 text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Regenerate Analysis
              </button>
            </div>
          )}

          {/* Value Adds */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-success" />
              <label className="text-sm font-medium text-muted-foreground">Value Adds</label>
            </div>
            <Textarea
              value={opportunity.value_adds}
              onChange={(e) => onUpdate({ ...opportunity, value_adds: e.target.value })}
              placeholder="Document unique value propositions..."
              className="min-h-[120px] bg-muted/50 border-border/50 focus:border-success"
            />
          </div>
        </div>

        {/* Competitor Intelligence */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-warning" />
            <label className="text-sm font-medium text-muted-foreground">Competitor Intelligence</label>
          </div>
          <Textarea
            value={opportunity.competitor_intelligence}
            onChange={(e) => onUpdate({ ...opportunity, competitor_intelligence: e.target.value })}
            placeholder="Track competitor activities and strategies..."
            className="min-h-[280px] bg-muted/50 border-border/50 focus:border-warning"
          />
          
          <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-xl">
            <p className="text-xs text-warning font-medium mb-1">Competitive Risk Level</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 progress-track">
                <div className="progress-fill bg-gradient-to-r from-success via-warning to-destructive w-[65%]" />
              </div>
              <span className="text-sm font-semibold text-warning">Medium</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
