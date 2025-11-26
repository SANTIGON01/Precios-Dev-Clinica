import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, FileText } from "lucide-react";

interface ConfiguradorReporteProps {
    onGenerate: (filters: any) => void;
    onExport: (filters: any) => void;
    loading: boolean;
}

export const ConfiguradorReporte = ({ onGenerate, onExport, loading }: ConfiguradorReporteProps) => {
    const [osCodigo, setOsCodigo] = useState('1');
    const [ruCodigo, setRuCodigo] = useState<string>('all');

    const handleGenerate = () => {
        onGenerate({ osCodigo: parseInt(osCodigo), ruCodigo: ruCodigo === 'all' ? undefined : parseInt(ruCodigo) });
    };

    const handleExport = () => {
        onExport({ osCodigo: parseInt(osCodigo), ruCodigo: ruCodigo === 'all' ? undefined : parseInt(ruCodigo) });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configuración de Reporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Obra Social</Label>
                        <Select value={osCodigo} onValueChange={setOsCodigo}>
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
                        <Label>Rubro (Opcional)</Label>
                        <Select value={ruCodigo} onValueChange={setRuCodigo}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todos los rubros" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="1">CONSULTAS</SelectItem>
                                <SelectItem value="2">QUIRURGICA</SelectItem>
                                <SelectItem value="3">AYUDA MEDICA</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex space-x-4">
                    <Button className="flex-1" onClick={handleGenerate} disabled={loading}>
                        <FileText className="mr-2 h-4 w-4" />
                        Generar Vista Previa
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleExport} disabled={loading}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Exportar CSV
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
