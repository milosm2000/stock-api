FROM node:alpine
WORKDIR /usr/src/app
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm install
COPY ./src ./src
COPY ./test ./test
# CMD ["node", "./src/server.js"]
CMD ["sh", "-c", "npm run test && node ./src/server.js"]