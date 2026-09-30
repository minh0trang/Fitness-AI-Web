# Code Standards

## General

- Keep modules and classes small, focused, and single-purpose.

- Follow the Single Responsibility Principle. A class, component, service, or function should have one clear responsibility.

- Prefer simple and readable solutions over unnecessary abstractions.

- Fix root causes instead of adding workarounds that hide the underlying problem.

- Do not mix unrelated concerns in the same component, controller, service, or module.

- Keep business logic out of controllers and frontend UI components whenever possible.

- Do not duplicate business logic across multiple services.

- Reuse existing utilities, components, and services before creating new ones.

- Do not introduce a new library, framework, database, service, or architectural pattern unless there is a clear requirement for it.

- Do not modify unrelated files when implementing a feature or fixing a bug.

- Before changing existing behavior, understand the current implementation and its dependencies.

- Prefer incremental changes that keep the application working after each step.

---

# Frontend Code Standards

## React & Component Architecture

- **Component Modularization & Reusability (BẮT BUỘC CHIA NHỎ VÀ TÁI SỬ DỤNG)**:
  - Tuyệt đối không viết component "khổng lồ" dồn toàn bộ UI phức tạp vào một file page duy nhất.
  - Phải tách các khối giao diện thành các reusable components độc lập (ví dụ: `MetricCard`, `WeeklyCalorieChart`, `CalendarGrid`, `DayCell`, `PlaylistSidebar`...).
  - Đặt các component dùng chung tại `src/components/common/` và các component chuyên biệt theo domain tại `src/components/{domain}/`.
  - Mỗi component chỉ đảm nhận một trách nhiệm duy nhất (Single Responsibility Principle).

- **Phong cách thiết kế Hiện đại & Tối giản (Modern & Minimalist UI)**:
  - Tránh các tiêu đề khẩu hiệu to, văn hoa dài dòng ở đầu trang gây chiếm diện tích và mất thẩm mỹ.
  - Ưu tiên sự tinh giản, hiện đại, sang trọng theo phong cách sản phẩm công nghệ cao cấp (Clean, Flat, Subtly Elevated).
  - Bố cục (Layout) phải cân đối 100% diện tích, tận dụng CSS Grid và Flexbox khoa học, tuyệt đối không để các thành phần bị dồn lệch sang một phía gây thừa khoảng trống.
  - Đồng nhất 100% phong cách thiết kế giữa các trang: Các thẻ chỉ số (KPI cards), Card, Chart, Button phải cùng một hệ quy chuẩn bo góc, viền mỏng và đổ bóng.

- **Độ chính xác dữ liệu & Kiểm chứng tương tác**:
  - Lịch (Calendar) phải tính toán chính xác thứ trong tuần (T2 - CN), có bù ô trống ngày đầu tháng và hỗ trợ chuyển đổi linh hoạt giữa các tháng.
  - Video YouTube ID phải được kiểm chứng hoạt động, không để link chết hoặc video bị chặn nhúng.
  - Responsive: Desktop phải giữ nguyên layout song song 2 cột (ví dụ: Video bên trái 65%, Playlist bên phải 35%), không bị rớt dòng ngoài ý muốn.

- Avoid `any` unless there is a documented reason.

- Define explicit types for API responses, request payloads, component props, and important domain objects.

- Do not blindly trust data returned from APIs.

- Keep API types consistent with the backend response structure.

- Prefer descriptive variable and function names.

- Avoid deeply nested conditional logic when simpler structures are possible.

- Use `async/await` for asynchronous operations instead of deeply nested promise chains.

## API Client

- All backend HTTP communication should go through the existing Axios/API service layer.

- Do not create raw Axios requests directly inside UI components unless there is a clear reason.

- Keep API endpoint definitions organized by domain.

- Handle loading, success, and error states explicitly.

- Do not expose backend implementation details directly to UI components.

- Do not store access tokens in arbitrary component state.

## UI Components

- Reuse existing shared components before creating new ones.

- Shared components should remain generic and should not contain feature-specific business logic.

