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

interface Props {
    selectedDate: Date | null;
    onClose: () => void;
}

export function ReminderForm({ selectedDate, onClose }: Props) {
    const [reminderDate, setReminderDate] = useState<Date | undefined>(selectedDate || new Date());
    const [datePopoverOpen, setDatePopoverOpen] = useState(false);

    return (
        <div className="space-y-6 pt-2">
            <div className="space-y-4 max-w-xl mx-auto">
                <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">Reminder Title</Label>
                    <Input id="title" placeholder="e.g., Follow up on Design Specs" className="shadow-sm" />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">Related Project</Label>
                    <Select defaultValue="marketing">
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
                            <Input type="time" defaultValue="09:00" className="pl-9 shadow-sm" />
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">Repeat</Label>
                    <Select defaultValue="none">
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
                    />
                </div>

            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6 max-w-xl mx-auto">
                <div className="text-xs text-gray-400">© 2024 Project Planner. All rights reserved.</div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose} className="px-5 font-medium shadow-sm">Cancel</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-5 font-medium shadow-sm">Save Reminder</Button>
                </div>
            </div>
        </div>
    );
}
