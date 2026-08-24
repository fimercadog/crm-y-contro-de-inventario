<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCompanyRequest;
use App\Http\Resources\CompanyResource;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    /**
     * Show the authenticated user's own company. There is no route
     * parameter by design: a company can only ever be resolved from the
     * authenticated user, which rules out cross-tenant IDOR by construction.
     */
    public function show(Request $request)
    {
        $this->authorize('view', $request->user()->company);

        return new CompanyResource($request->user()->company);
    }

    public function update(UpdateCompanyRequest $request)
    {
        $company = $request->user()->company;
        $company->update($request->validated());

        return new CompanyResource($company);
    }
}
