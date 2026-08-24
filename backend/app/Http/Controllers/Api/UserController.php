<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Minimal company-scoped listing used to populate "assign to" pickers
     * (e.g. customer.assigned_user_id). Full user management (create,
     * edit, deactivate) belongs to the Administración > Usuarios module.
     */
    public function index(Request $request)
    {
        $users = User::where('company_id', $request->user()->company_id)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return response()->json(['data' => $users]);
    }
}
