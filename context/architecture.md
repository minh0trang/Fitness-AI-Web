# Architecture Context

## Stack

| Layer | Technology | Role |
| -------- | --------------------------- | ------ |
| Frontend | React + Vite | Web application and user interface |
| UI | MUI | UI components and responsive layout |
| State Management | Redux Toolkit | Manage shared frontend state |
| HTTP Client | Axios | Communicate with backend APIs |
| API Gateway | Spring Cloud Gateway | Single entry point, routing, CORS, and JWT validation |
| Backend | Java + Spring Boot | Implement business logic and REST APIs |
| Architecture | Microservices | Separate major business responsibilities into independent services |
| Service Discovery | Spring Cloud Eureka | Service registration and discovery |
| Authentication | Keycloak | Identity management, OAuth 2.0 / OpenID Connect, and JWT |
| Message Broker | RabbitMQ | Asynchronous event-driven communication |
| AI | Google Gemini API | Generate workout plans and analyze workout progress |
| User Database | PostgreSQL | Store user profiles and fitness information |
| Workout Database | PostgreSQL | Store workout plans, exercises, completion records, and feedback |
| AI Database | MongoDB | Store AI analysis results and flexible AI-generated data |
| Containerization | Docker | Run backend services and infrastructure consistently |
| API Style | REST | Synchronous communication between frontend and backend |
| Async Communication | RabbitMQ Events | Asynchronous communication between services |

## System Boundaries

### Frontend

- `frontend/` — Owns the user interface and client-side application flow.

- Responsible for:
  - Authentication flow integration
  - Fitness profile forms
  - Workout plan display
  - Workout execution UI
  - Feedback submission
  - Progress dashboard
  - Calling backend APIs

- The frontend must not contain business logic that belongs to backend services.

### API Gateway

- `gateway-service/` — Owns the external entry point to backend services.

- Responsible for:
  - Routing requests to backend services
  - JWT validation
  - CORS configuration
  - Exposing a consistent API entry point

- The gateway should not contain domain-specific business logic.

### User Service

- `user-service/` — Owns user profile and weekly physical check-in data.

- Responsible for:
  - User profile (name, gender, age, base height, base weight)
  - Weekly check-in snapshots & history (weight, chest, waist, hip measurements)
  - Fitness goals & primary objectives (e.g. fat loss, muscle gain)
  - Activity level & lifestyle preferences
  - Available training days per week & workout duration preference
  - User's free-text special preferences / weekly constraints for AI (e.g., knee joint pain, travel constraints)
  - Publishing `WeeklyCheckinSubmitted` events upon receiving new check-in data

- User Service owns user profile and check-in history data; other services should not directly modify its database.

### Workout Service

- `workout-service/` — Owns workout plans, weekly schedules, and workout execution data.

- Responsible for:
  - Weekly workout plans (structured by week version, e.g., Week 1, Week 2...)
  - Workout routines, exercise ordering, sets, repetitions, duration, and rest intervals
  - Guided exercise instructions and YouTube video references
  - Workout execution status (active, completed, skipped)
  - Workout feedback (perceived difficulty RPE, user notes)
  - Storing completion history and workout logs
  - Publishing `WorkoutCompleted` events

- Workout Service owns workout plans and execution data; other services should not directly modify its database.

### AI Service

- `ai-service/` — Owns AI-related operations and adaptive fitness intelligence.

- Responsible for:
  - Generating personalized weekly workout plans via Gemini API
  - Adaptive plan generation based on latest weekly check-in + prior week's completion rate and fatigue
  - Scientific metabolic rate calculations (BMR, TDEE, recommended daily calorie deficit)
  - Generating AI Coach insights, macronutrient targets, and customized injury-prevention recommendations
  - Storing AI analysis results and weekly roadmap snapshots in MongoDB
  - Consuming `WorkoutCompleted` and `WeeklyCheckinSubmitted` RabbitMQ events

- AI Service should not directly access the User Service or Workout Service databases.

