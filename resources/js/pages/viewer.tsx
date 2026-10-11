import { Head } from '@inertiajs/react';

export default function Viewer() {
    return (
        <>
            <Head title="Visor" />
            <main className="min-h-dvh bg-background px-6 py-12 text-foreground">
                <div className="mx-auto max-w-6xl space-y-8">
                    <header className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            Tesseract
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Visor de cámaras
                        </h1>
                    </header>
                    <section
                        aria-labelledby="viewer-status"
                        className="rounded-xl border border-border p-6"
                    >
                        <h2 id="viewer-status" className="font-medium">
                            Sin cámaras conectadas
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            La integración de video se habilitará en el
                            siguiente incremento. La grabación no está
                            habilitada.
                        </p>
                    </section>
                </div>
            </main>
        </>
    );
}
