# Stage 1: Build dependencies
FROM node:20-alpine AS builder

# Install build tools needed for native dependency compilation (e.g., bcrypt)
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy application source files
COPY . .

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy the built application and production dependencies from builder stage
COPY --from=builder /usr/src/app ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
