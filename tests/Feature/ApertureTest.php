<?php

declare(strict_types=1);

use Inertia\Testing\AssertableInertia as Assert;

it('renders the aperture lab for guests with the configured cameras', function (): void {
    config([
        'services.mediamtx.webrtc_url' => 'http://media.test:8889',
        'services.mediamtx.cameras' => [
            ['slug' => 'tars', 'name' => 'TARS', 'main_path' => 'tars', 'sub_path' => 'tars-sub'],
        ],
    ]);

    $this->get(route('aperture'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('aperture')
            ->where('auth.user', null)
            ->where('mediaUrl', 'http://media.test:8889')
            ->where('cameras', [
                ['slug' => 'tars', 'name' => 'TARS', 'mainPath' => 'tars', 'subPath' => 'tars-sub'],
            ]));
});
