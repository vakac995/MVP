# Use official Node.js image
FROM node:20-slim

WORKDIR /app

COPY . /app

RUN npm install -g pnpm && pnpm install

EXPOSE 5173

CMD ["pnpm", "dev"]
