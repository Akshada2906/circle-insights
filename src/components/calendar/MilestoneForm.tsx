import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Trophy, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { CalendarMilestoneCreate, CalendarMilestoneUpdate, CalendarEventResponse } from '@/types/calendar-api';
import { Loader2, Trash2 } from 'lucide-react';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { SearchableAccountSelect } from './SearchableAccountSelect';
import { useAccounts } from '@/contexts/AccountContext';

interface Props {
    selectedDate: Date | null;
    onClose: () => void;
    initialData?: CalendarEventResponse | null;
}

export function MilestoneForm({ selectedDate, onClose, initialData }: Props) {
    const isEditing = !!initialData;
    const initialDetails = initialData?.details;

    const [targetDate, setTargetDate] = useState<Date | undefined>(
        initialDetails?.target_date ? new Date(initialDetails?.target_date) : (selectedDate || new Date())
    );
    const [datePopoverOpen, setDatePopoverOpen] = useState(false);
    const [progress, setProgress] = useState([initialDetails?.progress_percent || 0]);

    const [name, setName] = useState(initialDetails?.milestone_name || "");
    const [accountId, setAccountId] = useState(initialDetails?.account_id || "");
    const [description, setDescription] = useState(initialDetails?.description || "");
    const [owner, setOwner] = useState("alex");
    const [impact, setImpact] = useState(initialDetails?.impact_level || "HIGH");

    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { accounts } = useAccounts();

    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleAccountSelect = (newAccountId: string) => {
        const oldAccount = accounts.find(a => a.account_id === accountId);
        const newAccount = accounts.find(a => a.account_id === newAccountId);

        setName(prevName => {
            let newName = prevName;
            if (oldAccount && newName.endsWith(` - (${oldAccount.account_name})`)) {
                newName = newName.slice(0, newName.lastIndexOf(` - (${oldAccount.account_name})`)).trim();
            }
            if (newAccount && newName && !newName.endsWith(` - (${newAccount.account_name})`)) {
                newName = `${newName} - (${newAccount.account_name})`;
            }
            return newName;
        });
        setAccountId(newAccountId);
    };

    const handleNameBlur = () => {
        const account = accounts.find(a => a.account_id === accountId);
        if (account && name && !name.endsWith(` - (${account.account_name})`)) {
            setName(`${name.trim()} - (${account.account_name})`);
        }
    };

    const handleSubmitClick = () => {
        if (!name.trim()) {
            toast({
                title: "Validation Error",
                description: "Please enter a milestone name.",
                variant: "destructive",
            });
            return;
        }

        if (isEditing) {
            setIsUpdateDialogOpen(true);
        } else {
            executeSubmit();
        }
    };

    const executeSubmit = async () => {
        try {
            setIsLoading(true);

            const account = accounts.find(a => a.account_id === accountId);
            const accountSuffix = account ? ` - (${account.account_name})` : "";
            let finalName = name;
            if (accountSuffix && !finalName.includes(`- (${account.account_name})`)) {
                finalName = finalName.trim() + accountSuffix;
            }

            if (isEditing && initialData?.details?.id) {
                const milestoneUpdate: CalendarMilestoneUpdate = {
                    milestone_name: finalName,
                    description: description,
                    target_date: targetDate ? format(targetDate, "yyyy-MM-dd'T'00:00:00.000'Z'") : null,
                    impact_level: impact,
                    progress_percent: progress[0],
                    account_id: accountId || null,
                };
                await api.updateCalendarMilestone(initialData.details.id, milestoneUpdate);
                toast({ title: "Success", description: "Milestone updated successfully." });
            } else {
                const milestone: CalendarMilestoneCreate = {
                    milestone_name: finalName,
                    description: description,
                    target_date: targetDate ? format(targetDate, "yyyy-MM-dd'T'00:00:00.000'Z'") : null,
                    impact_level: impact,
                    progress_percent: progress[0],
                    account_id: accountId || null,
                };
                await api.createCalendarMilestone(milestone);
                toast({ title: "Success", description: "Milestone created successfully." });
            }

            onClose();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: isEditing ? "Failed to update milestone" : "Failed to create milestone",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
            setIsUpdateDialogOpen(false);
        }
    };

    const handleDeleteClick = () => {
        if (!initialData?.details?.id) return;
        setIsDeleteDialogOpen(true);
    };

    const executeDelete = async () => {
        if (!initialData?.details?.id) return;

        try {
            setIsLoading(true);
            await api.deleteCalendarMilestone(initialData.details.id);
            toast({ title: "Success", description: "Milestone deleted successfully." });
            onClose();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete milestone.", variant: "destructive" });
        } finally {
            setIsLoading(false);
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <div className="space-y-6 pt-2">
            <div className="space-y-4 max-w-xl mx-auto">
                <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Milestone Name</Label>
                    <div className="relative">
                        <Trophy className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input id="name" placeholder="e.g., Beta Release, Security Audit Complete" className="pl-9 shadow-sm" value={name} onChange={(e) => setName(e.target.value)} onBlur={handleNameBlur} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Related Account</Label>
                        <SearchableAccountSelect value={accountId} onSelect={handleAccountSelect} placeholder="Search accounts..." />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Target Date</Label>
                        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal shadow-sm",
                                        !targetDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {targetDate ? format(targetDate, "yyyy-MM-dd") : <span>Select date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={targetDate}
                                    onSelect={(d) => { setTargetDate(d); setDatePopoverOpen(false); }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <Textarea
                        placeholder="Outline the success criteria and deliverables for this milestone..."
                        className="resize-none min-h-[100px] shadow-sm"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Owner</Label>
                        <Select value={owner} onValueChange={setOwner}>
                            <SelectTrigger className="shadow-sm">
                                <SelectValue placeholder="Select owner">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
                                            <AvatarFallback>AR</AvatarFallback>
                                        </Avatar>
                                        Alex Rivera
                                    </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="alex">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
                                            <AvatarFallback>AR</AvatarFallback>
                                        </Avatar>
                                        Alex Rivera
                                    </div>
                                </SelectItem>
                                <SelectItem value="sarah">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" />
                                            <AvatarFallback>SJ</AvatarFallback>
                                        </Avatar>
                                        Sarah Jenkins
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Impact Level</Label>
                        <Select value={impact} onValueChange={setImpact}>
                            <SelectTrigger className="shadow-sm">
                                <SelectValue placeholder="Select impact" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HIGH">High Impact</SelectItem>
                                <SelectItem value="MEDIUM">Medium Impact</SelectItem>
                                <SelectItem value="LOW">Low Impact</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <Target className="h-4 w-4 text-blue-500" /> Progress Status
                        </Label>
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{progress[0]}%</span>
                    </div>

                    <Slider
                        value={progress}
                        onValueChange={setProgress}
                        max={100}
                        step={1}
                        className="py-2"
                    />

                    <div className="flex justify-between text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                        <span>Not Started</span>
                        <span>In Progress</span>
                        <span>Final Review</span>
                        <span>Completed</span>
                    </div>
                </div>

            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6 max-w-xl mx-auto">
                <div className="text-xs text-gray-400">© 2024 Project Planner. All rights reserved.</div>
                <div className="flex gap-2">
                    {isEditing && (
                        <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDeleteClick} disabled={isLoading}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose} className="px-5 font-medium shadow-sm">Cancel</Button>
                    <Button onClick={handleSubmitClick} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-5 font-medium shadow-sm">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isEditing ? "Update Milestone" : "Create Milestone"}
                    </Button>
                </div>
            </div>

            <ConfirmationDialog
                open={isUpdateDialogOpen}
                onOpenChange={setIsUpdateDialogOpen}
                title="Update Milestone"
                description="Are you sure you want to update this milestone? The changes will be saved."
                onConfirm={executeSubmit}
                confirmText="Update Milestone"
                isLoading={isLoading}
            />

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete Milestone"
                description="Are you sure you want to delete this milestone? This action cannot be undone."
                onConfirm={executeDelete}
                variant="destructive"
                confirmText="Delete Milestone"
                isLoading={isLoading}
            />
        </div>
    );
}
