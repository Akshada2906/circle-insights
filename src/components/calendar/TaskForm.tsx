import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Bold, Italic, List, Link, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchableAccountSelect } from './SearchableAccountSelect';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { CalendarTaskCreate, CalendarTaskUpdate, CalendarEventResponse } from '@/types/calendar-api';
import { Loader2 } from 'lucide-react';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useAccounts } from '@/contexts/AccountContext';

interface Props {
    selectedDate: Date | null;
    onClose: () => void;
    initialData?: CalendarEventResponse | null;
}

export function TaskForm({ selectedDate, onClose, initialData }: Props) {
    const isEditing = !!initialData;
    const initialDetails = initialData?.details;

    const [startDate, setStartDate] = useState<Date | undefined>(
        initialDetails?.start_date ? new Date(initialDetails.start_date) : (selectedDate || new Date())
    );
    const [dueDate, setDueDate] = useState<Date | undefined>(
        initialDetails?.due_date ? new Date(initialDetails.due_date) : undefined
    );
    const [startTime, setStartTime] = useState(
        initialDetails?.start_date ? format(new Date(initialDetails.start_date), "HH:mm") : "09:00"
    );
    const [dueTime, setDueTime] = useState(
        initialDetails?.due_date ? format(new Date(initialDetails.due_date), "HH:mm") : "17:00"
    );

    const [accountId, setAccountId] = useState(initialDetails?.account_id || "");

    const [title, setTitle] = useState(initialDetails?.task_title || "");
    const [description, setDescription] = useState(initialDetails?.description || "");
    const [priority, setPriority] = useState(initialDetails?.priority || "HIGH");
    const [status, setStatus] = useState(initialDetails?.status || "TO_DO");

    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { accounts } = useAccounts();

    const [datePopoverOpen, setDatePopoverOpen] = useState(false);
    const [duePopoverOpen, setDuePopoverOpen] = useState(false);

    const [estimatedValue, setEstimatedValue] = useState(initialDetails?.estimated_hours ? initialDetails.estimated_hours.toString() : "0");
    const [estimatedUnit, setEstimatedUnit] = useState("Hours");

    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleAccountSelect = (newAccountId: string) => {
        const oldAccount = accounts.find(a => a.account_id === accountId);
        const newAccount = accounts.find(a => a.account_id === newAccountId);

        setTitle(prevTitle => {
            let newTitle = prevTitle;
            if (oldAccount && newTitle.endsWith(` - (${oldAccount.account_name})`)) {
                newTitle = newTitle.slice(0, newTitle.lastIndexOf(` - (${oldAccount.account_name})`)).trim();
            }
            if (newAccount && newTitle && !newTitle.endsWith(` - (${newAccount.account_name})`)) {
                newTitle = `${newTitle} - (${newAccount.account_name})`;
            }
            return newTitle;
        });
        setAccountId(newAccountId);
    };

    const handleTitleBlur = () => {
        const account = accounts.find(a => a.account_id === accountId);
        if (account && title && !title.endsWith(` - (${account.account_name})`)) {
            setTitle(`${title.trim()} - (${account.account_name})`);
        }
    };

    useEffect(() => {
        if (startDate && dueDate) {
            const start = new Date(startDate);
            const [startH, startM] = startTime.split(':').map(Number);
            start.setHours(startH || 0, startM || 0, 0, 0);

            const end = new Date(dueDate);
            const [endH, endM] = dueTime.split(':').map(Number);
            end.setHours(endH || 0, endM || 0, 0, 0);

            const diffMs = end.getTime() - start.getTime();
            if (diffMs > 0) {
                const diffHours = diffMs / (1000 * 60 * 60);
                if (diffHours >= 24) {
                    setEstimatedValue((diffHours / 24).toFixed(1).replace(/\.0$/, ''));
                    setEstimatedUnit("Days");
                } else {
                    setEstimatedValue(diffHours.toFixed(1).replace(/\.0$/, ''));
                    setEstimatedUnit("Hours");
                }
            } else {
                setEstimatedValue("0");
            }
        }
    }, [startDate, startTime, dueDate, dueTime]);

    const handleSubmitClick = () => {
        if (!title.trim() || !accountId) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields (Title, Account).",
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

            const combinedStart = startDate ? new Date(
                startDate.getFullYear(),
                startDate.getMonth(),
                startDate.getDate(),
                parseInt(startTime.split(':')[0]),
                parseInt(startTime.split(':')[1])
            ) : new Date(); // Fallback to current time if no start date

            const combinedDue = dueDate ? new Date(
                dueDate.getFullYear(),
                dueDate.getMonth(),
                dueDate.getDate(),
                parseInt(dueTime.split(':')[0]),
                parseInt(dueTime.split(':')[1])
            ) : null;

            // Simple hour difference estimation
            const estimatedHours = combinedDue ? Math.max(0, Math.round((combinedDue.getTime() - combinedStart.getTime()) / (1000 * 60 * 60))) : 0;

            const account = accounts.find(a => a.account_id === accountId);
            const accountSuffix = account ? ` - (${account.account_name})` : "";
            let finalTitle = title;
            if (accountSuffix && !finalTitle.includes(`- (${account.account_name})`)) {
                finalTitle = finalTitle.trim() + accountSuffix;
            }

            if (isEditing && initialData?.details?.id) {
                const taskUpdate: CalendarTaskUpdate = {
                    account_id: accountId || null,
                    priority,
                    status,
                    start_date: combinedStart.toISOString(),
                    due_date: combinedDue ? combinedDue.toISOString() : null,
                    estimated_hours: estimatedHours,
                    task_title: finalTitle,
                    description,
                };
                await api.updateCalendarTask(initialData.details.id, taskUpdate);
                toast({ title: "Success", description: "Task updated successfully." });
            } else {
                const task: CalendarTaskCreate = {
                    account_id: accountId || null,
                    priority,
                    status,
                    start_date: combinedStart.toISOString(),
                    due_date: combinedDue ? combinedDue.toISOString() : null,
                    estimated_hours: estimatedHours,
                    task_title: finalTitle,
                    description,
                };
                await api.createCalendarTask(task);
                toast({ title: "Success", description: "Task created successfully." });
            }

            onClose();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: isEditing ? "Failed to update task" : "Failed to create task",
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
            await api.deleteCalendarTask(initialData.details.id);
            toast({ title: "Success", description: "Task deleted successfully." });
            onClose();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete task.", variant: "destructive" });
        } finally {
            setIsLoading(false);
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <div className="space-y-6 pt-2 h-full">
            <div className="flex flex-col md:flex-row gap-6">

                {/* Left Column */}
                <div className="flex-1 space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="title" className="text-sm font-medium text-gray-700">Task Title</Label>
                        <Input id="title" placeholder="Enter a concise title for the task" className="shadow-sm" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleTitleBlur} />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <div className="border border-gray-200 rounded-md shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                            <div className="bg-gray-50 flex items-center gap-1 p-1 border-b border-gray-200">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-600 hover:bg-gray-200"><Bold className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-600 hover:bg-gray-200"><Italic className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-600 hover:bg-gray-200"><List className="h-4 w-4" /></Button>
                                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-600 hover:bg-gray-200"><Link className="h-4 w-4" /></Button>
                            </div>
                            <Textarea placeholder="Describe the scope of this task..." className="border-0 shadow-none focus-visible:ring-0 resize-none min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                    </div>


                </div>

                {/* Right Column */}
                <div className="flex-1 space-y-4">


                    <div className="space-y-1.5">
                        <SearchableAccountSelect value={accountId} onSelect={handleAccountSelect} placeholder="Search accounts..." />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-gray-700">Priority</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger className="shadow-sm">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HIGH">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div> High
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="MEDIUM">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div> Medium
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="LOW">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div> Low
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-gray-700">Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="shadow-sm">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TO_DO">To Do</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="DONE">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                        <div className="flex gap-2">
                            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal shadow-sm flex-1",
                                            !startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "MMM d, yyyy") : <span>Select date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={(d) => { if (d) setStartDate(d); setDatePopoverOpen(false); }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <Input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-[120px] shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                        <div className="flex gap-2">
                            <Popover open={duePopoverOpen} onOpenChange={setDuePopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal shadow-sm flex-1",
                                            !dueDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dueDate ? format(dueDate, "MMM d, yyyy") : <span>Select date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dueDate}
                                        onSelect={(d) => { if (d) setDueDate(d); setDuePopoverOpen(false); }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <Input
                                type="time"
                                value={dueTime}
                                onChange={(e) => setDueTime(e.target.value)}
                                className="w-[120px] shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Estimated Time</Label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                type="number"
                                value={estimatedValue}
                                onChange={(e) => setEstimatedValue(e.target.value)}
                                min="0"
                                className="pl-9 pr-[84px] shadow-sm"
                            />
                            <div className="absolute right-1 top-1 text-gray-500">
                                <Select value={estimatedUnit} onValueChange={setEstimatedUnit}>
                                    <SelectTrigger className="h-8 border-0 shadow-none bg-transparent focus:ring-0 w-[80px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Hours">Hours</SelectItem>
                                        <SelectItem value="Days">Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>



                </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6">
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
                        {isEditing ? "Update Task" : "Create Task"}
                    </Button>
                </div>
            </div>

            <ConfirmationDialog
                open={isUpdateDialogOpen}
                onOpenChange={setIsUpdateDialogOpen}
                title="Update Task"
                description="Are you sure you want to update this task? The changes will be saved."
                onConfirm={executeSubmit}
                confirmText="Update Task"
                isLoading={isLoading}
            />

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete Task"
                description="Are you sure you want to delete this task? This action cannot be undone."
                onConfirm={executeDelete}
                variant="destructive"
                confirmText="Delete Task"
                isLoading={isLoading}
            />
        </div>
    );
}
