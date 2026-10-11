<?php

declare(strict_types=1);

it('shows the public viewer without requiring login', function (): void {
    $page = visit('/');

    $page->assertSee('Visor de cámaras')
        ->assertSee('Sin cámaras conectadas')
        ->assertNoJavascriptErrors();
});
