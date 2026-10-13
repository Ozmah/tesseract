<?php

declare(strict_types=1);

return [

    'mediamtx' => [
        'webrtc_url' => env('MEDIA_WEBRTC_URL', 'http://localhost:8889'),

        /*
         * Cameras published by MediaMTX. Paths must match mediamtx.yml;
         * sources are injected there through MTX_PATHS_*_SOURCE.
         */
        'cameras' => [
            ['slug' => 'tars', 'name' => 'TARS', 'main_path' => 'tars', 'sub_path' => 'tars-sub'],
            ['slug' => 'case', 'name' => 'CASE', 'main_path' => 'case', 'sub_path' => 'case-sub'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
