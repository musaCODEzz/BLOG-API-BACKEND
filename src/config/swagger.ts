import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0", // The standard version of Swagger
        info: {
            title: "Blog REST API",
            version: "1.0.0",
            description: `A production-grade, enterprise-hardened Blog REST API built with Express 5 and TypeScript.

### 🔑 How to test protected endpoints:
1. **Register or Login**: Go to **\`POST /api/users/register\`** or **\`POST /api/users/login\`** below.
2. **Get your Token**: Execute the request and copy the **\`token\`** string from the response JSON.
3. **Authorize**: Click the green **Authorize 🔓** button at the top right of this page.
4. **Paste Token**: Paste your token into the Value box and click **Authorize**. *(Swagger will automatically attach 'Bearer ' for you — do NOT type 'Bearer' yourself).*
5. **Test Protected Routes**: You can now test any locked route (such as \`GET /api/users/profile\`, \`POST /api/blogs\`, or \`POST /api/blogs/{blogId}/comments\`) with **"Try it out"**!`,
        },
        servers: [
            {
                url: "https://blog-api-backend-mh0s.onrender.com",
                description: "Production Server (Render)",
            },
            {
                url: "http://localhost:8000",
                description: "Local Development Server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enter your JWT token obtained from POST /api/users/login. Swagger automatically prefixes it with 'Bearer '."
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // This tells Swagger where to look for our routes to document them
    apis: ["./src/routes/*.ts", "./dist/routes/*.js"], 
};

// Compile the configuration
export const swaggerSpec = swaggerJsdoc(options);