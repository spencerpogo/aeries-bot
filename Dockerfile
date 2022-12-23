FROM node:lts-bullseye-slim

RUN mkdir /app
WORKDIR /app

# Yarn will not install any package listed in "devDependencies" when NODE_ENV is set to "production"
# to install all modules: "yarn install --production=false"
# Ref: https://classic.yarnpkg.com/lang/en/docs/cli/install/#toc-yarn-install-production-true-false
ENV NODE_ENV production

COPY . .

RUN yarn install

LABEL fly_launch_runtime="nodejs"

ENV DATABASE_URL file:/data/database.sqlite
RUN npx prisma generate && npx prisma migrate deploy

CMD [ "yarn", "start" ]
