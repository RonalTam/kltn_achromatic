FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
COPY nest-cli.json prisma.config.ts tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run prisma:generate && npm run build && npm prune --omit=dev

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY package.json ./
EXPOSE 3001
CMD ["sh", "-c", "npm run prisma:migrate:prod && npm run start:prod"]
