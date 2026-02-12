import { useState, useEffect } from 'react';
import { Stakeholder } from '@/types/account';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { designations, departments, valueChainCategories } from '@/constants';
import { calculateRelationshipScore } from '@/lib/utils';
import { Project } from '@/types/account';
import { cn } from '@/lib/utils';

interface StakeholderFormProps {
    stakeholder?: Stakeholder;
    accountId: string;
    projects: Project[];
    onSubmit: (stakeholder: Partial<Stakeholder>) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function StakeholderForm({ stakeholder, accountId, projects, onSubmit, onCancel, isLoading = false }: StakeholderFormProps) {
    const [formData, setFormData] = useState<Partial<Stakeholder>>({
        name: stakeholder?.name || '',
        project_id: stakeholder?.project_id || '',
        project_name: stakeholder?.project_name || '',
        designation: stakeholder?.designation || '',
        department: stakeholder?.department || '',
        value_chain_category: stakeholder?.value_chain_category || 'Technology',
        is_champion: stakeholder?.is_champion || false,
        relationship_score: stakeholder?.relationship_score || 5,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-populate project name when project is selected
    useEffect(() => {
        if (formData.project_id) {
            const selectedProject = projects.find(p => p.project_id === formData.project_id);
            if (selectedProject) {
                setFormData(prev => ({ ...prev, project_name: selectedProject.project_name }));
            }
        }
    }, [formData.project_id, projects]);

    // Auto-calculate relationship score
    useEffect(() => {
        const score = calculateRelationshipScore(formData.is_champion || false);
        setFormData(prev => ({ ...prev, relationship_score: score }));
    }, [formData.is_champion]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name?.trim()) {
            newErrors.name = 'Stakeholder name is required';
        }

        if (!formData.project_id) {
            newErrors.project_id = 'Project selection is required';
        }

        if (!formData.designation) {
            newErrors.designation = 'Designation is required';
        }

        if (!formData.department) {
            newErrors.department = 'Department is required';
        }

        if (!formData.value_chain_category) {
            newErrors.value_chain_category = 'Value chain category is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const submissionData: Partial<Stakeholder> = {
            ...formData,
            account_id: accountId,
            updated_at: new Date().toISOString(),
        };

        if (!stakeholder) {
            submissionData.stakeholder_id = `stk-${Date.now()}`;
            submissionData.created_at = new Date().toISOString();
        }

        onSubmit(submissionData);
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'bg-green-100 text-green-700 border-green-300';
        if (score >= 5) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        return 'bg-red-100 text-red-700 border-red-300';
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50/80 to-transparent border-b border-blue-100 pb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-lg text-blue-950">
                            Stakeholder Information
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Stakeholder Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Stakeholder Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="Enter stakeholder name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={errors.name ? 'border-destructive' : ''}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>

                    {/* Project Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="project_id">
                            Project <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.project_id}
                            onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                        >
                            <SelectTrigger className={errors.project_id ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((project) => (
                                    <SelectItem key={project.project_id} value={project.project_id}>
                                        {project.project_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.project_id && (
                            <p className="text-sm text-destructive">{errors.project_id}</p>
                        )}
                    </div>

                    {/* Project Name - Auto-populated */}
                    <div className="space-y-2">
                        <Label>Project Name</Label>
                        <Input
                            value={formData.project_name}
                            readOnly
                            className="bg-muted cursor-not-allowed"
                            placeholder="Auto-populated from project selection"
                        />
                        <p className="text-xs text-muted-foreground">
                            Auto-populated based on selected project
                        </p>
                    </div>

                    {/* Designation */}
                    <div className="space-y-2">
                        <Label htmlFor="designation">
                            Designation <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.designation}
                            onValueChange={(value) => setFormData({ ...formData, designation: value })}
                        >
                            <SelectTrigger className={errors.designation ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select designation" />
                            </SelectTrigger>
                            <SelectContent>
                                {designations.map((designation) => (
                                    <SelectItem key={designation} value={designation}>
                                        {designation}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.designation && (
                            <p className="text-sm text-destructive">{errors.designation}</p>
                        )}
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                        <Label htmlFor="department">
                            Department <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.department}
                            onValueChange={(value) => setFormData({ ...formData, department: value })}
                        >
                            <SelectTrigger className={errors.department ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map((department) => (
                                    <SelectItem key={department} value={department}>
                                        {department}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.department && (
                            <p className="text-sm text-destructive">{errors.department}</p>
                        )}
                    </div>

                    {/* Value Chain Category */}
                    <div className="space-y-2">
                        <Label htmlFor="value_chain_category">
                            Value Chain Category <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.value_chain_category}
                            onValueChange={(value) => setFormData({ ...formData, value_chain_category: value as any })}
                        >
                            <SelectTrigger className={errors.value_chain_category ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select value chain category" />
                            </SelectTrigger>
                            <SelectContent>
                                {valueChainCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.value_chain_category && (
                            <p className="text-sm text-destructive">{errors.value_chain_category}</p>
                        )}
                    </div>

                    {/* Is Champion */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="is_champion">Is Champion</Label>
                            <Switch
                                id="is_champion"
                                checked={formData.is_champion}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_champion: checked })}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Mark as champion if this stakeholder actively advocates for your solutions
                        </p>
                    </div>

                    {/* Relationship Score - Auto-calculated */}
                    <div className="space-y-2">
                        <Label>Relationship Score</Label>
                        <div className="flex items-center gap-3">
                            <Badge className={cn('text-base px-4 py-2', getScoreColor(formData.relationship_score || 5))}>
                                {formData.relationship_score}/10
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                (Auto-calculated based on champion status)
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : stakeholder ? 'Update Stakeholder' : 'Create Stakeholder'}
                </Button>
            </div>
        </form>
    );
}