- Feature-specific components should stay inside their corresponding feature/domain folder.

- Keep forms responsible for collecting and validating user input, while business operations should be handled by services/hooks.

---

# Backend Code Standards

## Spring Boot

- Follow a layered architecture within each service.

- Controllers handle HTTP concerns only.

- Services contain business logic.

- Repositories handle database access.

- DTOs are used for API request and response models when appropriate.

- Entities should not automatically be exposed directly as API responses.

- Do not place business logic inside controllers.

- Keep controllers thin and focused on request/response handling.

Example:

    Controller
        ↓
    Service
        ↓
    Repository
        ↓
    Database

## Controllers

- Validate request input before executing business logic.

- Controllers should delegate business operations to application/service classes.

- Do not access repositories directly from controllers.

- Return predictable HTTP status codes.

- Do not expose stack traces or internal exceptions to clients.

- Use the existing global exception handling mechanism for consistent error responses.

## Services

- Services contain business rules and application logic.

- Keep each service method focused on one meaningful operation.

- Services should not depend on frontend-specific concerns.

- Do not put database-specific logic directly into service methods when it belongs in repositories.

- Do not call external APIs directly from controllers.

- External integrations should be isolated behind dedicated clients/services.

## Repositories

- Repositories are responsible for persistence operations.

- Do not put business rules inside repositories.

- Use repository methods that clearly express the required data operation.

- Avoid unnecessary database queries.

- Do not expose repository implementation details outside the service.

---

# AI Integration Standards

- All Gemini API communication must be isolated inside the AI Service.

- Do not call Gemini directly from the frontend.

- AI-generated responses must be treated as untrusted external input.

- Validate the structure and required fields of AI-generated data before using or persisting it.

- Do not assume that Gemini will always return valid JSON or complete data.

- AI failures must be handled gracefully and must not corrupt existing workout or user data.

- Keep the Gemini prompt and response parsing logic separate from business logic where practical.

- Do not allow AI output to bypass application-level validation rules.

- Do not send sensitive user information to the AI provider unless it is necessary for the requested operation.

---

# Event-Driven Code Standards

- RabbitMQ is used for asynchronous business events, not as a replacement for normal REST APIs.

- Events should represent facts that have already happened.

- Use clear event names such as:

      WorkoutCompleted
      FeedbackSubmitted
      WorkoutPlanCreated

- Event payloads should contain the information required by consumers to process the event.

- Do not put UI-specific data into business events.

- Publishing an event must not replace persistence of the source-of-truth data.

- Consumers must handle duplicate event delivery safely.

- Event consumers should be independently responsible for their own processing.

- A failure in an asynchronous consumer should not corrupt the source service's persisted data.

- Do not introduce synchronous calls when the business operation can be handled independently through an event.

- Do not use RabbitMQ for simple request/response operations where an immediate response is required.

---

# Validation and Error Handling

- Validate all external input at system boundaries.

- Validate request DTOs before executing business logic.

- Validate IDs and ownership before modifying user-owned resources.

- Use meaningful validation messages.

- Use centralized exception handling where possible.

- Do not silently catch and ignore exceptions.

- Do not use empty `catch` blocks.

- Log unexpected server-side errors with enough context for debugging.

- Never return passwords, access tokens, secrets, or sensitive internal information in API responses or logs.

---

# API Standards

- Use REST APIs for synchronous frontend/backend communication.

- Use nouns for resource-oriented endpoints where appropriate.

Example:

    GET    /api/workouts
    GET    /api/workouts/{id}
    POST   /api/workouts
    POST   /api/workouts/{id}/complete

- Validate authentication and ownership before mutations.

- Return consistent response structures.

- Use appropriate HTTP status codes.

- Do not return `200 OK` for every type of operation regardless of its result.

- API responses should contain only data required by the client.

- Do not expose database entities or internal service implementation details unnecessarily.

---

# Data and Storage

- Each microservice owns its own database.

- A service must never directly access another service's database.

- Metadata and structured business data belong in the appropriate service database.

