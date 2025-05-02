FROM node:20-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Install wait-on for database initialization
RUN npm install -g wait-on

# Copy the rest of the application
COPY . .

# Make init script executable
RUN chmod +x init-db.sh

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 5000

# Start the application with database initialization
CMD ["/bin/bash", "-c", "./init-db.sh && npm start"]