# Build stage
FROM node:22 AS builder

WORKDIR /app

COPY ../../package*.json ./
RUN npm install

COPY . .

# Build with dynamic API base
ARG REACT_APP_API_BASE

RUN npm run build

# Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
