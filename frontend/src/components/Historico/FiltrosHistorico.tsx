import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

interface FiltrosHistoricoProps {
    onSearch: (filters: any) => void;
}

export const FiltrosHistorico = ({ onSearch }: FiltrosHistoricoProps) => {
    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                        <Label>Obra Social</Label>
                        <Select defaultValue="1">
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar OS" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">OSDE</SelectItem>
                                <SelectItem value="2">SWISS MEDICAL</SelectItem>
                                <SelectItem value="3">GALENO</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Práctica (Código)</Label>
                        <Input placeholder="Ej: 420101" />
                    </div>

                    <div className="space-y-2">
                        <Label>Período</Label>
                        <Select defaultValue="12">
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="6">Últimos 6 meses</SelectItem>
                                <SelectItem value="12">Últimos 12 meses</SelectItem>
                                <SelectItem value="24">Últimos 24 meses</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button className="w-full" onClick={() => onSearch({})}>
                        <Search className="mr-2 h-4 w-4" />
                        Buscar
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
