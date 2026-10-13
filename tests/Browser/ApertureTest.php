<?php

declare(strict_types=1);

it('renders every aperture section without javascript errors', function (): void {
    $page = visit(route('aperture'));

    $page->assertSee('Aperture')
        ->assertSee('Paleta 021')
        ->assertSee('Roles y contraste')
        ->assertSee('Estados')
        ->assertSee('Formularios')
        ->assertSee('Overlays')
        ->assertNoJavaScriptErrors();
});

it('keeps every token pair above its contrast minimum', function (string $appearance): void {
    $page = visit(route('aperture'))->click($appearance);

    $page->assertPresent('[data-contrast="pass"]')
        ->assertCount('[data-contrast="pending"]', 0)
        ->assertCount('[data-contrast="fail"]', 0);
})->with(['Oscuro', 'Claro']);

it('opens a camera from the grid and returns with escape', function (): void {
    $page = visit(route('aperture'));

    $page->click('[aria-label="Abrir TARS"]')
        ->assertSee('Cuadrícula')
        ->assertMissing('[aria-label="Abrir CASE"]')
        ->keys('#player', 'Escape')
        ->assertPresent('[aria-label="Abrir TARS"]')
        ->assertPresent('[aria-label="Abrir CASE"]')
        ->assertNoJavaScriptErrors();
});

it('opens a camera with its number key', function (): void {
    $page = visit(route('aperture'));

    $page->keys('#player', '2')
        ->assertPresent('[aria-label="Video en vivo de CASE"]')
        ->assertMissing('[aria-label="Abrir TARS"]');
});

it('zooms the stage with its controls', function (): void {
    $page = visit(route('aperture'));

    $page->click('#player [aria-label="Acercar"]')
        ->assertSee('1.5×')
        ->click('#player [aria-label="Acercar"]')
        ->assertSee('2.3×')
        ->click('#player [aria-label="Zoom 2.3×, restablecer"]')
        ->assertSee('1.0×');
});
