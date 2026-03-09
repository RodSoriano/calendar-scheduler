FROM node:latest

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

# Install dependencies and generate Prisma client
RUN npm install
RUN npx prisma generate

COPY . .

EXPOSE 3000

# Run migrations then start the app in dev mode
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:dev"]
