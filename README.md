# Blog API Backend

A RESTful API for managing blog posts and user authentication, built with Node.js, Express, TypeScript, and MongoDB (Mongoose).

## 🚀 Features

- CRUD operations for blog posts (create, read, update, delete)
- User registration and login with password hashing (bcrypt)
- JWT-based authentication — blog posts can only be created, edited, or deleted by an authenticated user, and only the original author can modify their own post
- Request validation middleware
- Centralized error handling
- Interactive API documentation via Swagger
- Type-safe codebase with TypeScript

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Auth:** JSON Web Tokens (jsonwebtoken) + bcrypt for password hashing
- **Docs:** swagger-jsdoc + swagger-ui-express
- **Logging:** morgan (HTTP request logger)
- **Dev tooling:** tsx (dev server), nodemon

## 📦 Installation

```bash
git clone https://github.com/yourusername/blog-api-backend.git
cd blog-api-backend
npm install
```

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following variables:

```env
PORT=8000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_here
```

> ⚠️ Never commit your real `.env` file. Use a `.env.example` (with placeholder values only) to document required variables for other contributors.

## ▶️ Running the App

```bash
npm run dev      # start dev server with hot reload (tsx watch)
npm run build    # compile TypeScript to dist/
npm start        # run the compiled app (production)
```

Once running, the server is available at:

```
http://localhost:8000
```

## 📚 API Documentation (Swagger)

Interactive API docs are available once the server is running:

```
http://localhost:8000/api-docs
```

Raw OpenAPI JSON spec:

```
http://localhost:8000/api-docs.json
```

## 🔌 API Endpoints

### Blogs — `/api/blogs`

| Method | Endpoint         | Description                          | Auth Required | Body Required |
|--------|------------------|---------------------------------------|:---:|----------------|
| GET    | `/api/blogs`     | Retrieve all blog posts               | ❌ | —              |
| POST   | `/api/blogs`     | Create a new blog post                | ✅ | `title`, `content` |
| PUT    | `/api/blogs/:id` | Update a blog post (author only)      | ✅ | `title`, `content` |
| DELETE | `/api/blogs/:id` | Delete a blog post (author only)      | ✅ | —              |

> `author` is set automatically from the logged-in user's token — it is never sent in the request body.
>
> Routes marked **Auth Required** expect an `Authorization: Bearer <token>` header. `PUT`/`DELETE` additionally return `403 Forbidden` if the logged-in user is not the original author of the post.

### Users / Auth — `/api/users`

| Method | Endpoint               | Description                     | Body Required |
|--------|------------------------|----------------------------------|----------------|
| POST   | `/api/users/register`  | Register a new user              | `name`, `email`, `password` |
| POST   | `/api/users/login`     | Log in and receive a JWT token   | `email`, `password` |

### Health Check

| Method | Endpoint  | Description               |
|--------|-----------|----------------------------|
| GET    | `/health` | Returns API health status |

## 🔑 Authenticating Requests

1. Register a user via `POST /api/users/register`.
2. Log in via `POST /api/users/login` — the response includes a `token`.
3. Include that token on any protected request:
   ```
   Authorization: Bearer <token>
   ```

**In Swagger UI:** click the **Authorize** button at the top of the docs page, paste in just the raw token (no `Bearer` prefix, no quotes), and every protected request tried from the UI will include it automatically.

Tokens expire after 1 hour — log in again via `/api/users/login` to get a new one.

## 🗂️ Data Models

### Blog (`IBlogPost`)

```ts
{
  title: string;         // required
  content: string;       // required
  author: ObjectId;      // required — references a User document, set automatically from the logged-in user
  createdAt: Date;       // auto-generated
  updatedAt: Date;       // auto-generated
}
```

### User (`IUser`)

```ts
{
  name: string;        // required
  email: string;       // required, unique, validated format
  password: string;    // required, min 6 chars, hidden from query results by default
  createdAt: Date;      // auto-generated
  updatedAt: Date;      // auto-generated
}
```

## 📁 Project Structure

```
blog-api-backend/
├── src/
│   ├── config/
│   │   ├── db.ts                # MongoDB connection (connect/disconnect)
│   │   └── swagger.ts           # Swagger/OpenAPI spec configuration
│   ├── controllers/
│   │   ├── blog.controller.ts # Blog CRUD request handlers
│   │   └── user.controller.ts # Register/login request handlers
│   ├── middlewares/
│   │   ├── auth.ts             # JWT auth/route protection middleware
│   │   ├── errorHandler.ts     # Centralized error handling
│   │   ├── validateBlog.ts     # Blog request validation
│   │   └── validateUser.ts     # User request validation
│   ├── models/
│   │   ├── blog.model.ts      # Mongoose Blog schema
│   │   ├── mockData.ts         # Sample/seed blog data
│   │   └── user.model.ts      # Mongoose User schema
│   ├── routes/
│   │   ├── blog.routes.ts     # /api/blogs routes
│   │   └── user.routes.ts     # /api/users routes
│   ├── services/
│   │   ├── blog.service.ts    # Blog business logic (DB operations)
│   │   └── user.service.ts    # User business logic (DB operations)
│   └── server.ts              # App entry point
├── .env                        # Environment variables (not committed)
├── .env.example                 # Template for required env vars
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## 🔒 Security Notes

- Passwords are hashed with `bcrypt` before storage and excluded from query results by default (`select: false` on the schema).
- Blog creation, updates, and deletion all require a valid JWT — enforced by the `requireAuth` middleware.
- Updates and deletes further check that the requesting user is the original author of the post, returning `403 Forbidden` otherwise.
- Environment variables (DB connection string, JWT secret) are kept out of version control via `.gitignore`.

## 📄 License

ISC