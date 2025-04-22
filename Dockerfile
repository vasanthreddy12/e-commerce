# Build frontend
FROM node:16-alpine as frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Build backend
FROM node:16-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install --production
COPY server/ ./
COPY --from=frontend-build /app/client/build ./public

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000
CMD ["npm", "start"] 