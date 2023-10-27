FROM node:18.16.0-buster-slim

WORKDIR  /usr/src/app/frontend

COPY ./package.json ./package-lock.json ./

RUN npm i --quiet && npm cache clean --force

COPY . .

RUN npm run build


CMD [ "npm", "run", "preview"]

# CMD [ "npm", "run", "dev" ]

