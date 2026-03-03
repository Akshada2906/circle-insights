import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useAccounts } from "@/contexts/AccountContext";

interface SearchableAccountSelectProps {
    value: string;
    onSelect: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchableAccountSelect({
    value,
    onSelect,
    placeholder = "Select account...",
    className,
}: SearchableAccountSelectProps) {
    const [open, setOpen] = React.useState(false);
    const { accounts } = useAccounts();

    const formattedAccounts = accounts.map((account) => ({
        value: account.account_id,
        label: account.account_name,
    }));

    const selectedLabel = formattedAccounts.find(
        (account) => account.value === value
    )?.label;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between h-10 px-3 font-normal", className)}
                >
                    <span className="truncate">
                        {selectedLabel ? selectedLabel : <span className="text-muted-foreground">{placeholder}</span>}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search accounts..." className="h-9 outline-none border-none ring-0 select-none" />
                    <CommandList className="max-h-[200px] overflow-y-auto">
                        <CommandEmpty>No account found.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                onSelect={() => {
                                    onSelect("");
                                    setOpen(false);
                                }}
                                className="font-medium text-gray-500"
                            >
                                All Accounts
                            </CommandItem>
                            {formattedAccounts.map((account) => (
                                <CommandItem
                                    key={account.value}
                                    value={account.label}
                                    onSelect={(currentValue) => {
                                        const selected = formattedAccounts.find(a => a.label.toLowerCase() === currentValue.toLowerCase());
                                        onSelect(selected?.value === value ? "" : selected?.value || value);
                                        setOpen(false);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === account.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {account.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
