# WishCraft AI — Dockerfile for Containerized Deployment
FROM node:20-alpine

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies if needed (app has 0 runtime dependencies)
RUN npm install --production || true

# Copy full application codebase
COPY . .

# Expose internal port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Start production server
CMD ["node", "server.js"]
