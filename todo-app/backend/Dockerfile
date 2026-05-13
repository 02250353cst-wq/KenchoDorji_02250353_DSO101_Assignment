# 1. Use the lightweight node image
FROM node:18-alpine

# 2. Set the internal container folder
WORKDIR /app

# 3. Copy the package files
# Note: Since the context is already 'todo-app/backend', 
# this looks for the file directly in that folder.
COPY package.json ./
COPY package-lock.json ./

# 4. Install dependencies
RUN npm install --omit=dev

# 5. Copy the rest of the backend files
COPY . .

# 6. Your app runs on 5000
EXPOSE 5000

# 7. Start the server
CMD ["node", "index.js"]