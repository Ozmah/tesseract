<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\ListCameras;
use Inertia\Inertia;
use Inertia\Response;

final readonly class CameraController
{
    public function __construct(private ListCameras $cameras)
    {
        //
    }

    public function index(): Response
    {
        return $this->render(null);
    }

    public function show(string $camera): Response
    {
        $exists = collect($this->cameras->handle())->contains('slug', $camera);

        abort_unless($exists, 404);

        return $this->render($camera);
    }

    private function render(?string $selectedSlug): Response
    {
        return Inertia::render('viewer', [
            'mediaUrl' => config('services.mediamtx.webrtc_url'),
            'cameras' => $this->cameras->handle(),
            'selectedSlug' => $selectedSlug,
        ]);
    }
}
