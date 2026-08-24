# CRM + Inventario

One platform. Customers, sales and inventory under control.

Plataforma SaaS que combina CRM y Control de Inventario en un solo sistema.

## Stack

- **Backend:** Laravel 12 (PHP 8.2+), API REST, SQLite (migrable a MySQL), Sanctum, Spatie Permission.
- **Frontend:** Next.js 16 (App Router), TypeScript, TailwindCSS, shadcn/ui, TanStack Table v9.

## Estructura

```text
backend/    API Laravel
frontend/   Next.js (App Router)
docs/       Documentación del proyecto
```

## Desarrollo local

### Backend

```bash
cd backend
composer install
php artisan migrate
php artisan serve
```

API disponible en `http://localhost:8000/api` (`/api/health` para verificar).

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

App disponible en `http://localhost:3000`.

## Estado del proyecto

Ver [docs/development-status.md](docs/development-status.md).
