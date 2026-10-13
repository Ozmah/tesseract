import { CheckIcon, XIcon } from '@phosphor-icons/react';
import { AperturePanel } from '@/components/aperture/aperture-panel';
import { ApertureSection } from '@/components/aperture/aperture-section';
import {
    contrastRatio,
    useTokenValues,
} from '@/components/aperture/token-contrast';

type ContrastPair = {
    foreground: string;
    background: string;
    minimum: number;
};

const textPairs: ContrastPair[] = [
    { foreground: 'foreground', background: 'background', minimum: 4.5 },
    { foreground: 'card-foreground', background: 'card', minimum: 4.5 },
    { foreground: 'popover-foreground', background: 'popover', minimum: 4.5 },
    { foreground: 'muted-foreground', background: 'card', minimum: 4.5 },
    { foreground: 'muted-foreground', background: 'muted', minimum: 4.5 },
    { foreground: 'primary-foreground', background: 'primary', minimum: 4.5 },
    {
        foreground: 'secondary-foreground',
        background: 'secondary',
        minimum: 4.5,
    },
    { foreground: 'sidebar-foreground', background: 'sidebar', minimum: 4.5 },
    { foreground: 'highlight', background: 'background', minimum: 4.5 },
    { foreground: 'highlight', background: 'card', minimum: 4.5 },
    { foreground: 'destructive', background: 'card', minimum: 4.5 },
];

const boundaryPairs: ContrastPair[] = [
    { foreground: 'input', background: 'card', minimum: 3 },
    { foreground: 'input', background: 'background', minimum: 3 },
    { foreground: 'ring', background: 'background', minimum: 3 },
    { foreground: 'ring', background: 'card', minimum: 3 },
];

const statuses = ['ok', 'live', 'warn', 'error', 'info', 'muted'] as const;

const statusPairs: ContrastPair[] = statuses.map((status) => ({
    foreground: `status-${status}`,
    background: 'card',
    minimum: 4.5,
}));

const allTokens = [
    ...new Set(
        [...textPairs, ...boundaryPairs, ...statusPairs].flatMap(
            ({ foreground, background }) => [foreground, background],
        ),
    ),
];

function ContrastRow({
    pair,
    values,
}: {
    pair: ContrastPair;
    values: Record<string, string>;
}) {
    const ratio = contrastRatio(
        values[pair.foreground] ?? '',
        values[pair.background] ?? '',
    );
    const passes = ratio !== null && ratio >= pair.minimum;
    const result = ratio === null ? 'pending' : passes ? 'pass' : 'fail';

    return (
        <li
            data-contrast={result}
            className="flex w-full items-center gap-3 border-b border-border py-2 last:border-b-0"
        >
            <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center border border-border text-sm font-semibold"
                style={{
                    color: `var(--${pair.foreground})`,
                    backgroundColor: `var(--${pair.background})`,
                }}
            >
                Aa
            </span>
            <span className="min-w-0 flex-1 truncate font-mono text-xs">
                {pair.foreground} / {pair.background}
            </span>
            <span className="font-mono text-xs tabular-nums">
                {ratio === null ? '—' : `${ratio.toFixed(2)}:1`}
            </span>
            <span className={passes ? 'text-status-ok' : 'text-status-error'}>
                {passes ? (
                    <CheckIcon aria-label={`Cumple ${pair.minimum}:1`} />
                ) : (
                    <XIcon aria-label={`No cumple ${pair.minimum}:1`} />
                )}
            </span>
        </li>
    );
}

export function TokensSection() {
    const values = useTokenValues(allTokens);

    return (
        <ApertureSection
            id="tokens"
            title="Roles y contraste"
            description="Contraste WCAG calculado en vivo con los valores reales de la apariencia activa. Texto requiere 4.5:1; bordes de controles y foco, 3:1."
        >
            <div className="grid gap-6 lg:grid-cols-3">
                <AperturePanel title="Texto · 4.5:1">
                    <ul className="w-full">
                        {textPairs.map((pair) => (
                            <ContrastRow
                                key={`${pair.foreground}-${pair.background}`}
                                pair={pair}
                                values={values}
                            />
                        ))}
                    </ul>
                </AperturePanel>
                <AperturePanel title="Bordes y foco · 3:1">
                    <ul className="w-full">
                        {boundaryPairs.map((pair) => (
                            <ContrastRow
                                key={`${pair.foreground}-${pair.background}`}
                                pair={pair}
                                values={values}
                            />
                        ))}
                    </ul>
                </AperturePanel>
                <AperturePanel title="Estados sobre tarjeta · 4.5:1">
                    <ul className="w-full">
                        {statusPairs.map((pair) => (
                            <ContrastRow
                                key={pair.foreground}
                                pair={pair}
                                values={values}
                            />
                        ))}
                    </ul>
                </AperturePanel>
            </div>
        </ApertureSection>
    );
}
