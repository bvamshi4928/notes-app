FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create uploads directory
RUN mkdir -p src/uploads

# Expose port
EXPOSE 5001

# Start the application
CMD ["node", "src/index.js"]
