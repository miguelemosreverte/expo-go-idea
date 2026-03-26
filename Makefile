.PHONY: help setup dev test test-unit test-integration test-e2e \
        lint typecheck build clean \
        docker-up docker-down docker-logs docker-build docker-prod \
        build-mobile-ios build-mobile-android build-gateway demo \
        test-all ci

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-25s\033[0m %s\n", $$1, $$2}'

setup: ## Install deps + build shared
	corepack enable
	pnpm install
	pnpm turbo build --filter=@gaucho/shared
	@echo "Setup complete. Run 'make dev' to start."

dev: ## Start dev servers (gateway + mobile)
	pnpm turbo dev

test: test-unit ## Run all in-memory tests

test-unit: ## Jest (mobile) + Vitest (gateway)
	pnpm turbo test

test-integration: ## Integration tests (requires Docker)
	docker compose -f docker-compose.test.yml up -d
	@echo "Waiting for OpenCode to be healthy..."
	@sleep 15
	pnpm turbo test:integration || true
	docker compose -f docker-compose.test.yml down

test-e2e: ## Maestro E2E tests
	cd apps/mobile && maestro test e2e/

lint: ## ESLint + Prettier check
	pnpm turbo lint
	pnpm format:check

typecheck: ## tsc --noEmit across all packages
	pnpm turbo typecheck

build: ## Build all packages
	pnpm turbo build

clean: ## Remove node_modules, .turbo, dist
	pnpm turbo clean
	rm -rf node_modules apps/*/node_modules packages/*/node_modules
	rm -rf apps/*/dist packages/*/dist
	rm -rf .turbo apps/*/.turbo packages/*/.turbo

docker-up: ## Start gateway + opencode
	docker compose up -d

docker-down: ## Stop Docker services
	docker compose down

docker-logs: ## Tail Docker logs
	docker compose logs -f

build-mobile-ios: ## EAS Build iOS
	cd apps/mobile && eas build --platform ios

build-mobile-android: ## EAS Build Android
	cd apps/mobile && eas build --platform android

build-gateway: ## Docker build gateway image
	docker build -f apps/gateway/Dockerfile -t gaucho-gateway .

docker-build: ## Build Docker images
	docker compose build

docker-prod: ## Start production stack (with resource limits)
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

test-all: test-unit test-integration ## Run unit + integration tests

ci: lint typecheck test-unit ## CI pipeline: lint + typecheck + test

demo: docker-up ## Full demo: Docker + seed + open
	@./scripts/demo/seed-demo-project.sh
	@echo ""
	@echo "Gateway:  http://localhost:3000"
	@echo "OpenCode: http://localhost:4096"
	@echo ""
	@echo "Run 'make docker-logs' to see logs."
