import {
    ArrowClockwiseIcon,
    ArrowsOutIcon,
    GridFourIcon,
    MagnifyingGlassMinusIcon,
    MagnifyingGlassPlusIcon,
    SquareIcon,
    TrashIcon,
} from '@phosphor-icons/react';
import { AperturePanel } from '@/components/aperture/aperture-panel';
import { ApertureSection } from '@/components/aperture/aperture-section';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const variants = [
    'default',
    'secondary',
    'outline',
    'ghost',
    'destructive',
    'link',
] as const;
const sizes = ['xs', 'sm', 'default', 'lg'] as const;

export function ActionsSection() {
    return (
        <ApertureSection
            id="actions"
            title="Acciones"
            description="Botones, botones de ícono y toggles."
        >
            <div className="grid gap-6 lg:grid-cols-3">
                <AperturePanel title="Variantes">
                    {variants.map((variant) => (
                        <div
                            key={variant}
                            className="flex flex-wrap items-center gap-2"
                        >
                            <Button variant={variant}>Reconectar</Button>
                            <Button variant={variant} disabled>
                                Reconectar
                            </Button>
                        </div>
                    ))}
                </AperturePanel>
                <AperturePanel title="Tamaños e íconos">
                    <div className="flex flex-wrap items-end gap-2">
                        {sizes.map((size) => (
                            <Button key={size} size={size}>
                                {size}
                            </Button>
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button>
                            <ArrowClockwiseIcon data-icon="inline-start" />
                            Reconectar
                        </Button>
                        <Button variant="outline" disabled>
                            <Spinner data-icon="inline-start" />
                            Conectando
                        </Button>
                        <Button variant="destructive">
                            <TrashIcon data-icon="inline-start" />
                            Eliminar
                        </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            size="icon-sm"
                            variant="outline"
                            aria-label="Alejar"
                        >
                            <MagnifyingGlassMinusIcon />
                        </Button>
                        <Button
                            size="icon-sm"
                            variant="outline"
                            aria-label="Acercar"
                        >
                            <MagnifyingGlassPlusIcon />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Pantalla completa"
                        >
                            <ArrowsOutIcon />
                        </Button>
                        <Button size="icon-lg" aria-label="Pantalla completa">
                            <ArrowsOutIcon />
                        </Button>
                    </div>
                </AperturePanel>
                <AperturePanel title="Toggles">
                    <div className="flex flex-wrap gap-2">
                        <Toggle aria-label="Mostrar cuadrícula">
                            <GridFourIcon />
                        </Toggle>
                        <Toggle variant="outline" defaultPressed>
                            Substream
                        </Toggle>
                        <Toggle variant="outline" disabled>
                            Audio
                        </Toggle>
                    </div>
                    <ToggleGroup variant="outline" defaultValue={['grid']}>
                        <ToggleGroupItem value="grid" aria-label="Cuadrícula">
                            <GridFourIcon />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="single" aria-label="Individual">
                            <SquareIcon />
                        </ToggleGroupItem>
                    </ToggleGroup>
                    <ToggleGroup
                        variant="outline"
                        spacing={0}
                        defaultValue={['main']}
                    >
                        <ToggleGroupItem value="main">
                            Principal
                        </ToggleGroupItem>
                        <ToggleGroupItem value="sub">
                            Secundario
                        </ToggleGroupItem>
                    </ToggleGroup>
                </AperturePanel>
            </div>
        </ApertureSection>
    );
}
