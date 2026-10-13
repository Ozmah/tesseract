const columns = Array.from({ length: 17 }, (_, index) => index * 100);
const rows = Array.from({ length: 10 }, (_, index) => index * 100);
const bars = [
    'var(--palette-white)',
    'var(--palette-mango)',
    'var(--palette-cheddar)',
    'var(--status-ok)',
    'var(--status-info)',
    'var(--status-live)',
    'var(--status-warn)',
    'var(--palette-slate-500)',
];
const fineSizes = [24, 16, 10, 6, 3];

/**
 * 16:9 test card standing in for video, with detail that only becomes
 * legible when zoomed in.
 */
export function TestPattern({ label }: { label: string }) {
    return (
        <svg
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`Carta de ajuste ${label}`}
            className="size-full"
        >
            <rect width="1600" height="900" fill="var(--palette-slate-950)" />
            {columns.map((x) => (
                <line
                    key={`x${x}`}
                    x1={x}
                    x2={x}
                    y1="0"
                    y2="900"
                    stroke="var(--palette-slate-800)"
                />
            ))}
            {rows.map((y) => (
                <line
                    key={`y${y}`}
                    x1="0"
                    x2="1600"
                    y1={y}
                    y2={y}
                    stroke="var(--palette-slate-800)"
                />
            ))}
            {bars.map((color, index) => (
                <rect
                    key={color}
                    x={200 + index * 150}
                    y="120"
                    width="150"
                    height="160"
                    fill={color}
                />
            ))}
            <circle
                cx="800"
                cy="520"
                r="230"
                fill="none"
                stroke="var(--palette-slate-400)"
                strokeWidth="2"
            />
            <circle
                cx="800"
                cy="520"
                r="120"
                fill="none"
                stroke="var(--palette-cheddar)"
                strokeWidth="2"
            />
            <line
                x1="560"
                x2="1040"
                y1="520"
                y2="520"
                stroke="var(--palette-white)"
            />
            <line
                x1="800"
                x2="800"
                y1="280"
                y2="760"
                stroke="var(--palette-white)"
            />
            <text
                x="800"
                y="70"
                textAnchor="middle"
                fill="var(--palette-white)"
                fontSize="40"
                fontFamily="var(--typeface-mono)"
            >
                {label}
            </text>
            {fineSizes.map((size, index) => (
                <text
                    key={size}
                    x="1210"
                    y={400 + index * 70}
                    fill="var(--palette-slate-300)"
                    fontSize={size}
                    fontFamily="var(--typeface-mono)"
                >
                    {size}px · zoom
                </text>
            ))}
        </svg>
    );
}
