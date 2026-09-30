## 1. Project Overview
Project Name: Zero Fitness (Microservices Architecture)
Architecture Pattern: Distributed Microservices, Event-Driven Architecture, Polyglot Persistence, OAuth2 Auth.

## 2. Existing Infrastructure & Services Baseline
The project is built and fully functional. Do NOT rewrite or modify core infrastructure unless explicitly specified.

| Service Name | Technology Stack | Port | Primary Responsibility & Database |
| :--- | :--- | :--- | :--- |
| `config-server` | Spring Cloud Config | 8888 | Manages centralized YAML configuration for all services. |
| `eureka-server` | Spring Cloud Eureka | 8761 | Service Discovery & Registration registry. |
| `gateway-service` | Spring Cloud Gateway | 8080 | Single entry point, CORS, JWT validation, routes requests. |
| `user-service` | Spring Boot + JPA | 8081 | Stores user profiles. **Database: PostgreSQL (`fitness_user_db`)**. |
| `activity-service` | Spring Boot + Mongo | 8082 | Manages activity tracking. **Database: MongoDB (`fitness_activity`)**. |
| `ai-service` | Spring Boot + Mongo | 8083 | Integrates Google Gemini API, consumes RabbitMQ events. **Database: MongoDB (`fitness_recommendations`)**. |
| `Keycloak IAM` | OAuth2 / OIDC | 8181 | Identity provider (Realm: `zero-fitness`, Client: `oauth2-pkce-client`). |
| `RabbitMQ` | AMQP Broker | 5672 / 15672 | Asynchronous messaging (`fitness.exchange`, `activity.queue`). |
| `frontend` | React + Vite + MUI | 5173 | Single Page Application utilizing MUI, Redux Toolkit, and Axios. |

---

## 3. Core Architectural Rules & Invariants (STRICT GUARDRAILS)
1. **Database Isolation**: Each service strictly owns its database. NEVER execute cross-database queries or directly access another service's database.
2. **Authentication & Identity**:
   - Authentication is handled exclusively via Keycloak issuing JWT Access Tokens.
   - Gateway validates JWTs using Keycloak JWKS URI.
   - Frontend extracts `sub` claim from JWT as `keycloakId`.
   - `KeycloakUserSyncFilter` in Gateway automatically intercepts requests on first login to create an extended user profile record in `user-service` (PostgreSQL).
   - NEVER create custom password hashing or custom session login logic inside Spring Boot services.
3. **Inter-Service Communication**:
   - **Synchronous (REST)**: Use `WebClient` with `@LoadBalanced` over Eureka service names (e.g., `http://user-service/api/users/...`) for immediate validations.
   - **Asynchronous (Events)**: Use RabbitMQ for non-blocking background business reactions. Event names MUST be past-tense business facts (e.g., `WorkoutCompleted`).
4. **AI Integration Integrity**:
   - All Gemini API calls MUST remain isolated inside `ai-service`.
   - ALWAYS treat Gemini API responses as untrusted input: enforce strict JSON parsing, fallback defaults, and structural validation before persisting.
   - External AI failures MUST NOT break primary user transactions or corrupt existing databases.
5. **Forbidden Tech Additions**:
   - DO NOT introduce Kafka, Redis, Elasticsearch, WebSockets, or new databases unless explicitly requested in a feature spec.

---

## 4. Coding Standards & File Conventions

### Backend (Spring Boot)
- **Layered Architecture**: Controller (HTTP ONLY) ➔ Service (Business Logic) ➔ Repository (Data Access) ➔ DTOs (API Contract).
- **Controller Rule**: Validate DTO inputs (`@Valid`). Do NOT inject Repositories directly into Controllers.
- **REST Endpoints**: Use plural nouns (`/api/workouts`, `/api/users/profile`). Derive resource ownership from authenticated JWT identity, never trust client-supplied user IDs blindly.

### Frontend (React + MUI)
- **Component Library**: Use Material UI (MUI) components (`Box`, `Card`, `Typography`, `Button`, `TextField`, `Chip`).
- **Forbidden UI Frameworks**: DO NOT add Tailwind CSS, shadcn/ui, or Bootstrap.
- **API Client**: ALL backend HTTP calls MUST go through the existing Axios client in `src/services/api.js` which automatically attaches JWT Bearer tokens and headers.

---

## 5. Development Workflow for AI Agents
When assigned a new feature specification (`spec_feature`):
1. **Inspect**: Read existing files, DTOs, and schemas first. Check for reusable code before writing new lines.
2. **Plan**: State concisely which files will be modified or created.
3. **Smallest Increment (Vertical Slice)**: Implement the minimal end-to-end slice (Entity ➔ Repo ➔ Service ➔ Controller ➔ UI Component).
4. **Verify**: Test backend compilation, compilation errors, and API request handling.
5. **Update Tracker**: Log completed changes in `progress-tracker.md`.