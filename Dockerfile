FROM node:18-alpine3.18 as builder

RUN mkdir /app
WORKDIR /app

COPY package.json yarn.lock tsconfig*.json prisma/schema.prisma ./
RUN yarn install

COPY . ./
# options are set in tsconfig but it is best to be explicit
RUN yarn run build --outDir dist/ --sourceMap


FROM node:18-alpine3.16 as setup

RUN mkdir /app
WORKDIR /app

COPY --from=builder \
  /app/package.json /app/yarn.lock /app/tsconfig*.json /app/prisma/schema.prisma ./
# Yarn will not install any package listed in "devDependencies" when NODE_ENV is set to "production"
# to install all modules: "yarn install --production=false"
# Ref: https://classic.yarnpkg.com/lang/en/docs/cli/install/#toc-yarn-install-production-true-false
ENV NODE_ENV production
RUN yarn install

COPY --from=builder /app/dist/ ./dist

FROM node:18-alpine3.16

WORKDIR /usr/app
COPY --from=setup /app ./

LABEL fly_launch_runtime="nodejs"
ENV NODE_ENV production
ENV DATABASE_URL file:/data/database.sqlite

ENV NODE_OPTIONS --enable-source-maps
CMD [ "node", "./dist/scripts/main.js" ]
