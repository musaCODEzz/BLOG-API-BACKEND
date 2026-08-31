# Blog API Backend

A production-grade RESTful API for managing blog posts and user authentication, built with **Node.js**, **Express 5**, **TypeScript**, and **MongoDB (Mongoose)**.

---

## 🚀 Features

- **Full Blog CRUD:** Create, Read (all or single post), Update, and Delete blog posts.
- **Author Protection & Authorization:** Posts are automatically tied to the logged-in user. Only the original author can edit or delete their own posts.
- **Populated Relationships:** Blog posts automatically populate author details (`_id`, `name`, `email`).
- **User Authentication:** Registration and login with password hashing via `bcrypt` and JWT issuance (1-hour expiry).
- **Type-Safe Validation:** Defensive validation middleware preventing runtime crashes and bad inputs.
- **Standardized Error Handling:** Consistent PRD-compliant error response format across all endpoints.
- **Interactive Documentation:** Live Swagger/OpenAPI documentation at `/api-docs` and raw schema at `/api-docs.json`.
- **System Monitoring:** Live health check at `/health` with uptime and timestamp.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (v20+)
- **Framework:** Express 5
- **Language:** TypeScript 7
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) + `bcrypt`
- **Documentation:** `swagger-jsdoc` + `swagger-ui-express`
- **HTTP Logger:** `morgan`
- **Dev Tooling:** `tsx` (hot-reload), `typescript` (`tsc`)

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/blog-api-backend.git
   cd blog-api-backend
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

## ▶️ Running the Application

```bash
npm run dev      # Start dev server with hot reload (tsx watch)
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled production server (dist/server.js)
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
| `GET` | `/api/blogs` | ❌ | Retrieve all blog posts with populated author info |
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
│   ├── config/
│   │   ├── db.ts                # MongoDB connection lifecycle
│   │   └── swagger.ts           # Swagger/OpenAPI configuration
│   ├── controllers/
│   │   ├── blog.controller.ts   # Blog CRUD handlers
│   │   └── user.controller.ts   # Auth & user handlers
│   ├── middlewares/
│   │   ├── auth.ts              # JWT verification middleware
│   │   ├── errorHandler.ts      # Global centralized error handler
│   │   ├── validateBlog.ts      # Blog request validation
│   │   └── validateUser.ts      # User request validation
│   ├── models/
│   │   ├── blog.model.ts        # Mongoose Blog schema
│   │   └── user.model.ts        # Mongoose User schema
│   ├── routes/
│   │   ├── blog.routes.ts       # /api/blogs routes & Swagger annotations
│   │   └── user.routes.ts       # /api/users routes & Swagger annotations
│   ├── services/
│   │   ├── blog.service.ts      # Blog database queries & author checks
│   │   └── user.service.ts      # User database queries & password hashing
│   └── server.ts                # Main Express server setup
├── NEXT_STEPS.md                # Actionable roadmap for future enhancements
├── PRD.md                       # Product Requirements Document
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔮 What's Next (Stepwise Roadmap)

For full implementation guides and code snippets, see [NEXT_STEPS.md](file:///Users/musa/Desktop/blog-api-backend/NEXT_STEPS.md).

### **Step 1: Pagination, Search & Sorting**
- Add `page`, `limit`, and `sort` query parameters to `GET /api/blogs`.
- Implement MongoDB text indexing for keyword searches on blog titles/contents.

### **Step 2: Rate Limiting & Security Hardening**
- Add `express-rate-limit` to protect `/api/users/login` and public endpoints against brute-force attacks.
- Add `helmet` for HTTP security headers and MongoDB query sanitization against NoSQL injections.

### **Step 3: Automated Testing Framework**
- Introduce `vitest` + `supertest` for CI/CD test automation covering unit and integration tests.

### **Step 4: Comments & Interaction System**
- Create a `Comment` model to allow authenticated users to comment on blog posts.

### **Step 5: User Profiles & Password Reset**
- Add endpoints for user profiles (`GET /api/users/profile`) and forgot/reset password flows with email verification.

### **Step 6: Dockerization & Cloud Deployment**
- Build multi-stage `Dockerfile` and `docker-compose.yml`.
- Set up CI/CD pipeline via GitHub Actions to deploy to Render, Railway, or AWS.

---

## 📄 License

ISC