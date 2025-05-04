# Step 1: Build the React app
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
COPY .npmrc ./


RUN npm install @rollup/rollup-linux-x64-gnu
RUN npm install --legacy-peer-deps

COPY . .
ARG VITE_API_BASE
ARG VITE_APP_PORT

# Vite automatically picks up VITE_* variables if present during build
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_APP_PORT=$VITE_APP_PORT

RUN npm rebuild lightningcss
RUN npm run build --include=optional

# Step 2: Serve the built app with Nginx
FROM nginx:alpine

# Copy the build output to Nginx's html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace the default nginx config if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]