import { Head, router } from '@inertiajs/react';
import { VideoCameraSlashIcon } from '@phosphor-icons/react';
import { useRef } from 'react';
import { CameraViewer } from '@/components/cameras/camera-viewer';
import { home } from '@/routes';
import { show } from '@/routes/cameras';
import type { Camera } from '@/types';

type ViewerProps = {
    cameras: Camera[];
    mediaUrl: string;
    selectedSlug: string | null;
};

export default function Viewer({
    cameras,
    mediaUrl,
    selectedSlug,
}: ViewerProps) {
    const openedFromGrid = useRef(false);
    const selected = cameras.find(({ slug }) => slug === selectedSlug);

    const select = (slug: string | null) => {
        if (slug) {
            openedFromGrid.current = true;
            router.visit(show(slug), {
                preserveState: true,
                preserveScroll: true,
            });

            return;
        }

        if (openedFromGrid.current) {
            openedFromGrid.current = false;
            window.history.back();

            return;
        }

        router.visit(home(), {
            replace: true,
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={selected ? selected.name : 'Cámaras'} />
            <main className="flex min-h-dvh flex-col bg-background text-foreground">
                <header className="flex items-end justify-between gap-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4 sm:px-6">
                    <div>
                        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                            Tesseract
                        </p>
                        <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
                            Visor de cámaras
                        </h1>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground tabular-nums">
                        {cameras.length}{' '}
                        {cameras.length === 1 ? 'cámara' : 'cámaras'}
                    </p>
                </header>

                <div className="mx-auto w-full max-w-7xl sm:px-6">
                    {cameras.length > 0 ? (
                        <CameraViewer
                            layout="page"
                            cameras={cameras}
                            mediaUrl={mediaUrl}
                            selectedSlug={selectedSlug}
                            onSelect={select}
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3 border-y border-border px-4 py-16 text-center sm:border">
                            <VideoCameraSlashIcon
                                aria-hidden="true"
                                className="size-8 text-muted-foreground"
                            />
                            <p className="text-sm text-muted-foreground">
                                No hay cámaras configuradas.
                            </p>
                        </div>
                    )}
                </div>

                <footer className="mt-auto px-4 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))] text-xs text-muted-foreground sm:px-6">
                    Video en vivo por WebRTC · Sin audio ni grabación
                </footer>
            </main>
        </>
    );
}
