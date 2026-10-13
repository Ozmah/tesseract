import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    DesktopIcon,
    MoonIcon,
    SunIcon,
} from '@phosphor-icons/react';
import { ActionsSection } from '@/components/aperture/sections/actions-section';
import { ContentSection } from '@/components/aperture/sections/content-section';
import { FeedbackSection } from '@/components/aperture/sections/feedback-section';
import { FormsSection } from '@/components/aperture/sections/forms-section';
import { OverlaysSection } from '@/components/aperture/sections/overlays-section';
import { PaletteSection } from '@/components/aperture/sections/palette-section';
import { PlayerSection } from '@/components/aperture/sections/player-section';
import { StatusSection } from '@/components/aperture/sections/status-section';
import { TokensSection } from '@/components/aperture/sections/tokens-section';
import { TypographySection } from '@/components/aperture/sections/typography-section';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { home } from '@/routes';
import type { Camera } from '@/types';

const sections = [
    { id: 'palette', label: 'Paleta', component: PaletteSection },
    { id: 'tokens', label: 'Contraste', component: TokensSection },
    { id: 'status', label: 'Estados', component: StatusSection },
    { id: 'typography', label: 'Tipografía', component: TypographySection },
    { id: 'actions', label: 'Acciones', component: ActionsSection },
    { id: 'forms', label: 'Formularios', component: FormsSection },
    { id: 'feedback', label: 'Feedback', component: FeedbackSection },
    { id: 'overlays', label: 'Overlays', component: OverlaysSection },
    { id: 'content', label: 'Contenido', component: ContentSection },
] as const;

const navigation = [
    ...sections.map(({ id, label }) => ({ id, label })),
    { id: 'player', label: 'Reproductor' },
];

const appearances: {
    value: Appearance;
    label: string;
    icon: typeof SunIcon;
}[] = [
    { value: 'dark', label: 'Oscuro', icon: MoonIcon },
    { value: 'light', label: 'Claro', icon: SunIcon },
    { value: 'system', label: 'Sistema', icon: DesktopIcon },
];

type ApertureProps = {
    cameras: Camera[];
    mediaUrl: string;
};

export default function Aperture({ cameras, mediaUrl }: ApertureProps) {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <>
            <Head title="Aperture" />
            <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6">
                <header className="flex flex-wrap items-end justify-between gap-6 border-b border-border py-8">
                    <div className="space-y-3">
                        <Link
                            href={home()}
                            className="inline-flex min-h-11 items-center gap-2 font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:text-highlight focus-visible:text-highlight"
                        >
                            <ArrowLeftIcon aria-hidden="true" />
                            Tesseract
                        </Link>
                        <h1 className="font-heading text-4xl font-semibold tracking-tight">
                            Aperture
                        </h1>
                        <p className="max-w-2xl text-muted-foreground">
                            Laboratorio de componentes de Tesseract. Todo lo que
                            forma parte del sistema de diseño se prueba aquí, en
                            la app real.
                        </p>
                    </div>
                    <ToggleGroup
                        variant="outline"
                        spacing={0}
                        aria-label="Apariencia"
                        value={[appearance]}
                        onValueChange={(value) => {
                            const [selected] = value;

                            if (selected) {
                                updateAppearance(selected as Appearance);
                            }
                        }}
                    >
                        {appearances.map(
                            ({ value, label, icon: AppearanceIcon }) => (
                                <ToggleGroupItem key={value} value={value}>
                                    <AppearanceIcon aria-hidden="true" />
                                    <span className="max-sm:sr-only">
                                        {label}
                                    </span>
                                </ToggleGroupItem>
                            ),
                        )}
                    </ToggleGroup>
                </header>

                <nav
                    aria-label="Secciones"
                    className="sticky top-0 z-10 -mx-4 overflow-x-auto border-b border-border bg-background/95 px-4 backdrop-blur sm:-mx-6 sm:px-6"
                >
                    <ul className="flex gap-1 py-2">
                        {navigation.map(({ id, label }) => (
                            <li key={id}>
                                <a
                                    href={`#${id}`}
                                    className="inline-flex min-h-11 items-center px-3 font-mono text-xs tracking-widest whitespace-nowrap text-muted-foreground uppercase transition-colors hover:bg-interaction-hover hover:text-foreground"
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {sections.map(({ id, component: Section }) => (
                    <Section key={id} />
                ))}

                <PlayerSection cameras={cameras} mediaUrl={mediaUrl} />
            </div>
        </>
    );
}
