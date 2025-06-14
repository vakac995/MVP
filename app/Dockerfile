# Use official Node.js image
FROM node:20-slim

WORKDIR /app

# Copy only package.json and pnpm-lock.yaml first for better caching
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install

# Copy the rest of the app source code
COPY . .

EXPOSE 5173

CMD ["pnpm", "dev"]
