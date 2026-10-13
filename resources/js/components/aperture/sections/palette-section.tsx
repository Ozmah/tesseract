import { ApertureSection } from '@/components/aperture/aperture-section';

const sourceColors = [
    {
        name: 'Deep Daigi White',
        token: 'palette-white',
        hex: '#E9E7E6',
        dark: false,
    },
    {
        name: 'Sunlit Platinum',
        token: 'palette-platinum',
        hex: '#E1DFDB',
        dark: false,
    },
    {
        name: 'Mango Marmalade',
        token: 'palette-mango',
        hex: '#FFD369',
        dark: false,
    },
    {
        name: 'Cheddar Fondue',
        token: 'palette-cheddar',
        hex: '#F5BE3D',
        dark: false,
    },
    {
        name: 'Midnight Slate',
        token: 'palette-slate-800',
        hex: '#333B4C',
        dark: true,
    },
    {
        name: 'Slate Shadow',
        token: 'palette-slate-900',
        hex: '#1F2634',
        dark: true,
    },
] as const;

const slateScale = [
    '950',
    '900',
    '850',
    '800',
    '700',
    '600',
    '500',
    '400',
    '300',
    '200',
] as const;

export function PaletteSection() {
    return (
        <ApertureSection
            id="palette"
            title="Paleta 021"
            description="Colores de origen y la escala slate derivada en OKLCH (tono 264). El amarillo es solo para interacción; los estados usan tonos propios."
        >
            <div className="grid gap-px border border-border bg-border sm:grid-cols-3 xl:grid-cols-6">
                {sourceColors.map(({ name, token, hex, dark }) => (
                    <div
                        key={token}
                        className="flex min-h-36 flex-col justify-end p-4"
                        style={{
                            backgroundColor: `var(--${token})`,
                            color: dark
                                ? 'var(--palette-white)'
                                : 'var(--palette-slate-900)',
                        }}
                    >
                        <p className="font-semibold">{name}</p>
                        <p className="font-mono text-xs">{hex}</p>
                        <p className="font-mono text-xs opacity-80">
                            --{token}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-6 grid grid-cols-5 border border-border sm:grid-cols-10">
                {slateScale.map((step) => (
                    <div
                        key={step}
                        className="flex h-20 items-end p-2 font-mono text-xs"
                        style={{
                            backgroundColor: `var(--palette-slate-${step})`,
                            color:
                                Number(step) >= 600
                                    ? 'var(--palette-white)'
                                    : 'var(--palette-slate-950)',
                        }}
                    >
                        {step}
                    </div>
                ))}
            </div>
        </ApertureSection>
    );
}
