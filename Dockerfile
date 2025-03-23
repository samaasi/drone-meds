FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json ./
COPY cmd ./cmd/

RUN npm install
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_URL=file:/app/data/drone.db

# Create data directory
RUN mkdir -p /app/data

# Initialize and seed database
RUN npx prisma migrate deploy
RUN node -e "const { exec } = require('child_process'); exec('npx prisma db push && node dist/prisma/seed.js', (err, stdout, stderr) => { if (err) console.error(err); console.log(stdout); console.error(stderr); });"

EXPOSE 5005

CMD ["npm", "start"]