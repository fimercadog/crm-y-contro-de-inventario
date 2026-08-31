<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | El frontend (Next.js) vive en otro dominio, así que el navegador exige
    | headers CORS en cada respuesta de la API. Sin este archivo, el
    | middleware `HandleCors` no emite ninguno. El login usa tokens Bearer,
    | no cookies, por eso `supports_credentials` queda en false.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter([
        env('FRONTEND_URL'),
        'http://localhost:3000',
        'https://crm-inventario-demo.fidelmercadotech.com',
    ])),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
