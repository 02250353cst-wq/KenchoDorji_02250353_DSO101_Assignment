# 1. Use the node image
FROM node:18-alpine

# 2. Create the app directory
WORKDIR /todo-app

# 3. Copy package files 
# Make sure package.json is actually INSIDE the todo-app/backend folder
COPY package*.json ./
# If you don't have a lock file, don't worry about copying it

# 4. Install dependencies
RUN npm install --omit=dev

# 5. Copy the rest of your backend code
COPY . .

# 6. Expose the port your app runs on
EXPOSE 5000

# 7. Start the app
CMD ["node", "index.js"]