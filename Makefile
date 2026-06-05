.PHONY: help install dev stop fresh seed

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	cd frontend && npm install
	cd backend && composer install

dev: ## Start all services (Docker + Backend + Frontend)
	docker-compose up -d
	cd backend && php artisan serve &
	cd frontend && npm run dev

stop: ## Stop all services
	docker-compose stop

fresh: ## Reset database with fresh migrations and seed
	cd backend && php artisan migrate:fresh --seed

seed: ## Run database seeders
	cd backend && php artisan db:seed
