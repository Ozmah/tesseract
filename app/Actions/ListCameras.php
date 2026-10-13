<?php

declare(strict_types=1);

namespace App\Actions;

final readonly class ListCameras
{
    /**
     * @return list<array{slug: string, name: string, mainPath: string, subPath: string}>
     */
    public function handle(): array
    {
        /** @var list<array{slug: string, name: string, main_path: string, sub_path: string}> $cameras */
        $cameras = config('services.mediamtx.cameras', []);

        return array_map(fn (array $camera): array => [
            'slug' => $camera['slug'],
            'name' => $camera['name'],
            'mainPath' => $camera['main_path'],
            'subPath' => $camera['sub_path'],
        ], $cameras);
    }
}
