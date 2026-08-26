FROM node:20-bookworm-slim AS build
WORKDIR /app
RUN corepack enable \
  && corepack prepare pnpm@9.15.3 --activate

COPY . .
RUN pnpm install
RUN pnpm build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
