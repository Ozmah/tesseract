<?php

declare(strict_types=1);

it('shows the public camera grid without requiring login', function (): void {
    $page = visit('/');

    $page->assertSee('Visor de cámaras')
        ->assertPresent('[aria-label="Abrir TARS"]')
        ->assertPresent('[aria-label="Abrir CASE"]')
        ->assertSee('Sin audio ni grabación')
        ->assertNoJavaScriptErrors();
});

it('opens a camera in its own url and returns to the grid', function (): void {
    $page = visit('/');

    $page->click('[aria-label="Abrir CASE"]')
        ->assertPathIs('/cameras/case')
        ->assertPresent('[aria-label="Video en vivo de CASE"]')
        ->assertMissing('[aria-label="Abrir TARS"]')
        ->click('Cuadrícula')
        ->assertPathIs('/')
        ->assertPresent('[aria-label="Abrir TARS"]')
        ->assertNoJavaScriptErrors();
});

it('loads a camera directly from its url', function (): void {
    $page = visit('/cameras/tars');

    $page->assertPresent('[aria-label="Video en vivo de TARS"]')
        ->click('Cuadrícula')
        ->assertPathIs('/')
        ->assertPresent('[aria-label="Abrir CASE"]');
});

it('fits a phone screen in the grid and in a rotated single camera', function (): void {
    $page = visit('/')->on()->pixel8();

    $page->assertScript('document.documentElement.scrollWidth <= window.innerWidth')
        ->click('[aria-label="Abrir TARS"]')
        ->assertPathIs('/cameras/tars')
        ->assertScript('document.querySelector(\'[aria-label="Video en vivo de TARS"]\').closest(\'.fixed\').getBoundingClientRect().height === window.innerHeight')
        ->assertScript('[...document.querySelectorAll(\'.fixed button\')].every((button) => button.getBoundingClientRect().height >= 44)')
        ->resize(915, 412)
        ->assertPathIs('/cameras/tars')
        ->assertScript('document.querySelector(\'[aria-label="Video en vivo de TARS"]\').closest(\'.fixed\').getBoundingClientRect().width === window.innerWidth')
        ->assertNoJavaScriptErrors();
});
