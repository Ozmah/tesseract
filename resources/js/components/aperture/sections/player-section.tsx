import { useState } from 'react';
import { AperturePanel } from '@/components/aperture/aperture-panel';
import { ApertureSection } from '@/components/aperture/aperture-section';
import { TestPattern } from '@/components/aperture/test-pattern';
import { CameraStageView } from '@/components/cameras/camera-stage';
import { CameraTileView } from '@/components/cameras/camera-tile';
import { CameraViewer } from '@/components/cameras/camera-viewer';
import type { Camera, StreamStatus } from '@/types';

const statuses: StreamStatus[] = [
    'playing',
    'connecting',
    'retrying',
    'paused',
    'unsupported',
];

type PlayerSectionProps = {
    cameras: Camera[];
    mediaUrl: string;
};

export function PlayerSection({ cameras, mediaUrl }: PlayerSectionProps) {
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
    const [demoStatus, setDemoStatus] = useState<string>('');

    return (
        <ApertureSection
            id="player"
            title="Reproductor"
            description="El visor real con las cámaras configuradas: cuadrícula en substream y vista individual en calidad principal con zoom digital. Atajos: 1–9 abre una cámara; en la vista individual, Esc regresa, + y − hacen zoom, 0 restablece y F activa pantalla completa."
        >
            <div className="grid gap-6">
                <AperturePanel title="En vivo">
                    <CameraViewer
                        cameras={cameras}
                        mediaUrl={mediaUrl}
                        selectedSlug={selectedSlug}
                        onSelect={setSelectedSlug}
                        className="w-full"
                    />
                </AperturePanel>

                <AperturePanel title="Zoom · carta de ajuste">
                    <CameraStageView
                        name="Carta de ajuste"
                        status="playing"
                        keyboardShortcuts={false}
                        onClose={() =>
                            setDemoStatus('Regresar a la cuadrícula')
                        }
                        className="w-full max-w-4xl"
                    >
                        <TestPattern label="APERTURE" />
                    </CameraStageView>
                    <p className="text-sm text-muted-foreground">
                        Rueda o pellizco para acercar, arrastrar para mover,
                        doble clic para alternar.
                        {demoStatus && (
                            <span
                                role="status"
                                className="ml-2 font-mono text-xs"
                            >
                                Acción: {demoStatus}
                            </span>
                        )}
                    </p>
                </AperturePanel>

                <AperturePanel title="Estados del tile">
                    <div className="grid w-full gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
                        {statuses.map((status) => (
                            <CameraTileView
                                key={status}
                                name={status}
                                status={status}
                                shortcut="1"
                                onOpen={() => setDemoStatus(`Abrir ${status}`)}
                                onReconnect={() => setDemoStatus('Reintentar')}
                                onResume={() => setDemoStatus('Reproducir')}
                            >
                                <TestPattern label={status.toUpperCase()} />
                            </CameraTileView>
                        ))}
                    </div>
                </AperturePanel>
            </div>
        </ApertureSection>
    );
}
