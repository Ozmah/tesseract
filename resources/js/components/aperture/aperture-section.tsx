import type { ReactNode } from 'react';

type ApertureSectionProps = {
    id: string;
    title: string;
    description?: string;
    children: ReactNode;
};

export function ApertureSection({
    id,
    title,
    description,
    children,
}: ApertureSectionProps) {
    return (
        <section
            id={id}
            aria-labelledby={`${id}-title`}
            className="scroll-mt-24 border-b border-border py-10"
        >
            <header className="mb-6 space-y-1">
                <h2
                    id={`${id}-title`}
                    className="font-heading text-sm font-semibold tracking-widest text-highlight uppercase"
                >
                    {title}
                </h2>
                {description && (
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </header>
            {children}
        </section>
    );
}
