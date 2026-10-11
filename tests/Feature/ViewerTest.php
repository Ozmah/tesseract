<?php

declare(strict_types=1);

use Inertia\Testing\AssertableInertia as Assert;

it('renders the public viewer for guests', function (): void {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('viewer')
            ->where('auth.user', null));
});
