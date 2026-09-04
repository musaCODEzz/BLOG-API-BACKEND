# ==========================================
# Stage 1: Build the TypeScript code
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ==========================================
# Stage 2: Hardened, Non-Root Production Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Ensure files are owned by the unprivileged 'node' user
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node --from=builder /app/dist ./dist

# Drop root privileges and run as 'node'
USER node

ENV PORT=8000
EXPOSE 8000

CMD ["node", "dist/server.js"]
