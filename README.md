# Blog API Backend

A RESTful API for managing blog posts and user authentication, built with Node.js, Express, TypeScript, and MongoDB (Mongoose).

## 🚀 Features

- CRUD operations for blog posts (create, read, update, delete)
- User registration and login with password hashing (bcrypt)
- JWT-based authentication
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

| Method | Endpoint         | Description                          | Body Required |
|--------|------------------|---------------------------------------|----------------|
| GET    | `/api/blogs`     | Retrieve all blog posts               | —              |
| POST   | `/api/blogs`     | Create a new blog post                | `title`, `content`, `author` |
| PUT    | `/api/blogs/:id` | Update an existing blog post by ID    | `title`, `content`, `author` |
| DELETE | `/api/blogs/:id` | Delete a blog post by ID              | —              |

### Users / Auth — `/api/users`

| Method | Endpoint               | Description                     | Body Required |
|--------|------------------------|----------------------------------|----------------|
| POST   | `/api/users/register`  | Register a new user              | `name`, `email`, `password` |
| POST   | `/api/users/login`     | Log in and receive a JWT token   | `email`, `password` |

### Health Check

| Method | Endpoint  | Description               |
|--------|-----------|----------------------------|
| GET    | `/health` | Returns API health status |

## 🗂️ Data Models

### Blog (`IBlogPost`)

```ts
{
  title: string;      // required
  content: string;    // required
  author: string;     // required
  createdAt: Date;    // auto-generated
  updatedAt: Date;    // auto-generated
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
│   │   ├── database.ts        # ⚠️ unused duplicate — safe to delete
│   │   ├── db.ts               # MongoDB connection (connect/disconnect) — used in server.ts
│   │   └── swagger.ts          # Swagger/OpenAPI spec configuration
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

> **Note:** `server.ts` imports from `./config/db.js`, so `database.ts` in `src/config/` is an unused duplicate — safe to delete.

## 🔒 Security Notes

- Passwords are hashed with `bcrypt` before storage and excluded from query results by default (`select: false` on the schema).
- Environment variables (DB connection string, JWT secret) are kept out of version control via `.gitignore`.

## 📄 License

ISC
