FROM node:21.6.1

WORKDIR /app

COPY .  .

RUN npm install

EXPOSE 80

CMD [ "node", "Server.js" ]
