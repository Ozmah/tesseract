import { cn } from 'cn';
import type { ReactNode } from 'react';

type AperturePanelProps = {
    title: string;
    children: ReactNode;
    className?: string;
};

export function AperturePanel({
    title,
    children,
    className,
}: AperturePanelProps) {
    return (
        <div
            className={cn(
                'flex flex-col gap-5 border border-border bg-card p-5',
                className,
            )}
        >
            <h3 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                {title}
            </h3>
            <div className="flex flex-col items-start gap-4">{children}</div>
        </div>
    );
}
