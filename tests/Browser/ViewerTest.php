<?php

declare(strict_types=1);

it('shows the public viewer without requiring login', function (): void {
    $page = visit('/');

    $page->assertSee('Visor de cámaras')
        ->assertSee('TARS')
        ->assertSee('CASE')
        ->assertSee('Sin audio ni grabación')
        ->assertNoJavascriptErrors();
});
