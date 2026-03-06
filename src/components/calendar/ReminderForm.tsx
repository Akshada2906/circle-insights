import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Users, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { CalendarReminderCreate, CalendarReminderUpdate, CalendarEventResponse } from '@/types/calendar-api';
import { Loader2, Trash2 } from 'lucide-react';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';

interface Props {
    selectedDate: Date | null;
    onClose: () => void;
    initialData?: CalendarEventResponse | null;
}

export function ReminderForm({ selectedDate, onClose, initialData }: Props) {
    const isEditing = !!initialData;
    const initialDetails = initialData?.details;

    const [reminderDate, setReminderDate] = useState<Date | undefined>(
        initialDetails?.reminder_date ? new Date(initialDetails?.reminder_date) : (selectedDate || new Date())
    );
    const [datePopoverOpen, setDatePopoverOpen] = useState(false);

    const [title, setTitle] = useState(initialDetails?.reminder_title || "");
    const [project, setProject] = useState("marketing");

    // Parse time if it exists (e.g. "09:00:00" -> "09:00")
    const [time, setTime] = useState(initialDetails?.reminder_time ? initialDetails.reminder_time.substring(0, 5) : "09:00");
    const [repeat, setRepeat] = useState("none");
    const [notes, setNotes] = useState(initialDetails?.notes || "");

    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleSubmitClick = () => {
        if (!title.trim()) {
            toast({
                title: "Validation Error",
                description: "Please enter a reminder title.",
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

            if (isEditing && initialData?.details?.id) {
                const reminderUpdate: CalendarReminderUpdate = {
                    reminder_title: title,
                    notes: notes,
                    reminder_date: reminderDate ? format(reminderDate, "yyyy-MM-dd") : null,
                    reminder_time: time ? `${time}:00` : null,
                };
                await api.updateCalendarReminder(initialData.details.id, reminderUpdate);
                toast({ title: "Success", description: "Reminder updated successfully." });
            } else {
                const reminder: CalendarReminderCreate = {
                    reminder_title: title,
                    notes: notes,
                    reminder_date: reminderDate ? format(reminderDate, "yyyy-MM-dd") : null,
                    reminder_time: time ? `${time}:00` : null,
                };
                await api.createCalendarReminder(reminder);
                toast({ title: "Success", description: "Reminder created successfully." });
            }

            onClose();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: isEditing ? "Failed to update reminder" : "Failed to create reminder",
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
            await api.deleteCalendarReminder(initialData.details.id);
            toast({ title: "Success", description: "Reminder deleted successfully." });
            onClose();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete reminder.", variant: "destructive" });
        } finally {
            setIsLoading(false);
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <div className="space-y-6 pt-2">
            <div className="space-y-4 max-w-xl mx-auto">
                <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">Reminder Title</Label>
                    <Input id="title" placeholder="e.g., Follow up on Design Specs" className="shadow-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">Related Project</Label>
                    <Select value={project} onValueChange={setProject}>
                        <SelectTrigger className="shadow-sm">
                            <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ecommerce">E-Commerce Redesign</SelectItem>
                            <SelectItem value="marketing">Q4 Marketing Campaign</SelectItem>
                            <SelectItem value="internal">Internal Tools</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Reminder Date</Label>
                        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal shadow-sm",
                                        !reminderDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {reminderDate ? format(reminderDate, "yyyy-MM-dd") : <span>Select date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={reminderDate}
                                    onSelect={(d) => { setReminderDate(d); setDatePopoverOpen(false); }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Reminder Time</Label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="pl-9 shadow-sm" />
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">Repeat</Label>
                    <Select value={repeat} onValueChange={setRepeat}>
                        <SelectTrigger className="shadow-sm">
                            <SelectValue placeholder="Does not repeat" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Does not repeat</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Users className="h-4 w-4" /> Notify Users
                    </Label>
                    <div className="flex items-center justify-between p-2 border border-gray-200 rounded-md shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                <Avatar className="h-6 w-6 border border-white">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user1`} />
                                    <AvatarFallback>U1</AvatarFallback>
                                </Avatar>
                                <Avatar className="h-6 w-6 border border-white">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user2`} />
                                    <AvatarFallback>U2</AvatarFallback>
                                </Avatar>
                                <Avatar className="h-6 w-6 border border-white">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user3`} />
                                    <AvatarFallback>U3</AvatarFallback>
                                </Avatar>
                            </div>
                            <span className="text-sm text-gray-600">3 users selected</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Plus className="h-4 w-4" /></Button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">Notes</Label>
                    <Textarea
                        placeholder="Add any additional context or instructions..."
                        className="resize-none min-h-[100px] shadow-sm"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
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
                        {isEditing ? "Update Reminder" : "Save Reminder"}
                    </Button>
                </div>
            </div>

            <ConfirmationDialog
                open={isUpdateDialogOpen}
                onOpenChange={setIsUpdateDialogOpen}
                title="Update Reminder"
                description="Are you sure you want to update this reminder? The changes will be saved."
                onConfirm={executeSubmit}
                confirmText="Update Reminder"
                isLoading={isLoading}
            />

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete Reminder"
                description="Are you sure you want to delete this reminder? This action cannot be undone."
                onConfirm={executeDelete}
                variant="destructive"
                confirmText="Delete Reminder"
                isLoading={isLoading}
            />
        </div>
    );
}
