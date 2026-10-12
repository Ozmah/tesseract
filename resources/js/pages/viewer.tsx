import { Head } from '@inertiajs/react';
import CameraPlayer from '@/components/camera-player';

export default function Viewer({ mediaUrl }: { mediaUrl: string }) {
    return (
        <>
            <Head title="Visor" />
            <main className="min-h-dvh bg-background px-4 py-8 text-foreground sm:px-6">
                <div className="mx-auto max-w-7xl space-y-8">
                    <header className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            Tesseract
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Visor de cámaras
                        </h1>
                    </header>
                    <div className="grid gap-6 lg:grid-cols-2">
                        <CameraPlayer
                            name="TARS"
                            path="tars"
                            mediaUrl={mediaUrl}
                        />
                        <CameraPlayer
                            name="CASE"
                            path="case"
                            mediaUrl={mediaUrl}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Video en vivo por WebRTC · Sin audio ni grabación
                    </p>
                </div>
            </main>
        </>
    );
}
