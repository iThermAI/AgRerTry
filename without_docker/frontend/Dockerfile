FROM node:18.18.2-buster-slim

WORKDIR  /usr/src/app/frontend

COPY . .

RUN npm install


EXPOSE 4173

RUN npm run build


CMD [ "npm", "run", "preview", "--","--host"]

# CMD [ "npm", "run", "dev" ]

