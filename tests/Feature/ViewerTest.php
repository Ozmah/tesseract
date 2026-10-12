<?php

declare(strict_types=1);

use Inertia\Testing\AssertableInertia as Assert;

it('renders the public viewer for guests', function (): void {
    config([
        'services.mediamtx.webrtc_url' => 'http://media.test:8889',
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('viewer')
            ->where('mediaUrl', 'http://media.test:8889')
            ->where('auth.user', null));
});
