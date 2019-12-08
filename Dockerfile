FROM node:13-alpine
WORKDIR /usr/src/app
COPY . .
EXPOSE 3005
CMD ["node", "server"]