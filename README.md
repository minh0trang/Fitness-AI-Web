# AI-Powered Fitness Tracker - Microservices Application

##  Project Overview
This is a full-stack fitness tracking application built using a **Microservices Architecture** with **Spring Boot** and **React** . The application allows users to securely log their fitness activities (running, cycling, walking, etc.) and utilizes **Google Gemini AI** to automatically generate personalized health and improvement recommendations asynchronously .

##  Architecture & Core Services
The backend is split into multiple independent microservices that communicate both synchronously (REST/WebClient) and asynchronously (Message Queues).

*   **API Gateway (`port: 8080`):** Acts as the single entry point for the frontend . It routes requests, handles OAuth2 security verification, and intercepts requests to automatically synchronize users from Keycloak to the internal database .
*   **Eureka Server (`port: 8761`):** Service Registry and Discovery server using Spring Cloud Netflix Eureka .
*   **Config Server (`port: 8888`):** Centralized configuration management holding YAML settings for all internal microservices .
*   **User Service (`port: 8081`):** Manages extended user profiles. Uses **PostgreSQL** as the database . 
*   **Activity Service (`port: 8082`):** Tracks and stores user fitness activities using **MongoDB** . It makes a synchronous call to the User Service to validate user existence, then publishes the saved activity to a message queue .
*   **AI Service (`port: 8083`):** Listens to the RabbitMQ queue, consumes new activities, queries the **Google Gemini API** with a custom prompt, and saves JSON-formatted health recommendations into **MongoDB** .
*   **Frontend (`port: 5173`):** A modern React Single Page Application built with Vite, Material UI, Redux, and Axios .

##  Tech Stack
*   **Backend:** Java 23, Spring Boot, Spring Cloud (Gateway, Eureka, Config) .
*   **Frontend:** React, Vite, Redux Toolkit, Material UI .
*   **Databases:** PostgreSQL (Relational), MongoDB (NoSQL).
*   **Messaging:** RabbitMQ (Event-driven asynchronous communication) .
*   **Security:** Keycloak (Identity Provider) implementing OAuth2 with PKCE flow.
*   **AI Integration:** Google Gemini API (Free tier).

##  Key Features
*   **Secure Authentication:** Utilizes OAuth2 Proof Key for Code Exchange (PKCE) flow designed for secure public client logins without storing a client secret on the frontend .
*   **Automated User Sync:** Seamlessly synchronizes new users from Keycloak to the local PostgreSQL database during their first API request via a custom Gateway filter.
*   **Event-Driven AI Recommendations:** Uses RabbitMQ to decouple the activity logging process from AI generation, ensuring the application remains fast and non-blocking .
*   **Structured AI Parsing:** Communicates with the Google Gemini API to return strictly formatted JSON responses containing performance improvements, customized suggestions, and safety guidelines .

##  How to Run Locally

### 1. Prerequisites
*   Java Development Kit (JDK) 23
*   Node.js & npm
*   Docker Desktop (for running Keycloak & RabbitMQ)
*   Google Gemini API Key

### 2. Infrastructure Setup (Docker)
Run the following services using Docker:
*   **Keycloak (Port 8181):**
    ```bash
    docker run -p 8181:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
    ```
    *Create a realm (`fitness-oauth2`), a client (`oauth2-pkce-client` with PKCE `S256` enabled), and a test user .*
*   **RabbitMQ (Ports 5672 & 15672):**
    ```bash
    docker run --rm -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4.0-management
    ```
    *Login to `localhost:15672` (guest/guest) and create a Direct Exchange named `fitness.exchange` .*

### 3. Backend Setup
1. Open the parent directory in IntelliJ IDEA.
2. In `config-server/src/main/resources/config/ai-service.yml`, update the `gemini.api.key` with your Google Gemini API key .
3. Start the services in this strict order:
   *   `config-server` (Port 8888)
   *   `eureka-server` (Port 8761)
   *   `user-service` (Port 8081)
   *   `activity-service` (Port 8082)
   *   `ai-service` (Port 8083)
   *   `api-gateway` (Port 8080)

### 4. Frontend Setup
Navigate to the frontend directory:
```bash
npm install
npm run dev
```
Access the application at http://localhost:5173.
