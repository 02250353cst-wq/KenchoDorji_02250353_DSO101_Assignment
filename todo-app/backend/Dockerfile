FROM node:18-alpine

# Set the environment to production
ENV NODE_ENV=production

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production
# Copy the rest of the code
# (Ensure you have a .dockerignore file to skip node_modules and .env)
COPY . .

# Render will provide the PORT env var at runtime. 
# Your server.js must use: const PORT = process.env.PORT || 10000;
EXPOSE 10000

CMD ["node", "server.js"]