import { AperturePanel } from '@/components/aperture/aperture-panel';
import { ApertureSection } from '@/components/aperture/aperture-section';

export function TypographySection() {
    return (
        <ApertureSection
            id="typography"
            title="Tipografía"
            description="Tres familias con trabajos distintos: headings, texto y mono. Las fuentes definitivas se eligen en el paso de tipografía; hoy son Inter y la mono del sistema."
        >
            <div className="grid gap-6 lg:grid-cols-3">
                <AperturePanel title="Heading · font-heading">
                    <p className="font-heading text-3xl font-semibold tracking-tight">
                        Visor de cámaras
                    </p>
                    <p className="font-heading text-sm font-semibold tracking-widest uppercase">
                        Recursos del hub
                    </p>
                    <p className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        Etiqueta de sección
                    </p>
                </AperturePanel>
                <AperturePanel title="Texto · font-sans">
                    <p className="text-base">
                        El hub muestra el último estado observado de cada
                        recurso, con su antigüedad, cuando la base de datos no
                        está disponible.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Texto secundario para descripciones y ayuda contextual.
                    </p>
                </AperturePanel>
                <AperturePanel title="Mono · font-mono">
                    <dl className="grid w-full grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-sm tabular-nums">
                        <dt className="text-muted-foreground">host</dt>
                        <dd>100.64.0.12:8889</dd>
                        <dt className="text-muted-foreground">path</dt>
                        <dd>tars-sub</dd>
                        <dt className="text-muted-foreground">uptime</dt>
                        <dd>14d 03:22:51</dd>
                        <dt className="text-muted-foreground">seen</dt>
                        <dd>2026-10-12 18:04:09</dd>
                    </dl>
                </AperturePanel>
            </div>
        </ApertureSection>
    );
}
