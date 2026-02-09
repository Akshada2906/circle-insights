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
            className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-border hover:border-primary/50"
            onClick={handleCardClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                            <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground truncate">{account.account_name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Delivery Unit: <span className="font-medium text-foreground">{account.delivery_unit}</span>
                            </p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
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

            <CardContent className="space-y-4">
                {/* Account Details */}
                <div className="grid grid-cols-2 gap-3">

                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Delivery Unit</span>
                        <p className="text-sm font-medium text-foreground">{account.delivery_unit}</p>
                    </div>
                </div>

                {/* Health Score removed as per request */}

                {/* Projects Info - REMOVED */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        {/* Projects count removed */}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {account.delivery_unit}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
