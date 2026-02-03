import { useState } from 'react';
import { Stakeholder } from '@/types/dashboard';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Edit2, Check, X } from 'lucide-react';

interface StakeholderTableProps {
  stakeholders: Stakeholder[];
  onUpdate: (stakeholder: Stakeholder) => void;
}

const categoryColors: Record<string, string> = {
  Resources: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  Technology: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
  Engineering: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
  Business: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
};

export function StakeholderTable({ stakeholders, onUpdate }: StakeholderTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Stakeholder>>({});

  const startEditing = (stakeholder: Stakeholder) => {
    setEditingId(stakeholder.id);
    setEditValues(stakeholder);
  };

  const saveEdit = () => {
    if (editingId && editValues) {
      onUpdate({ ...stakeholders.find(s => s.id === editingId)!, ...editValues });
      setEditingId(null);
      setEditValues({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success';
    if (score >= 5) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Stakeholder Matrix</h2>
            <p className="text-sm text-muted-foreground">Manage key relationships and champions</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {stakeholders.filter(s => s.is_champion).length} Champions
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name / Designation</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Connections</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Score</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Value Chain</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Champion</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stakeholders.map((stakeholder) => (
              <tr key={stakeholder.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-4 px-4">
                  {editingId === stakeholder.id ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={editValues.name || ''}
                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                        className="editable-cell w-full text-foreground font-medium bg-secondary/50 rounded px-2"
                      />
                      <input
                        type="text"
                        value={editValues.designation || ''}
                        onChange={(e) => setEditValues({ ...editValues, designation: e.target.value })}
                        className="editable-cell w-full text-sm text-muted-foreground bg-secondary/50 rounded px-2"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-foreground">{stakeholder.name}</p>
                      <p className="text-sm text-muted-foreground">{stakeholder.designation}</p>
                    </div>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    {stakeholder.connections.map((connection, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-muted/50">
                        {connection}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  {editingId === stakeholder.id ? (
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editValues.relationship_score || 1}
                      onChange={(e) => setEditValues({ ...editValues, relationship_score: parseInt(e.target.value) })}
                      className="editable-cell w-16 text-center bg-secondary/50 rounded"
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      <Star className={`w-4 h-4 ${getScoreColor(stakeholder.relationship_score)}`} />
                      <span className={`font-semibold ${getScoreColor(stakeholder.relationship_score)}`}>
                        {stakeholder.relationship_score}
                      </span>
                    </div>
                  )}
                </td>
                <td className="py-4 px-4">
                  <Badge className={`${categoryColors[stakeholder.value_chain_category]} border`}>
                    {stakeholder.value_chain_category}
                  </Badge>
                </td>
                <td className="py-4 px-4 text-center">
                  <Switch
                    checked={editingId === stakeholder.id ? editValues.is_champion : stakeholder.is_champion}
                    onCheckedChange={(checked) => {
                      if (editingId === stakeholder.id) {
                        setEditValues({ ...editValues, is_champion: checked });
                      } else {
                        onUpdate({ ...stakeholder, is_champion: checked });
                      }
                    }}
                  />
                </td>
                <td className="py-4 px-4 text-center">
                  {editingId === stakeholder.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={saveEdit} className="p-1.5 hover:bg-success/20 rounded-lg transition-colors">
                        <Check className="w-4 h-4 text-success" />
                      </button>
                      <button onClick={cancelEdit} className="p-1.5 hover:bg-destructive/20 rounded-lg transition-colors">
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditing(stakeholder)}
                      className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
