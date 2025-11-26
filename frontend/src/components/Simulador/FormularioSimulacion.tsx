import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FormularioSimulacionProps {
    onSimulate: (type: 'coeficiente' | 'tipo', params: any) => void;
    loading: boolean;
}

export const FormularioSimulacion = ({ onSimulate, loading }: FormularioSimulacionProps) => {
    const [simulationType, setSimulationType] = useState<'coeficiente' | 'tipo'>('coeficiente');

    // State for Coeficiente simulation
    const [unidad, setUnidad] = useState('GALQ');
    const [coeficienteNuevo, setCoeficienteNuevo] = useState('');

    // State for Tipo simulation
    const [nnCodigo, setNnCodigo] = useState('');

    const handleSubmit = () => {
        if (simulationType === 'coeficiente') {
            onSimulate('coeficiente', { unidad, coeficienteNuevo: parseFloat(coeficienteNuevo) });
        } else {
            onSimulate('tipo', { nnCodigo });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configuración de Simulación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <RadioGroup
                    defaultValue="coeficiente"
                    value={simulationType}
                    onValueChange={(v) => setSimulationType(v as 'coeficiente' | 'tipo')}
                    className="flex space-x-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="coeficiente" id="r1" />
                        <Label htmlFor="r1">Cambio de Coeficiente</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tipo" id="r2" />
                        <Label htmlFor="r2">Cambio de Tipo (S → N)</Label>
                    </div>
                </RadioGroup>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Obra Social</Label>
                        <Select defaultValue="1">
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar OS" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">OSDE</SelectItem>
                                <SelectItem value="2">SWISS MEDICAL</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {simulationType === 'coeficiente' ? (
                        <>
                            <div className="space-y-2">
                                <Label>Unidad</Label>
                                <Select value={unidad} onValueChange={setUnidad}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar Unidad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GALQ">GALQ</SelectItem>
                                        <SelectItem value="UGQ">UGQ</SelectItem>
                                        <SelectItem value="GALP">GALP</SelectItem>
                                        <SelectItem value="UGB">UGB</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Nuevo Valor de Coeficiente</Label>
                                <Input
                                    type="number"
                                    placeholder="Ej: 1200.50"
                                    value={coeficienteNuevo}
                                    onChange={(e) => setCoeficienteNuevo(e.target.value)}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <Label>Práctica (Código)</Label>
                            <Input
                                placeholder="Ej: 180116"
                                value={nnCodigo}
                                onChange={(e) => setNnCodigo(e.target.value)}
                            />
                            <p className="text-sm text-muted-foreground">
                                Ingrese el código de la práctica fijada que desea simular como nomenclada.
                            </p>
                        </div>
                    )}

                    <Button
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={loading || (simulationType === 'coeficiente' && !coeficienteNuevo) || (simulationType === 'tipo' && !nnCodigo)}
                    >
                        {loading ? 'Simulando...' : 'Ejecutar Simulación'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
