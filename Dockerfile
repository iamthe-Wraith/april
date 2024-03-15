FROM node:18.19-alpine
WORKDIR /usr/app

COPY ./ ./

RUN npm install

EXPOSE 3000
CMD ["npm", "start"]