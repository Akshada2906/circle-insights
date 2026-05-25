import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight } from 'lucide-react';

export function PEAccountCard({ firm }: { firm: any }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleCardClick = () => {
        navigate(`/private-equity/${firm.id}`, { state: { backUrl: location.pathname + location.search } });
    };

    return (
        <Card
            className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-purple-100 hover:border-purple-300 border-t-4 border-t-purple-600 bg-gradient-to-br from-white to-purple-50/30 relative"
            onClick={handleCardClick}
        >
            <div className="absolute top-3 right-3 z-10 pointer-events-none">
                <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 shadow-sm">Private Equity</Badge>
            </div>
            
            <CardHeader className="pb-3 border-b border-purple-50/50 bg-gradient-to-r from-purple-50/40 to-transparent pt-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0 pr-28">
                        <div className="p-2 bg-purple-100/50 rounded-lg shrink-0 text-purple-600">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate text-lg text-purple-950" title={firm.name}>{firm.name}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Portfolio Size</span>
                    <p className="text-sm font-medium text-foreground truncate">{firm.portfolio_size || 0} Accounts</p>
                </div>
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Total Revenue</span>
                    <p className="text-sm font-medium text-foreground truncate">
                        {firm.total_revenue ? `$${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(firm.total_revenue)}` : '$0'}
                    </p>
                </div>
                <div className="space-y-1 col-span-2">
                    <span className="text-xs text-muted-foreground">Overview</span>
                    <p className="text-sm font-medium text-foreground line-clamp-2" title={firm.overview}>{firm.overview || 'No overview provided.'}</p>
                </div>
                <div className="col-span-2 flex justify-end mt-1">
                    <Button variant="ghost" size="sm" className="text-purple-600 group-hover:bg-purple-50 gap-2 -mr-2">
                      View details <ArrowRight className="w-3 h-3"/>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
