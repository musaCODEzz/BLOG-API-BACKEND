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
  ├── Step 2: Rate Limiting & Brute-Force Protection
  ├── Step 3: Automated Testing Framework (Vitest / Supertest)
  ├── Step 4: Security Hardening (Helmet, Mongo Sanitizer, CORS)
  ├── Step 5: Comments & Interaction System
  ├── Step 6: User Profiles & Password Management
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

## Step 2: Rate Limiting & Brute-Force Protection
**Goal:** Safeguard auth and public endpoints against denial-of-service (DoS) and credential stuffing attacks.

### Actions:
1. Install `express-rate-limit`:
   ```bash
   npm install express-rate-limit
   ```
2. Apply strict rate limits to auth routes (e.g., 5-10 requests per 15 minutes for `/api/users/login`):
   ```typescript
   import rateLimit from "express-rate-limit";

   export const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 10,
     message: { error: "Too many login attempts. Please try again later.", statusCode: 429 }
   });
   ```

---

## Step 3: Automated Testing Suite (Vitest / Supertest)
**Goal:** Implement automated unit and integration tests for CI/CD automation without manual Postman clicks.

### Actions:
1. Install testing dependencies:
   ```bash
   npm install -D vitest supertest @types/supertest mongodb-memory-server
   ```
2. Add a `test` script in `package.json`:
   ```json
   "scripts": {
     "test": "vitest run",
     "test:watch": "vitest"
   }
   ```
3. Create test files in `tests/` matching each route (`user.test.ts`, `blog.test.ts`).

---

## Step 4: Security Hardening
**Goal:** Comply with OWASP Top 10 API Security recommendations.

### Actions:
1. **HTTP Security Headers:** Add `helmet`:
   ```bash
   npm install helmet
   ```
2. **NoSQL Injection Prevention:** Sanitize inputs against MongoDB query selector injections (`$gt`, `$ne`, etc.).
3. **CORS Restrictions:** Restrict `cors({ origin: process.env.ALLOWED_ORIGINS || "http://localhost:3000" })` instead of open wildcard `*` in production.

---

## Step 5: Comments & Interactions System
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

## Step 6: User Profiles & Password Recovery
**Goal:** Provide user management and account recovery features.

### Endpoints:
- `GET /api/users/profile` (Current logged-in user details)
- `GET /api/users/:id/blogs` (All blogs authored by a specific user)
- `POST /api/users/forgot-password` (Issues a time-limited reset token via email)
- `POST /api/users/reset-password` (Sets new password using valid reset token)

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
