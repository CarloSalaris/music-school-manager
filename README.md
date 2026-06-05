# Music School Manager

Full-stack management system for a small/medium music school.
Tracks students, teachers, courses, individual & group lessons, recitals.

## Stack

- **Frontend**: Nuxt 4 (SPA mode) · Vue 3 Composition API · Pinia · PrimeVue · Tailwind CSS v4
- **Backend**: Laravel 13 · PHP 8.5 · MySQL 8 · REST API
- **Infra**: Docker Compose (MySQL + phpMyAdmin)

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/) 22+
- [PHP](https://www.php.net/) 8.5+
- [Composer](https://getcomposer.org/)
- (Optional) `make` — on Windows: `choco install make` (requires [Chocolatey](https://chocolatey.org/)) or `winget install GnuWin32.Make`

## Quick Start

### With Make

```bash
git clone https://github.com/CarloSalaris/music-school-manager
cd music-school-manager
make install
make dev
```

### Manual

```bash
# 1. Start Docker (MySQL + phpMyAdmin)
docker-compose up -d

# 2. Install dependencies
cd frontend && npm install && cd ..
cd backend && composer install && cd ..

# 3. Configure backend
cp backend/.env.example backend/.env
# Edit backend/.env with your DB credentials (see docker-compose.yml)
cd backend && php artisan migrate --seed && cd ..

# 4. Start servers
cd backend && php artisan serve &
cd frontend && npm run dev
```

### With VSCode

Open the project folder — Docker, backend, and frontend start automatically via `.vscode/tasks.json`.

## Available Commands

| Command        | Description                             |
| -------------- | --------------------------------------- |
| `make dev`     | Start Docker + backend + frontend       |
| `make stop`    | Stop all services                       |
| `make install` | Install all dependencies                |
| `make fresh`   | Reset database with migrations and seed |
| `make seed`    | Run database seeders                    |
| `make help`    | Show all commands                       |

## Services

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| phpMyAdmin  | http://localhost:8080 |

## Status

🚧 Work in progress — first end-to-end data flow is working (students list from API to browser).

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions and patterns used.
