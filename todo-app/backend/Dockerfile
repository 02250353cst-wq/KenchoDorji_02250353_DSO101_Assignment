# backend/Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for tests)
RUN npm install

# Copy all files
COPY . .

# Run tests
RUN npm test

# Expose the app port
EXPOSE 10000

# Start the app
CMD ["npm", "start"]