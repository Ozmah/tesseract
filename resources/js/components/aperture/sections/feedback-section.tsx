import { InfoIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { AperturePanel } from '@/components/aperture/aperture-panel';
import { ApertureSection } from '@/components/aperture/aperture-section';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

const badgeVariants = [
    'default',
    'secondary',
    'destructive',
    'outline',
    'ghost',
    'link',
] as const;

export function FeedbackSection() {
    return (
        <ApertureSection
            id="feedback"
            title="Feedback"
            description="Alertas, insignias, notificaciones y estados de carga."
        >
            <div className="grid gap-6 lg:grid-cols-2">
                <AperturePanel title="Alertas">
                    <Alert>
                        <InfoIcon />
                        <AlertTitle>Modo degradado</AlertTitle>
                        <AlertDescription>
                            La base de datos no responde. Se muestra el último
                            estado conocido.
                        </AlertDescription>
                    </Alert>
                    <Alert variant="destructive">
                        <WarningCircleIcon />
                        <AlertTitle>MediaMTX no disponible</AlertTitle>
                        <AlertDescription>
                            No se puede reproducir video hasta que vuelva a
                            responder.
                        </AlertDescription>
                    </Alert>
                </AperturePanel>
                <AperturePanel title="Notificaciones">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            onClick={() => toast('Cámara agregada')}
                        >
                            Normal
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => toast.success('TARS reconectada')}
                        >
                            Éxito
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => toast.info('Cambiando a substream')}
                        >
                            Info
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => toast.warning('CASE con dato viejo')}
                        >
                            Advertencia
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() =>
                                toast.error('No se pudo conectar con CASE')
                            }
                        >
                            Error
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() =>
                                toast.promise(
                                    new Promise((resolve) =>
                                        setTimeout(resolve, 1500),
                                    ),
                                    {
                                        loading: 'Reconectando TARS…',
                                        success: 'TARS en vivo',
                                        error: 'Falló la reconexión',
                                    },
                                )
                            }
                        >
                            Carga
                        </Button>
                    </div>
                </AperturePanel>
                <AperturePanel title="Insignias">
                    <div className="flex flex-wrap items-center gap-3">
                        {badgeVariants.map((variant) => (
                            <Badge key={variant} variant={variant}>
                                {variant}
                            </Badge>
                        ))}
                    </div>
                </AperturePanel>
                <AperturePanel title="Carga">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Spinner />
                        Conectando…
                    </div>
                    <div className="grid w-full gap-2">
                        <Skeleton className="aspect-video w-full" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                </AperturePanel>
            </div>
        </ApertureSection>
    );
}
