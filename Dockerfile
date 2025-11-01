# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json .
RUN npm ci
COPY . .
RUN npm run build
RUN npx tsc --project tsconfig.server.json

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
EXPOSE 80
CMD ["node", "server.js"]
