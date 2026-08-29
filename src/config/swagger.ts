import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0", // The standard version of Swagger
        info: {
            title: "Blog REST API",
            version: "1.0.0",
            description: "A production-grade Blog API built with Express and TypeScript",
        },
        servers: [
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
    apis: ["./src/routes/*.ts"], 
};

// Compile the configuration
export const swaggerSpec = swaggerJsdoc(options);