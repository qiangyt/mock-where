FROM node:8.11.3-stretch

LABEL maintainer="qiangyt@wxcount.com"

WORKDIR /opt/mock-where

RUN npm config set registry https://registry.npm.taobao.org

COPY config ./config
EXPOSE 7007 8000

COPY .babelrc .eslintignore .eslintrc.js .istanbul.yml ./
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
RUN npm install 

COPY src ./src

CMD node src/App.js
#CMD node --inspect=0.0.0.0:9029 src/App.js


