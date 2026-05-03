FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY . .
EXPOSE 3001
CMD sh -c "npx prisma migrate deploy && node server.js"
