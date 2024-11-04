# Start with a Node.js base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json, then install dependencies
COPY package*.json ./
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Expose port 5001
EXPOSE 5001

# Start the Node.js application
CMD ["node", "server.js"]

