# Use Node.js Alpine
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use legacy-peer-deps to handle eslint version conflict)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_APP_VERSION

# Set environment variables
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_VERSION=${VITE_APP_VERSION}

# Expose port 3000 (Vite dev server)
EXPOSE 3000

# Start the dev server
CMD ["npm", "run", "start"]
