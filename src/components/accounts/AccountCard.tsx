import { useNavigate } from 'react-router-dom';
import { AccountWithProjects } from '@/types/account';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, Briefcase, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountCardProps {
    account: AccountWithProjects;
    onEdit?: (accountId: string) => void;
    onDelete?: (accountId: string) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/accounts/${account.account_id}`);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit(account.account_id);
        } else {
            navigate(`/accounts/${account.account_id}/edit`);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(account.account_id);
        }
    };

    const getHealthScoreColor = (score: number) => {
        if (score >= 70) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <Card
            className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-blue-100 hover:border-blue-300 border-t-4 border-t-blue-600 bg-gradient-to-br from-white to-blue-100/40"
            onClick={handleCardClick}
        >
            <CardHeader className="pb-3 border-b border-blue-100/50 bg-gradient-to-r from-blue-50/50 to-transparent">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-blue-100/50 rounded-lg shrink-0 text-blue-600">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate text-lg text-blue-950">{account.account_name}</h3>
                            </div>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-blue-100/50 text-blue-900/40 hover:text-blue-900">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleEdit}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Account
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Account
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="pt-4 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Delivery Owner</span>
                    <p className="text-sm font-medium text-foreground truncate" title={account.delivery_owner || '-'}>{account.delivery_owner || '-'}</p>
                </div>
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Current Pipeline</span>
                    <p className="text-sm font-medium text-foreground" title={account.current_pipeline_value || '-'}>{account.current_pipeline_value || '-'}</p>
                </div>
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Active Projects</span>
                    <p className="text-sm font-medium text-foreground truncate" title={account.number_of_active_projects || '-'}>{account.number_of_active_projects || '-'}</p>
                </div>
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Engagement Model</span>
                    <p className="text-sm font-medium text-foreground truncate" title={account.engagement_models || '-'}>{account.engagement_models || '-'}</p>
                </div>
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Engagement Age</span>
                    <p className="text-sm font-medium text-foreground truncate" title={account.engagement_age || '-'}>{account.engagement_age || '-'}</p>
                </div>
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Overall Health</span>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(
                            "font-medium",
                            account.overall_delivery_health === 'Green' ? "bg-green-100 text-green-700 border-green-200" :
                                account.overall_delivery_health === 'Amber' ? "bg-amber-100 text-amber-700 border-amber-200" :
                                    account.overall_delivery_health === 'Red' ? "bg-red-100 text-red-700 border-red-200" :
                                        "bg-gray-100 text-gray-700 border-gray-200"
                        )}>
                            {account.overall_delivery_health || 'Unknown'}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
