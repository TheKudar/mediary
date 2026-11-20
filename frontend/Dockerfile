FROM node:24-alpine AS build
WORKDIR /app/frontend
RUN npm install -g pnpm@10
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY .figma/make/site.json /app/.figma/make/site.json
COPY frontend/ ./
RUN pnpm run build
FROM nginx:alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
