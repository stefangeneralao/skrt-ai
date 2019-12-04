FROM node:13-alpine
WORKDIR /usr/src/app
COPY . .
EXPOSE 3004
CMD ["node", "server"]