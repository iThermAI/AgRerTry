FROM node:18.18.2-buster-slim

RUN apt update && apt upgrade
RUN apt-get install -y ffmpeg

WORKDIR  /app/node_backend
EXPOSE 9996

COPY ./package.json ./
RUN npm install
COPY . .

CMD [ "npm", "start"]