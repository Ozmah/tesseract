import { useState } from 'react';
import { AperturePanel } from '@/components/aperture/aperture-panel';
import { ApertureSection } from '@/components/aperture/aperture-section';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const qualityOptions = [
    { value: 'main', label: 'Principal · 4K' },
    { value: 'sub', label: 'Secundario · 360p' },
];

export function FormsSection() {
    const [quality, setQuality] = useState<string | null>('sub');

    return (
        <ApertureSection
            id="forms"
            title="Formularios"
            description="Campos, selección y validación."
        >
            <div className="grid gap-6 lg:grid-cols-3">
                <AperturePanel title="Campos">
                    <div className="grid w-full gap-2">
                        <Label htmlFor="aperture-camera-name">Nombre</Label>
                        <Input id="aperture-camera-name" placeholder="TARS" />
                    </div>
                    <div className="grid w-full gap-2">
                        <Label htmlFor="aperture-camera-host">Host</Label>
                        <Input
                            id="aperture-camera-host"
                            defaultValue="100.64.0.12"
                            className="font-mono"
                        />
                    </div>
                    <div className="grid w-full gap-2">
                        <Label htmlFor="aperture-camera-disabled">
                            Deshabilitado
                        </Label>
                        <Input
                            id="aperture-camera-disabled"
                            defaultValue="rtsp://…"
                            disabled
                        />
                    </div>
                </AperturePanel>
                <AperturePanel title="Validación y secretos">
                    <div className="grid w-full gap-2">
                        <Label htmlFor="aperture-camera-port">Puerto</Label>
                        <Input
                            id="aperture-camera-port"
                            defaultValue="99999"
                            aria-invalid="true"
                        />
                        <InputError message="El puerto debe estar entre 1 y 65535." />
                    </div>
                    <div className="grid w-full gap-2">
                        <Label htmlFor="aperture-camera-password">
                            Contraseña de la cámara
                        </Label>
                        <PasswordInput
                            id="aperture-camera-password"
                            defaultValue="no-se-muestra"
                        />
                    </div>
                </AperturePanel>
                <AperturePanel title="Selección">
                    <div className="grid w-full gap-2">
                        <Label>Calidad</Label>
                        <Select
                            items={qualityOptions}
                            value={quality}
                            onValueChange={setQuality}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {qualityOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-3">
                        <Checkbox id="aperture-remember" defaultChecked />
                        <Label htmlFor="aperture-remember">
                            Recordar cámara
                        </Label>
                    </div>
                    <div className="flex items-center gap-3">
                        <Checkbox id="aperture-disabled" disabled />
                        <Label htmlFor="aperture-disabled">
                            Grabación (desactivada)
                        </Label>
                    </div>
                    <div className="grid gap-2">
                        <Label>Código</Label>
                        <InputOTP maxLength={6}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                </AperturePanel>
            </div>
        </ApertureSection>
    );
}
