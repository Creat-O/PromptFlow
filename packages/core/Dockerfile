FROM node:20-alpine AS deps

WORKDIR /app
RUN corepack enable && corepack prepare yarn@4.4.0 --activate

COPY package.json yarn.lock .yarnrc.yml ./
COPY packages/core/package.json packages/core/

RUN yarn workspaces focus @promptflow/core


FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare yarn@4.4.0 --activate
COPY --from=deps /app/ /app/

COPY packages/core/ packages/core/
COPY examples/ examples/
WORKDIR /app/packages/core
RUN yarn build


FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production
WORKDIR /app/packages/core
CMD ["node", "dist/index.js"]
