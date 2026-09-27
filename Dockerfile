FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run typecheck && npm test && npm run build

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/server ./server
COPY --from=build --chown=node:node /app/app/lib ./app/lib
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/server.js ./server.js
RUN mkdir -p /app/public/uploads && chown -R node:node /app/public/uploads
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "--import", "tsx", "server.js"]
