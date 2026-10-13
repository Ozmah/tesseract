import type { Icon } from '@phosphor-icons/react';
import {
    BroadcastIcon,
    CheckCircleIcon,
    InfoIcon,
    QuestionIcon,
    WarningIcon,
    XCircleIcon,
} from '@phosphor-icons/react';
import { AperturePanel } from '@/components/aperture/aperture-panel';
import { ApertureSection } from '@/components/aperture/aperture-section';

type Status = {
    key: string;
    label: string;
    meaning: string;
    icon: Icon;
    surfaceClassName: string;
    textClassName: string;
};

const statuses: Status[] = [
    {
        key: 'ok',
        label: 'Disponible',
        meaning: 'Recurso autorizado y respondiendo.',
        icon: CheckCircleIcon,
        surfaceClassName: 'border-status-ok-border bg-status-ok-bg',
        textClassName: 'text-status-ok',
    },
    {
        key: 'live',
        label: 'En vivo',
        meaning: 'Transmisión activa en este momento.',
        icon: BroadcastIcon,
        surfaceClassName: 'border-status-live-border bg-status-live-bg',
        textClassName: 'text-status-live',
    },
    {
        key: 'warn',
        label: 'Dato viejo',
        meaning: 'Último estado conocido; indica su antigüedad.',
        icon: WarningIcon,
        surfaceClassName: 'border-status-warn-border bg-status-warn-bg',
        textClassName: 'text-status-warn',
    },
    {
        key: 'error',
        label: 'No disponible',
        meaning: 'Caído o sin conexión.',
        icon: XCircleIcon,
        surfaceClassName: 'border-status-error-border bg-status-error-bg',
        textClassName: 'text-status-error',
    },
    {
        key: 'info',
        label: 'Conectando',
        meaning: 'Información o transición en curso.',
        icon: InfoIcon,
        surfaceClassName: 'border-status-info-border bg-status-info-bg',
        textClassName: 'text-status-info',
    },
    {
        key: 'muted',
        label: 'Detectado',
        meaning: 'Encontrado pero sin autorizar, o desconocido.',
        icon: QuestionIcon,
        surfaceClassName: 'border-status-muted-border bg-status-muted-bg',
        textClassName: 'text-status-muted',
    },
];

export function StatusSection() {
    return (
        <ApertureSection
            id="status"
            title="Estados"
            description="Tokens de estado con superficie (16%) y borde (42%) derivados. Siempre acompañados de ícono o texto, nunca solo color."
        >
            <div className="grid gap-6 lg:grid-cols-2">
                <AperturePanel title="Insignias">
                    <div className="flex flex-wrap gap-2">
                        {statuses.map(
                            ({
                                key,
                                label,
                                icon: StatusIcon,
                                surfaceClassName,
                                textClassName,
                            }) => (
                                <span
                                    key={key}
                                    className={`inline-flex items-center gap-1.5 border px-2 py-1 text-xs font-semibold tracking-widest uppercase ${surfaceClassName} ${textClassName}`}
                                >
                                    <StatusIcon
                                        aria-hidden="true"
                                        weight="bold"
                                        className="size-3.5"
                                    />
                                    {label}
                                </span>
                            ),
                        )}
                    </div>
                </AperturePanel>
                <AperturePanel title="Significado">
                    <dl className="grid w-full gap-2 text-sm">
                        {statuses.map(
                            ({
                                key,
                                label,
                                meaning,
                                icon: StatusIcon,
                                textClassName,
                            }) => (
                                <div
                                    key={key}
                                    className="flex items-center gap-3"
                                >
                                    <dt
                                        className={`inline-flex w-36 shrink-0 items-center gap-1.5 font-semibold ${textClassName}`}
                                    >
                                        <StatusIcon
                                            aria-hidden="true"
                                            weight="fill"
                                        />
                                        {label}
                                    </dt>
                                    <dd className="text-muted-foreground">
                                        {meaning}
                                    </dd>
                                </div>
                            ),
                        )}
                    </dl>
                </AperturePanel>
                <AperturePanel title="Sobre video" className="lg:col-span-2">
                    <div className="relative aspect-video w-full max-w-xl overflow-hidden bg-video-surface">
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0_12px,color-mix(in_oklab,var(--palette-slate-700)_35%,transparent)_12px_13px)]" />
                        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-video-overlay px-3 py-2 text-video-overlay-foreground">
                            <span className="font-heading text-sm font-semibold tracking-widest uppercase">
                                TARS
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-status-live uppercase">
                                <span className="size-2 animate-pulse rounded-full bg-status-live" />
                                En vivo
                            </span>
                        </div>
                        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 border border-status-warn-border bg-video-overlay px-2 py-1 text-xs font-semibold tracking-widest text-status-warn uppercase">
                            <WarningIcon
                                aria-hidden="true"
                                weight="bold"
                                className="size-3.5"
                            />
                            Último cuadro hace 3 min
                        </div>
                    </div>
                </AperturePanel>
            </div>
        </ApertureSection>
    );
}
