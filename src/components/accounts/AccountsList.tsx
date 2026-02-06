import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountWithProjects } from '@/types/account';
import { AccountCard } from './AccountCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Briefcase } from 'lucide-react';
import { deliveryUnits } from '@/constants';

interface AccountsListProps {
    accounts: AccountWithProjects[];
    onEdit?: (accountId: string) => void;
    onDelete?: (accountId: string) => void;
}

export function AccountsList({ accounts, onEdit, onDelete }: AccountsListProps) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDeliveryUnit, setFilterDeliveryUnit] = useState<string>('all');

    const filteredAccounts = accounts.filter((account) => {
        const matchesSearch =
            account.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            account.account_leader.toLowerCase().includes(searchQuery.toLowerCase()) ||
            account.account_id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDeliveryUnit =
            filterDeliveryUnit === 'all' || account.delivery_unit === filterDeliveryUnit;

        return matchesSearch && matchesDeliveryUnit;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Accounts
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => navigate('/accounts/new')} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Account
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search accounts by name or delivery unit..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={filterDeliveryUnit} onValueChange={setFilterDeliveryUnit}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Delivery Unit" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Units</SelectItem>
                        {deliveryUnits.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                                {unit}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Accounts Grid */}
            {filteredAccounts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAccounts.map((account) => (
                        <AccountCard
                            key={account.account_id}
                            account={account}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4">
                        <Briefcase className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No accounts found</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">
                        {searchQuery || filterDeliveryUnit !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Get started by creating your first account'}
                    </p>
                    {!searchQuery && filterDeliveryUnit === 'all' && (
                        <Button onClick={() => navigate('/accounts/new')} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Create First Account
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
