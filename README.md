# Blog API Backend

A production-grade RESTful API for managing blog posts and user authentication, built with **Node.js**, **Express 5**, **TypeScript**, and **MongoDB (Mongoose)**.

---

## 🚀 Features

- **Full Blog CRUD:** Create, Read (all or single post), Update, and Delete blog posts.
- **Pagination, Search & Sorting:** Efficient pagination (`page`, `limit`), full-text search across titles/contents (`search`), and dynamic field sorting (`sort`).
- **Rate Limiting & DoS Protection:** Built-in IP rate limiters on auth routes (`authLimiter`) and global routes (`generalLimiter`).
- **Author Protection & Authorization:** Posts are automatically tied to the logged-in user. Only the original author can edit or delete their own posts.
- **Populated Relationships:** Blog posts automatically populate author details (`_id`, `name`, `email`).
- **User Authentication:** Registration and login with password hashing via `bcrypt` and JWT issuance (1-hour expiry).
- **Type-Safe Validation:** Defensive validation middleware preventing runtime crashes and bad inputs.
- **Standardized Error Handling:** Consistent PRD-compliant error response format across all endpoints.
- **Automated In-Memory Test Suite:** 10 integration tests powered by **Vitest**, **Supertest**, and **MongoMemoryServer** with zero production database pollution.
- **Interactive Documentation:** Live Swagger/OpenAPI documentation at `/api-docs` and raw schema at `/api-docs.json`.
- **System Monitoring:** Live health check at `/health` with uptime and timestamp.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (v20+)
- **Framework:** Express 5
- **Language:** TypeScript 7
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) + `bcrypt`
- **Security:** `express-rate-limit` (DoS & Brute-force protection)
- **Testing:** `vitest`, `supertest`, `mongodb-memory-server`
- **Documentation:** `swagger-jsdoc` + `swagger-ui-express`
- **HTTP Logger:** `morgan`
- **Dev Tooling:** `tsx` (hot-reload), `typescript` (`tsc`)

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/musaCODEzz/BLOG-API-BACKEND.git
   cd BLOG-API-BACKEND
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=8000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?appName=BLOG-API
   JWT_SECRET=your_jwt_secret_key_here
   ```

---

## ▶️ Running & Testing

```bash
# Development server with hot reload
npm run dev

# Compile TypeScript to dist/
npm run build

# Run compiled production server
npm start

# Run automated integration tests (in-memory MongoDB)
npm test

# Run tests in watch mode
npm run test:watch
```

Server URL: **`http://localhost:8000`**

---

## 📚 API Documentation

- **Interactive Swagger UI:** [http://localhost:8000/api-docs](http://localhost:8000/api-docs)
- **Raw OpenAPI JSON Spec:** [http://localhost:8000/api-docs.json](http://localhost:8000/api-docs.json)

---

## 🔌 API Endpoints Summary

### Blog Endpoints (`/api/blogs`)

| Method | Endpoint | Auth Required | Description |
|---|---|:---:|---|
| `GET` | `/api/blogs` | ❌ | Retrieve paginated blogs (`page`, `limit`, `search`, `sort`) |
| `GET` | `/api/blogs/:id` | ❌ | Retrieve a single blog post by ID |
| `POST` | `/api/blogs` | ✅ | Create a new blog post (`title`, `content`) |
| `PUT` | `/api/blogs/:id` | ✅ | Update blog post (author only) |
| `DELETE` | `/api/blogs/:id` | ✅ | Delete blog post (author only) |

### Authentication Endpoints (`/api/users`)

| Method | Endpoint | Auth Required | Description |
|---|---|:---:|---|
| `POST` | `/api/users/register` | ❌ | Register new user account (`name`, `email`, `password`) |
| `POST` | `/api/users/login` | ❌ | Authenticate and receive JWT token (`email`, `password`) |

### System Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health, uptime, and system status |

---

## 🔑 Authentication Guide

1. Register a user via `POST /api/users/register`.
2. Login via `POST /api/users/login` to obtain your JWT token.
3. Include the token in the `Authorization` header on all protected routes:
   ```http
   Authorization: Bearer <your_token_here>
   ```

---

## 📁 Project Structure

```
blog-api-backend/
├── src/
│   ├── app.ts                  # Express application setup & middleware routing
│   ├── server.ts               # Server startup & MongoDB database lifecycle
│   ├── config/
│   │   ├── db.ts               # MongoDB connection lifecycle
│   │   └── swagger.ts          # Swagger/OpenAPI configuration
│   ├── controllers/
│   │   ├── blog.controller.ts  # Blog CRUD handlers
│   │   └── user.controller.ts  # Auth & user handlers
│   ├── middlewares/
│   │   ├── auth.ts             # JWT verification middleware
│   │   ├── errorHandler.ts     # Global centralized error handler
│   │   ├── rateLimiter.ts      # Auth & general IP rate limiters
│   │   ├── validateBlog.ts     # Blog request validation
│   │   └── validateUser.ts     # User request validation
│   ├── models/
│   │   ├── blog.model.ts       # Mongoose Blog schema & full-text index
│   │   └── user.model.ts       # Mongoose User schema
│   ├── routes/
│   │   ├── blog.routes.ts      # /api/blogs routes & Swagger annotations
│   │   └── user.routes.ts      # /api/users routes & Swagger annotations
│   └── services/
│       ├── blog.service.ts     # Blog database queries & pagination/sorting
│       └── user.service.ts     # User database queries & password hashing
├── tests/
│   ├── setup.ts                # In-memory MongoDB lifecycle for test runner
│   ├── health.test.ts          # Health check endpoint tests
│   ├── user.test.ts            # Registration & login integration tests
│   └── blog.test.ts            # Blog CRUD & authorization integration tests
├── NEXT_STEPS.md               # Actionable roadmap for future enhancements
├── PRD.md                      # Product Requirements Document
├── vitest.config.ts            # Vitest testing configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔮 What's Next (Stepwise Roadmap)

For full implementation guides and code snippets, see [NEXT_STEPS.md](file:///Users/musa/Desktop/blog-api-backend/NEXT_STEPS.md).

- **Step 1: Pagination, Search & Sorting** — `[✅ Completed]`
- **Step 2: Rate Limiting & Brute-Force Protection** — `[✅ Completed]`
- **Step 3: Automated Testing Suite (Vitest / Supertest)** — `[✅ Completed]`
- **Step 4: Security Hardening (Helmet, Mongo Sanitizer, CORS)** — `[Next]`
- **Step 5: Comments & Interaction System**
- **Step 6: User Profiles & Password Reset**
- **Step 7: Dockerization & Cloud Deployment**

---

## 📄 License

ISC