FROM node:18.18.2-buster-slim

WORKDIR  /app/node_backend

# COPY ./package.json ./

COPY . .

RUN npm install

EXPOSE 9996

CMD [ "npm", "start"]

