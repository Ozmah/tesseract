<?php

declare(strict_types=1);

use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    config([
        'services.mediamtx.webrtc_url' => 'http://media.test:8889',
        'services.mediamtx.cameras' => [
            ['slug' => 'tars', 'name' => 'TARS', 'main_path' => 'tars', 'sub_path' => 'tars-sub'],
            ['slug' => 'case', 'name' => 'CASE', 'main_path' => 'case', 'sub_path' => 'case-sub'],
        ],
    ]);
});

it('renders the public camera grid for guests', function (): void {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('viewer')
            ->where('mediaUrl', 'http://media.test:8889')
            ->where('selectedSlug', null)
            ->has('cameras', 2)
            ->where('cameras.0', ['slug' => 'tars', 'name' => 'TARS', 'mainPath' => 'tars', 'subPath' => 'tars-sub'])
            ->where('auth.user', null));
});

it('renders a single camera from its url', function (): void {
    $this->get(route('cameras.show', 'case'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('viewer')
            ->where('selectedSlug', 'case')
            ->has('cameras', 2));
});

it('returns not found for an unknown camera', function (): void {
    $this->get(route('cameras.show', 'unknown'))->assertNotFound();
});
