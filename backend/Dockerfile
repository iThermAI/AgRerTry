FROM node:18.16.0-buster-slim

WORKDIR  /app/node_backend

COPY ./package.json ./

RUN npm i --quiet && npm cache clean --force

COPY . .

EXPOSE 9996

CMD [ "npm", "start"]