- RabbitMQ is not a permanent data store.

- YouTube videos are referenced by video ID. Video files are not stored in the application.

- Avoid storing large unnecessary blobs directly in relational database fields.

- Database schema changes should be intentional and documented.

- Do not delete or rename existing database fields without checking their usage across the service.

---

# Authentication and Authorization

- Keycloak is the source of authentication identity.

- Backend services must validate JWT-based authentication for protected endpoints.

- Do not implement a second custom authentication system unless explicitly required.

- Authorization must be based on the authenticated user's identity and role.

- Never trust a user ID supplied by the frontend as proof of ownership.

- For user-owned resources, derive the authenticated user identity from the JWT.

- Users must not be able to access or modify another user's fitness profile, workout plan, completion records, or feedback.

---

# Naming Conventions

## Java

- Classes use `PascalCase`.

- Methods and variables use `camelCase`.

- Constants use `UPPER_SNAKE_CASE`.

- Use descriptive names rather than abbreviations.

Example:

    WorkoutPlanService
    generateWorkoutPlan()
    MAX_RETRY_COUNT

## React

- Components use `PascalCase`.

- Hooks use the `useSomething` naming convention.

- Variables and functions use `camelCase`.

Examples:

    WorkoutCard
    WorkoutDetail
    useWorkoutPlan()
    handleWorkoutComplete()

## Events

- Business events use past-tense names because they represent facts that have already happened.

Examples:

    WorkoutCompleted
    FeedbackSubmitted
    WorkoutPlanCreated

---

# File Organization

## Frontend

- `src/components/` — Shared reusable UI components.

- `src/features/` — Feature-specific modules and components.

- `src/pages/` — Application pages and route-level components.

- `src/services/` — API clients and external service communication.

- `src/store/` — Redux Toolkit store, slices, and shared application state.

- `src/hooks/` — Reusable React hooks.

- `src/utils/` — Small reusable utility functions.

- `src/types/` — Shared TypeScript types and API models.

- `src/routes/` — React Router configuration and route definitions.

## Backend

Each microservice should follow a consistent structure:

    src/main/java/.../
    ├── controller/
    ├── service/
    ├── repository/
    ├── dto/
    ├── entity/
    ├── exception/
    ├── config/
    └── client/

- `controller/` — REST API endpoints and HTTP concerns.

- `service/` — Business logic and application operations.

- `repository/` — Database access.

- `dto/` — API request and response models.

- `entity/` — Persistence entities.

- `exception/` — Custom exceptions and error handling.

- `config/` — Spring configuration.

- `client/` — External service/API clients.

- RabbitMQ event publishers and consumers should have their own clearly named package when event logic becomes substantial.

---

# Testing Standards

- New business logic should have tests when practical.

- Test business rules rather than implementation details.

- Test important success and failure cases.

- API endpoints should test validation, authentication, authorization, and expected responses where appropriate.

- Event consumers should have tests for successful processing and duplicate/failure scenarios.

- Do not write tests only to increase coverage numbers.

---

# AI Coding Agent Rules

- Read the relevant existing files before modifying code.

- Follow the architecture and invariants defined in `architecture-context.md`.

- Reuse existing patterns before introducing a new pattern.

- Do not rewrite large parts of the project for a small feature.

- Do not introduce new dependencies without explaining why they are necessary.

- Do not change database architecture without explicit approval.

- Do not create a new microservice unless the business responsibility clearly requires a separate service.

- Do not add Kafka, Redis, Elasticsearch, WebSocket, Kubernetes, or other infrastructure unless explicitly requested or a concrete requirement justifies it.

- When implementing a feature, first identify:
  1. Which service owns the feature.
  2. Which data is required.
  3. Whether communication should be synchronous or asynchronous.
  4. Which existing components/services can be reused.
  5. What existing behavior could be affected.

- Prefer small, reviewable changes over large rewrites.

- If requirements are ambiguous, inspect the existing code and project documentation before making architectural assumptions.

- Do not claim that a feature is complete unless the relevant code path has been implemented and verified.