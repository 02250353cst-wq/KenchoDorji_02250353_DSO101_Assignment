# Use the lightweight Nginx image
FROM nginx:alpine

# 1. Remove the default Nginx index page
RUN rm -rf /usr/share/nginx/html/*

# 2. Copy your custom nginx config
# Make sure you have the nginx.conf file in your frontend folder!
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 3. Copy all your frontend files (index.html, styles.css, script.js, etc.)
# to the directory Nginx uses to serve web content
COPY . /usr/share/nginx/html

# 4. Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]