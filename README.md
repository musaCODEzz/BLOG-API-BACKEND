# 🚀 Blog REST API Backend

[![CI Pipeline](https://github.com/musaCODEzz/BLOG-API-BACKEND/actions/workflows/ci.yml/badge.svg)](https://github.com/musaCODEzz/BLOG-API-BACKEND/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Render-Live%20Demo-brightgreen?logo=render)](https://blog-api-backend-mh0s.onrender.com/api-docs)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue?logo=docker)](Dockerfile)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue?logo=typescript)](tsconfig.json)
[![Express](https://img.shields.io/badge/Express-5.2-lightgrey?logo=express)](package.json)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-green?logo=mongodb)](package.json)

A production-grade, enterprise-hardened RESTful API for modern blogging and community platforms. Built with **Node.js (v22)**, **Express 5**, **TypeScript**, and **MongoDB (Mongoose)** following clean layered architecture (`Controller -> Service -> Model`).

---

## 🌐 Live Production Deployment

The API is fully deployed in the cloud on **Render** backed by **MongoDB Atlas** and fronted by Cloudflare SSL:

| Resource | URL | Description |
|---|---|---|
| **Base API** | [https://blog-api-backend-mh0s.onrender.com](https://blog-api-backend-mh0s.onrender.com) | Production endpoint root |
| **Interactive Docs** | [https://blog-api-backend-mh0s.onrender.com/api-docs](https://blog-api-backend-mh0s.onrender.com/api-docs) | Live Swagger OpenAPI 3.0 explorer with interactive testing |
| **Health Check** | [https://blog-api-backend-mh0s.onrender.com/health](https://blog-api-backend-mh0s.onrender.com/health) | Uptime and service status monitor |
| **Raw OpenAPI Spec** | [https://blog-api-backend-mh0s.onrender.com/api-docs.json](https://blog-api-backend-mh0s.onrender.com/api-docs.json) | JSON schema for automated client generation |

---

## 🏗️ Architectural Principles

1. **Layered Separation of Concerns:**
   - **Routes (`src/routes/`):** Define HTTP verbs, paths, Swagger specs, and attach middlewares.
   - **Middlewares (`src/middlewares/`):** Handle authentication, validation, sanitization, rate-limiting, and error transformation.
   - **Controllers (`src/controllers/`):** Parse HTTP requests, extract parameters/body, and format standard JSON responses.
   - **Services (`src/services/`):** Encapsulate pure business logic, database queries, and data mutations.
   - **Models (`src/models/`):** Mongoose schemas, TypeScript interfaces, and compound database indexes.
2. **Author-Only Permissions:** A user can only edit or delete blogs and comments that they personally created.
3. **Defense-in-Depth Security:** Multi-layered protection against brute-force attacks, NoSQL query injection, XSS, clickjacking, and unauthorized privilege escalation.

---

## 🛡️ Security & Protection Layers

- **Non-Root Docker Execution:** The production Docker container drops root privileges and runs as the unprivileged `node` user (UID 1000).
- **HTTP Security Headers (`helmet`):** Strict HSTS (`max-age=31536000`), `X-Frame-Options: SAMEORIGIN` (anti-clickjacking), `X-Content-Type-Options: nosniff` (anti-MIME sniffing).
- **NoSQL Injection Sanitization (`mongoSanitizer`):** Recursively inspects `req.body`, `req.params`, and `req.query` to strip malicious MongoDB operator keys (`$gt`, `$ne`, `$where`, etc.).
- **Rate Limiting (`express-rate-limit`):**
  - **Auth Limiter:** Max 10 attempts per 15 minutes per IP on sensitive authentication routes (`/login`, `/register`).
  - **General Limiter:** Max 100 requests per 15 minutes per IP across all general API routes.
- **Password Hashing:** `bcrypt` with salt rounds = 10. Passwords are never stored in plaintext and are stripped from all API outputs.
- **Anti-Enumeration Password Reset:** Password reset requests return identical success messages regardless of whether the email exists, preventing user account discovery.

---

## 🔑 Authentication Workflow

1. **Register a User:** `POST /api/users/register`
2. **Login:** `POST /api/users/login` → Returns a signed JWT token (1-hour lifespan).
3. **Access Protected Endpoints:** Include the token in the `Authorization` header:
   ```http
   Authorization: Bearer <your_jwt_token_here>
   ```

---

## 📖 Complete API Reference

### 1. Authentication & User Management (`/api/users`)

#### `POST /api/users/register`
- **Access:** Public (Rate limited: 10 req / 15 min)
- **Description:** Creates a new user account with a hashed password.
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Responses:**
  - `201 Created`:
    ```json
    {
      "message": "User registered successfully!",
      "user": {
        "_id": "67c75b...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "createdAt": "2026-09-04T..."
      }
    }
    ```
  - `400 Bad Request`: Missing fields or validation error.
  - `409 Conflict`: An account with this email already exists.
  - `429 Too Many Requests`: Rate limit exceeded.

---

#### `POST /api/users/login`
- **Access:** Public (Rate limited: 10 req / 15 min)
- **Description:** Authenticates credentials and issues a signed JSON Web Token.
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Responses:**
  - `200 OK`:
    ```json
    {
      "message": "Login successful!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "_id": "67c75b...",
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    }
    ```
  - `401 Unauthorized`: Invalid email or password.
  - `429 Too Many Requests`: Rate limit exceeded.

---

#### `GET /api/users/profile`
- **Access:** Protected (Requires `Bearer <token>`)
- **Description:** Retrieves the private account profile of the currently logged-in user.
- **Headers:** `Authorization: Bearer <token>`
- **Responses:**
  - `200 OK`:
    ```json
    {
      "message": "User profile fetched successfully!",
      "user": {
        "_id": "67c75b...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "createdAt": "2026-09-04T...",
        "updatedAt": "2026-09-04T..."
      }
    }
    ```
  - `401 Unauthorized`: Token is missing, expired, or invalid.

---

#### `GET /api/users/:id/blogs`
- **Access:** Public
- **Description:** Retrieves all public blog posts authored by a specific user.
- **Parameters:** `id` (path parameter, MongoDB ObjectId of author)
- **Responses:**
  - `200 OK`:
    ```json
    {
      "author": {
        "_id": "67c75b...",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "totalBlogs": 3,
      "blogs": [
        {
          "_id": "67c75c...",
          "title": "My Journey with TypeScript",
          "content": "Article body..."
        }
      ]
    }
    ```
  - `404 Not Found`: Author ID not found or invalid format.

---

#### `POST /api/users/forgot-password`
- **Access:** Public
- **Description:** Initiates account recovery by generating a cryptographically secure 15-minute reset token.
- **Request Body:**
  ```json
  {
    "email": "jane@example.com"
  }
  ```
- **Responses:**
  - `200 OK`:
    ```json
    {
      "message": "If an account with that email exists, a password reset token has been generated.",
      "resetToken": "c4d8e7b..."
    }
    ```

---

#### `POST /api/users/reset-password`
- **Access:** Public
- **Description:** Verifies the reset token, updates the password with a new bcrypt hash, and invalidates the token.
- **Request Body:**
  ```json
  {
    "token": "c4d8e7b...",
    "newPassword": "NewSecurePassword456!"
  }
  ```
- **Responses:**
  - `200 OK`: `{"message": "Password reset successfully. You may now login."}`
  - `400 Bad Request`: Token is invalid, expired, or missing.

---

### 2. Blog Posts Management (`/api/blogs`)

#### `GET /api/blogs`
- **Access:** Public
- **Description:** Retrieves a paginated list of blogs. Supports full-text search across titles and content, plus dynamic multi-field sorting.
- **Query Parameters:**
  - `page` (optional, default: `1`): Page number.
  - `limit` (optional, default: `10`, max: `100`): Results per page.
  - `search` (optional): Search keywords matched against text index on `title` and `content`.
  - `sort` (optional, default: `"-createdAt"`): Sort field. Prefix with `-` for descending (e.g., `-createdAt`, `createdAt`, `-title`, `title`).
- **Example Request:**
  `GET /api/blogs?page=1&limit=10&search=typescript&sort=-createdAt`
- **Responses:**
  - `200 OK`:
    ```json
    {
      "data": [
        {
          "_id": "67c75c...",
          "title": "Scaling Node.js Applications",
          "content": "Full article content...",
          "author": {
            "_id": "67c75b...",
            "name": "Jane Doe",
            "email": "jane@example.com"
          },
          "createdAt": "2026-09-04T...",
          "updatedAt": "2026-09-04T..."
        }
      ],
      "pagination": {
        "total": 45,
        "page": 1,
        "limit": 10,
        "totalPages": 5,
        "hasNextPage": true,
        "hasPrevPage": false
      }
    }
    ```

---

#### `GET /api/blogs/:id`
- **Access:** Public
- **Description:** Retrieves a single blog post by its unique MongoDB ObjectId, with populated author details.
- **Parameters:** `id` (path parameter, 24-character hex string)
- **Responses:**
  - `200 OK`: Returns the blog post object.
  - `404 Not Found`: Blog post does not exist or ID format is invalid.

---

#### `POST /api/blogs`
- **Access:** Protected (Requires `Bearer <token>`)
- **Description:** Creates a new blog post. The author field is automatically extracted from the authenticated user's JWT token.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "title": "Understanding Express 5 Middlewares",
    "content": "Middlewares are functions that have access to the request object..."
  }
  ```
- **Responses:**
  - `201 Created`: Returns newly created blog post.
  - `400 Bad Request`: Missing or empty title/content.
  - `401 Unauthorized`: Missing or invalid token.

---

#### `PUT /api/blogs/:id`
- **Access:** Protected (Author Only)
- **Description:** Updates the title and content of an existing blog post. Only the original author is authorized to modify it.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "title": "Updated Title",
    "content": "Updated content..."
  }
  ```
- **Responses:**
  - `200 OK`: Returns updated blog post.
  - `403 Forbidden`: Authenticated user is not the author of this post.
  - `404 Not Found`: Post does not exist.

---

#### `DELETE /api/blogs/:id`
- **Access:** Protected (Author Only)
- **Description:** Permanently deletes a blog post. Only the original author is authorized.
- **Headers:** `Authorization: Bearer <token>`
- **Responses:**
  - `200 OK`: `{"message": "Blog post successfully deleted."}`
  - `403 Forbidden`: Authenticated user is not the author of this post.
  - `404 Not Found`: Post does not exist.

---

### 3. Comments & Interactions (`/api/blogs/:blogId/comments`)

Comments use a **Parent-Referencing schema** with compound indexing (`{ blog: 1, createdAt: -1 }`) for fast pagination without hitting MongoDB's 16MB document size limit.

#### `GET /api/blogs/:blogId/comments`
- **Access:** Public
- **Description:** Retrieves all comments left on a specific blog post in reverse chronological order (newest first).
- **Parameters:** `blogId` (path parameter)
- **Responses:**
  - `200 OK`:
    ```json
    {
      "data": [
        {
          "_id": "67c76a...",
          "content": "Great explanation of multi-stage Docker builds!",
          "blog": "67c75c...",
          "author": {
            "_id": "67c75b...",
            "name": "Jane Doe",
            "email": "jane@example.com"
          },
          "createdAt": "2026-09-04T...",
          "updatedAt": "2026-09-04T..."
        }
      ],
      "count": 1
    }
    ```
  - `404 Not Found`: Blog post does not exist.

---

#### `POST /api/blogs/:blogId/comments`
- **Access:** Protected (Requires `Bearer <token>`)
- **Description:** Adds a comment to a blog post. Any authenticated user can comment on any post.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "content": "Very clear and helpful walkthrough, thanks!"
  }
  ```
- **Responses:**
  - `201 Created`: Returns the populated comment document.
  - `400 Bad Request`: Empty comment content or invalid ID.
  - `401 Unauthorized`: Missing or invalid token.
  - `404 Not Found`: Blog post does not exist.

---

#### `DELETE /api/blogs/:blogId/comments/:commentId`
- **Access:** Protected (Comment Author Only)
- **Description:** Deletes a comment. Only the original author of the comment is permitted to delete it.
- **Headers:** `Authorization: Bearer <token>`
- **Responses:**
  - `200 OK`: `{"message": "Comment deleted successfully."}`
  - `403 Forbidden`: Not authorized to delete someone else's comment.
  - `404 Not Found`: Comment does not exist.

---

### 4. System Endpoints

#### `GET /health`
- **Description:** Returns uptime, health status, and server timestamp.
- **Response `200 OK`:**
  ```json
  {
    "status": "ok",
    "message": "Blog API is healthy",
    "uptime": 1248.5,
    "timestamp": "2026-09-04T19:46:08.774Z"
  }
  ```

#### `GET /api-docs`
- **Description:** Serves the interactive Swagger UI.

---

## 🛠️ Tech Stack & Dependencies

| Category | Technology | Purpose |
|---|---|---|
| **Runtime** | Node.js (v22 LTS) | High-performance JavaScript execution engine |
| **Language** | TypeScript (v7) | Static type safety and compile-time verification |
| **Framework** | Express (v5.2) | Modern HTTP routing and middleware framework |
| **Database** | MongoDB & Mongoose (v9.9) | Schema modeling, validation, and BSON indexing |
| **Security** | Helmet (v8.3) | HTTP headers protection (HSTS, CSP, X-Frame) |
| **Sanitization** | Custom NoSQL Sanitizer | Recursive stripping of malicious `$` operators |
| **Rate Limiting** | express-rate-limit (v8.7) | DoS & brute-force IP throttling |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) + `bcrypt` | Stateless claims and cryptographic hashing |
| **Documentation** | Swagger JSDoc & Swagger UI Express | OpenAPI 3.0 dynamic documentation |
| **Testing** | Vitest + Supertest + MongoMemoryServer | In-memory isolated integration testing |
| **Containerization**| Docker & Docker Compose | Hardened non-root multi-stage image + local orchestration |
| **CI/CD** | GitHub Actions | Automated lint, build, test, and Docker verification |
| **Cloud Hosting** | Render (Docker Web Service) | Auto-deploying zero-downtime production hosting |

---

## 💻 Local Development Setup

### Option 1: Using Node.js Directly

1. **Clone the repository:**
   ```bash
   git clone https://github.com/musaCODEzz/BLOG-API-BACKEND.git
   cd BLOG-API-BACKEND
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure `.env` file:**
   ```env
   PORT=8000
   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/?appName=BLOG-API
   JWT_SECRET=your_super_secret_jwt_key
   ALLOWED_ORIGINS=http://localhost:3000
   ```
4. **Start the development server (Hot Reloading via `tsx`):**
   ```bash
   npm run dev
   ```

---

### Option 2: Using Docker Compose (Full Stack with Local MongoDB)

No need to install MongoDB locally:

```bash
# Build and start both the API and MongoDB containers in the background
docker compose up -d --build

# View real-time logs
docker compose logs -f

# Check container health status
docker compose ps

# Stop the stack (Data persists in mongo_data volume)
docker compose down
```

---

## 🧪 Automated Testing

The project includes an extensive automated integration test suite powered by **Vitest**, **Supertest**, and **MongoMemoryServer**. Every test runs against an isolated in-memory MongoDB instance with automatic database tear-down between tests:

```bash
# Run all 21 integration tests once
npm test

# Run tests in interactive watch mode
npm run test:watch
```

### Test Suites Covered:
- `tests/health.test.ts` — Verifies uptime and status endpoint.
- `tests/security.test.ts` — Verifies Helmet security headers and NoSQL injection sanitizer.
- `tests/user.test.ts` — Tests registration, password hashing, duplicate email detection, JWT generation, and profile retrieval.
- `tests/blog.test.ts` — Tests blog creation, pagination, author population, and author-only deletion checks.
- `tests/comment.test.ts` — Tests comment creation, listing, intruder-deletion blocking (403), and author deletion (200).

---

## 🚀 CI/CD & Deployment Pipeline

Every push to the `main` branch triggers an automated GitHub Actions pipeline (`.github/workflows/ci.yml`):

1. **Checkout:** Clones the latest code onto a clean Ubuntu runner.
2. **Node 22 Setup:** Installs Node 22 with dependency caching.
3. **Dependencies:** Clean installs via `npm ci`.
4. **Compile:** Runs `npm run build` (`tsc`) to verify type safety.
5. **Test:** Executes all 21 Vitest integration tests (`npm test`).
6. **Docker Check:** Validates that `Dockerfile` compiles cleanly (`docker build`).
7. **Continuous Deployment (CD):** Once the CI check passes (`✅`), **Render** automatically pulls the latest commit, builds the production container, performs a health check, and completes a **zero-downtime deployment**.

---

## 📁 Repository Directory Structure

```text
blog-api-backend/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI automated pipeline
├── src/
│   ├── app.ts                  # Express application configuration & global middlewares
│   ├── server.ts               # Server startup & MongoDB connection lifecycle
│   ├── config/
│   │   ├── db.ts               # Mongoose connection logic
│   │   └── swagger.ts          # Swagger OpenAPI 3.0 specification & server endpoints
│   ├── controllers/
│   │   ├── blog.controller.ts  # HTTP handlers for blog CRUD & search
│   │   ├── comment.controller.ts # HTTP handlers for comment operations
│   │   └── user.controller.ts  # HTTP handlers for auth, profile, and password resets
│   ├── middlewares/
│   │   ├── auth.ts             # JWT extraction & verification middleware
│   │   ├── errorHandler.ts     # Global centralized JSON error handler
│   │   ├── mongoSanitize.ts    # Recursive NoSQL query injection prevention
│   │   ├── rateLimiter.ts      # Auth & general IP rate limiters
│   │   ├── validateBlog.ts     # Blog creation/update input validation
│   │   ├── validateComment.ts  # Comment input & ID validation
│   │   └── validateUser.ts     # User registration input validation
│   ├── models/
│   │   ├── blog.model.ts       # Mongoose Blog schema & text search indexes
│   │   ├── comment.model.ts    # Mongoose Comment schema & compound indexes
│   │   └── user.model.ts       # Mongoose User schema & password hashing
│   ├── routes/
│   │   ├── blog.routes.ts      # /api/blogs route definitions & JSDoc annotations
│   │   ├── comment.routes.ts   # /api/blogs/:blogId/comments sub-routes & Swagger specs
│   │   └── user.routes.ts      # /api/users route definitions & Swagger specs
│   └── services/
│       ├── blog.service.ts     # Blog DB operations, pagination, search, and sorting
│       ├── comment.service.ts  # Comment DB operations & author authorization
│       └── user.service.ts     # User DB operations, password reset tokens
├── tests/
│   ├── setup.ts                # In-memory MongoDB lifecycle hooks for Vitest
│   ├── health.test.ts          # Health check endpoint tests
│   ├── security.test.ts        # Security headers & NoSQL injection tests
│   ├── comment.test.ts         # Comment CRUD & authorization tests
│   ├── user.test.ts            # Auth, profile, and password reset tests
│   └── blog.test.ts            # Blog CRUD & author permission tests
├── Dockerfile                  # Production-hardened multi-stage non-root container
├── docker-compose.yml          # Multi-container orchestration (API + MongoDB 7)
├── .dockerignore               # Build context exclusion filter
├── NEXT_STEPS.md               # Priority-ordered development roadmap
├── PRD.md                      # Product Requirements Document
├── vitest.config.ts            # Vitest testing configuration
├── tsconfig.json               # TypeScript compiler configuration
├── package.json                # Project dependencies and npm scripts
└── README.md                   # Comprehensive project documentation
```

---

## 📄 License

This project is licensed under the **ISC License**.