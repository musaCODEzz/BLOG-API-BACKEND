# 📋 Next Steps & Future Roadmap: Blog API Backend

Now that the core v1.0 features (Authentication, Authorization, CRUD, Documentation, Error Handling, and Validation) are verified and working, here is the prioritized stepwise roadmap for enhancements, production readiness, and deployment.

---

## 🎯 Step-by-Step Action Plan

```
[Phase 1: Complete ✅]
  ├── User Registration & Login (JWT + bcrypt)
  ├── Full Blog CRUD with Author-Only Permissions
  ├── Populated Relationships (Author object on blogs)
  ├── Single Blog Retrieval (GET /api/blogs/:id)
  └── Standardized Error Format & Swagger Docs

[Phase 2: Next Actions 🚀]
  ├── Step 1: Pagination, Search & Filtering [✅ Completed]
  ├── Step 2: Rate Limiting & Brute-Force Protection [✅ Completed]
  ├── Step 3: Automated Testing Framework (Vitest / Supertest) [✅ Completed]
  ├── Step 4: Security Hardening (Helmet, Mongo Sanitizer, CORS) [✅ Completed]
  ├── Step 5: Comments & Interaction System [✅ Completed]
  ├── Step 6: User Profiles & Password Management [✅ Completed]
  ├── Step 7: Dockerization & Environment Config
  └── Step 8: Cloud Deployment & CI/CD Pipeline
```

---

## Step 1: Pagination, Search & Sorting [✅ COMPLETED]
**Goal:** Prevent large database scans and allow frontend applications to query data efficiently.

### Implemented Endpoints & Features:
- `GET /api/blogs?page=1&limit=10&sort=-createdAt` (Supports dynamic sorting on `createdAt`, `title`, `updatedAt` with ascending/descending `-` prefix)
- `GET /api/blogs?search=react` (Full-text search across `title` and `content` using MongoDB text index)
- **Standardized Response Structure:**
  ```json
  {
    "data": [
      {
        "_id": "...",
        "title": "...",
        "content": "...",
        "author": { "_id": "...", "name": "...", "email": "..." },
        "createdAt": "...",
        "updatedAt": "..."
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

## Step 2: Rate Limiting & Brute-Force Protection [✅ COMPLETED]
**Goal:** Safeguard auth and public endpoints against denial-of-service (DoS) and credential stuffing attacks.

### Implemented Features:
1. **Installed `express-rate-limit`**:
   - Added to dependencies in `package.json`.
2. **Auth Limiter (`authLimiter`)**:
   - Applied to `POST /api/users/register` and `POST /api/users/login` in `user.routes.ts`.
   - Limits: 10 requests per 15-minute window per IP.
   - Status code: `429 Too Many Requests`.
3. **General App Limiter (`generalLimiter`)**:
   - Applied globally in `server.ts` to protect all API routes.
   - Limits: 100 requests per 15-minute window per IP.
   - Standard `RateLimit-*` headers enabled.

---

## Step 3: Automated Testing Suite (Vitest / Supertest) [✅ COMPLETED]
**Goal:** Implement automated unit and integration tests for CI/CD automation without manual Postman clicks.

### Implemented Features:
1. **Vitest + Supertest + MongoMemoryServer**:
   - Automated in-memory database tests running with `npm test` (`vitest run`).
   - Clean state per test using `afterEach` hooks in `tests/setup.ts`.
2. **Test Suites**:
   - `tests/health.test.ts` (Health endpoint check)
   - `tests/user.test.ts` (Registration, duplicate email, invalid login, valid JWT)
   - `tests/blog.test.ts` (Authenticated creation, listing, author-only deletion)

---

## Step 4: Security Hardening [✅ COMPLETED]
**Goal:** Comply with OWASP Top 10 API Security recommendations.

### Implemented Features:
1. **HTTP Security Headers (`helmet`)**:
   - Applied globally in `src/app.ts` (`contentSecurityPolicy: false` to allow interactive Swagger UI rendering).
   - Enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and HSTS.
2. **NoSQL Injection Prevention (`mongoSanitizer`)**:
   - Implemented in `src/middlewares/mongoSanitize.ts`.
   - Recursively scrubs and removes malicious `$` operator keys and `.` dot notation keys from `req.body`, `req.params`, and `req.query`.
3. **CORS Restrictions**:
   - Configured in `src/app.ts` with `origin: process.env.ALLOWED_ORIGINS || "http://localhost:3000"` and `credentials: true`.
4. **Automated Security Tests**:
   - Added `tests/security.test.ts` to automatically verify Helmet headers and NoSQL sanitization.


---

## Step 5: Comments & Interactions System [✅ COMPLETED]
**Goal:** Enable engagement by allowing authenticated users to comment on posts.

### Database Schema (`Comment` Model):
```typescript
{
  content: string;         // Required
  blog: Types.ObjectId;    // Ref -> 'Blog'
  author: Types.ObjectId;  // Ref -> 'User'
  createdAt: Date;
  updatedAt: Date;
}
```

### Endpoints:
- `GET /api/blogs/:blogId/comments` (List comments for a post)
- `POST /api/blogs/:blogId/comments` (Add a comment, Auth required)
- `DELETE /api/blogs/:blogId/comments/:commentId` (Delete comment, Author only)

---

## Step 6: User Profiles & Password Recovery [✅ COMPLETED]
**Goal:** Provide user management and account recovery features.

### Implemented Endpoints & Features:
- `GET /api/users/profile` (Current authenticated user profile with password stripped)
- `GET /api/users/:id/blogs` (Public portfolio of all blogs authored by a specific user)
- `POST /api/users/forgot-password` (Issues a 15-minute cryptographically secure SHA-256 hashed reset token with anti-enumeration protection)
- `POST /api/users/reset-password` (Validates token, updates password via bcrypt, and invalidates token for single-use)

---

## Step 7: Dockerization
**Goal:** Standardize development and production environments across all operating systems.

### 1. Create `Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
ENV PORT=8000
EXPOSE 8000
CMD ["node", "dist/server.js"]
```

### 2. Create `.dockerignore`:
```text
node_modules
dist
.env
.git
```

---

## Step 8: Cloud Deployment & CI/CD
**Goal:** Continuous integration and automated zero-downtime hosting.

### 1. Deployment Providers:
- **Render / Railway / Fly.io:** Simple Node.js hosting with auto-deployment on git push.
- **MongoDB Atlas:** Production cloud database.

### 2. GitHub Actions Workflow (`.github/workflows/ci.yml`):
```yaml
name: CI Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

---

## Step 9: Frontend Integration
**Goal:** Connect your API to a web or mobile client.

- **Stack Suggestions:** Next.js / React / Vue / Flutter
- **Integration Points:**
  - Store JWT in HTTP-only cookies or secure client storage
  - Attach `Authorization: Bearer <token>` via Axios/Fetch interceptor
  - Render blog feed, author tags, and editor forms
