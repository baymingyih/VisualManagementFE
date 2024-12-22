# use latest Node.JS timeline
FROM node:latest

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy all files from current directory to working directory
COPY . .

# Run Prisma Migrations
RUN npx prisma generate --schema prisma/schema_main.prisma
RUN	npx prisma generate --schema prisma/schema_metricdata.prisma

# Build the app
RUN npm run build

# Expose port 8000 for the API service
EXPOSE 8000

# Start the API service
CMD [ "npm", "start" ]
