<?php

namespace Tests;

use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Roles are reference data every test can assume exists (mirrors
     * migrations), not fixture data specific to one test.
     */
    protected $seed = true;

    protected $seeder = RoleSeeder::class;
}