### Infrastructure

- `infrastructure/` — Contains local infrastructure configuration.

- Responsible for:
  - RabbitMQ
  - PostgreSQL
  - MongoDB
  - Keycloak
  - Eureka
  - Docker Compose configuration

- Infrastructure configuration should not contain application business logic.

## Storage Model

- **PostgreSQL — User Database**: Stores user profiles and fitness-related profile information.

- **PostgreSQL — Workout Database**: Stores workout plans, weeks, workouts, exercises, completion records, and user feedback.

- **MongoDB — AI Database**: Stores AI-generated analysis, recommendations, and other flexible AI-related documents.

- **RabbitMQ**: Stores and delivers asynchronous messages/events between services. RabbitMQ is a message broker, not the source of truth for business data.

- **YouTube**: Exercise videos are referenced using YouTube video IDs. The application does not store video files.

## Auth and Access Model

- Every user authenticates through Keycloak.

- Keycloak issues JWT access tokens after successful authentication.

- The frontend sends the JWT access token when calling protected backend APIs.

- API Gateway validates the JWT before forwarding protected requests to backend services.

- User identity is determined from the authenticated JWT claims.

- User-owned resources must be associated with the authenticated user's ID.

- A user can only view and modify their own fitness profile.

- A user can only view and modify their own workout plans and workout history.

- Backend services must not trust a user ID supplied by the frontend when determining ownership. Ownership should be derived from the authenticated identity.

- Services should communicate through APIs or events instead of directly accessing another service's database.

## Event-Driven Communication

### Event: `WorkoutCompleted`

When a user successfully completes a workout:

1. The Workout Service validates and stores the completion record.

2. The Workout Service publishes a `WorkoutCompleted` event to RabbitMQ.

3. RabbitMQ delivers the event to subscribed consumers (e.g. AI Service updates weekly progress and fatigue trends).

4. Additional consumers can be added later without changing the Workout Service's core completion flow.

### Event: `WeeklyCheckinSubmitted`

When a user submits their weekly check-in with updated body metrics and preferences:

1. The User Service validates and persists the new check-in snapshot.

2. The User Service publishes a `WeeklyCheckinSubmitted` event to RabbitMQ.

3. The AI Service consumes the event to compute new metabolic metrics (BMR, TDEE) and generate an adaptive 7-day plan proposal for the upcoming week.

4. The Workout Service can consume the event or receive the generated plan to initialize the new week's schedule.

### Event Rules

- Events represent meaningful business facts that have already happened.

- Events should contain enough information for consumers to process the event without requiring unnecessary synchronous calls.

- Event consumers must be designed so that processing the same event more than once does not create incorrect duplicated data.

- Publishing an event must not replace the source-of-truth database operation.

## Invariants

1. Each service owns its own data and database tables/collections. A service must not directly modify another service's database.

2. Business logic must remain inside the service that owns the corresponding business domain.

3. API Gateway handles routing and authentication concerns but must not contain domain-specific business logic.

4. Frontend code must not directly access service databases or infrastructure.

5. Authentication and authorization must be handled using Keycloak and JWT rather than custom password/session logic inside individual services.

6. User-owned resources must always be checked against the authenticated user's identity.

7. Synchronous REST communication should be used when the caller needs an immediate response.

8. RabbitMQ events should be used for asynchronous business reactions that do not need to block the user's request.

9. A successful `WorkoutCompleted` operation must persist the completion record before the system treats the workout as completed.

10. RabbitMQ must not be treated as the permanent source of truth for workout or user data.

11. AI-generated data must be validated before being persisted or returned as trusted application data.

12. External AI failures must not corrupt existing user or workout data.

13. Services should remain independently deployable and should not depend on another service's internal implementation details.

14. Do not introduce new infrastructure, frameworks, databases, or architectural patterns unless they solve a clearly identified problem in the current system.

15. Prefer the simplest implementation that satisfies the current MVP requirements.