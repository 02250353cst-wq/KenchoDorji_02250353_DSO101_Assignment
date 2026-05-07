# --- Stage 1: Build Stage ---
# Using AS (uppercase) to fix the casing warning
FROM node:18-alpine AS build-stage

WORKDIR /app

# Copy only the package file first to optimize build caching
# Using specific name instead of wildcard to avoid path errors
COPY package.json ./

# Install dependencies 
# (Note: if you have a package-lock.json, use 'npm ci' for faster, reliable builds)
RUN npm install

# Copy everything else from your frontend folder
COPY . .

# Create the production build (generates the /dist or /build folder)
RUN npm run build

# --- Stage 2: Production Stage ---
FROM nginx:alpine

# Copy your custom nginx config (make sure nginx.conf exists in your frontend folder!)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from the first stage to nginx
# NOTE: If you use 'Vite', the folder is /app/dist
# NOTE: If you use 'Create React App', the folder is /app/build
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 80 (Standard for Nginx)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]