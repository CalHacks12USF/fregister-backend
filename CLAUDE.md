# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS backend application using TypeScript. The project follows NestJS's modular architecture pattern with controllers, services, and modules.

## Development Commands

### Running the Application
- `npm run start` - Start the application in standard mode
- `npm run start:dev` - Start in development mode with file watching
- `npm run start:debug` - Start with debugging enabled and file watching
- `npm run start:prod` - Run the production build (requires `npm run build` first)

### Building
- `npm run build` - Compile TypeScript to JavaScript (outputs to `dist/`)

### Testing
- `npm run test` - Run all unit tests
- `npm run test:watch` - Run tests in watch mode (useful during TDD)
- `npm run test:cov` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:debug` - Run tests with Node debugger attached

### Code Quality
- `npm run lint` - Run ESLint with auto-fix enabled
- `npm run format` - Format code using Prettier

## Architecture

### Module Structure
NestJS uses a modular architecture where each feature is organized into modules. The root module is `AppModule` (src/app.module.ts).

**Module pattern:**
- **Module** (`*.module.ts`) - Groups related controllers and services, declares dependencies
- **Controller** (`*.controller.ts`) - Handles HTTP requests and routes, uses decorators like `@Get()`, `@Post()`, etc.
- **Service** (`*.service.ts`) - Contains business logic, marked with `@Injectable()` decorator
- **Spec files** (`*.spec.ts`) - Unit tests, co-located with implementation files

### Dependency Injection
NestJS uses constructor-based dependency injection. Services are injected into controllers/other services via constructors. Mark services with `@Injectable()` and register them in module providers.

### Application Entry
- `src/main.ts` - Application bootstrap, creates NestJS application instance
- Default port: 3000 (configurable via `PORT` environment variable)

## Configuration

### TypeScript
- Target: ES2023
- Module: nodenext
- Decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`)
- Output: `dist/` directory
- Source maps enabled for debugging

### Testing
- Framework: Jest with ts-jest
- Unit test root: `src/`
- E2E test config: `test/jest-e2e.json`
- Test pattern: `*.spec.ts` files

## Creating New Resources

Use NestJS CLI to generate boilerplate:
- `nest generate module <name>` - Generate a new module
- `nest generate controller <name>` - Generate a controller
- `nest generate service <name>` - Generate a service
- `nest generate resource <name>` - Generate a complete CRUD resource (module + controller + service + DTOs)
