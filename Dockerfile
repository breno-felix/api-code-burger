FROM node:latest

WORKDIR /usr/src/api

COPY package.json ./
COPY yarn.lock ./
RUN yarn install --production --silent

COPY . .

EXPOSE 3001

CMD ["yarn", "start"]

